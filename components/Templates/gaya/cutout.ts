'use client';

import type { BrushMode, InteractiveSegmenter } from '@mediapipe/tasks-vision';
import type { ListSlug } from './data';
import { h, v, type Drawing } from './sheet';

// Pinned to the installed package so the WASM matches the JS.
const WASM =
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.2/wasm';
const MODEL =
  'https://storage.googleapis.com/mediapipe-models/interactive_segmenter_v2/magic_touch/int8/1/interactive_segmentation.task';
const MAX_SIDE = 1024;

// The same frames as the demo pieces, so added pieces hang and stand like them.
const CLOTH = { w: 687, h: 944, cx: 343 };
const SHOE = { w: 804, h: 500, cx: 398, sole: 446, maxW: 740, maxH: 330 };
const PAD = 140;

export interface Cut {
  cut: string;
  shadow?: string;
  thumb: string;
  draw: Drawing;
  cropped?: boolean;
}

type Ctx = CanvasRenderingContext2D;

function canvas(w: number, h: number) {
  const el = document.createElement('canvas');
  el.width = Math.max(1, Math.round(w));
  el.height = Math.max(1, Math.round(h));
  const ctx = el.getContext('2d', { willReadFrequently: true })!;
  ctx.imageSmoothingQuality = 'high';
  return { el, ctx };
}

let cutter: Promise<InteractiveSegmenter> | null = null;

/** Fetches the 30 MB tap-to-select model once, on the first cut. */
export function loadCutter() {
  if (!cutter) {
    cutter = (async () => {
      const { FilesetResolver, InteractiveSegmenter } = await import(
        '@mediapipe/tasks-vision'
      );
      const files = await FilesetResolver.forVisionTasks(WASM);
      return InteractiveSegmenter.createFromOptions(files, {
        baseOptions: { modelAssetPath: MODEL },
      });
    })();
    cutter.catch(() => (cutter = null));
  }
  return cutter;
}

/** The photo on white, no bigger than the model needs. */
export async function readPhoto(file: Blob) {
  const bitmap = await createImageBitmap(file);
  const k = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const { el, ctx } = canvas(bitmap.width * k, bitmap.height * k);
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, el.width, el.height);
  ctx.drawImage(bitmap, 0, 0, el.width, el.height);
  bitmap.close();
  return el;
}

const smooth = (x: number) => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
};

/** Foreground alpha (0 to 255) at photo size for the piece under `at`. */
async function maskAt(photo: HTMLCanvasElement, at: [number, number]) {
  const seg = await loadCutter();
  seg.setImage(photo);
  const corners: [number, number][] = [
    [0.03, 0.03],
    [0.97, 0.03],
    [0.03, 0.97],
    [0.97, 0.97],
  ];
  const away = corners.filter(
    ([x, y]) => Math.hypot(x - at[0], y - at[1]) > 0.2
  );
  const mask = seg.segment([
    {
      brushMode: 1 as BrushMode,
      point: [{ x: at[0], y: at[1] }],
      isCompleted: true,
    },
    ...away.map(([x, y]) => ({
      brushMode: 2 as BrushMode,
      point: [{ x, y }],
      isCompleted: true,
    })),
  ]);
  const mw = mask.width;
  const mh = mask.height;
  const prob = mask.getAsFloat32Array();
  const small = canvas(mw, mh);
  const img = small.ctx.createImageData(mw, mh);
  for (let i = 0; i < mw * mh; i++)
    img.data[i * 4 + 3] = Math.round(smooth((prob[i] - 0.4) / 0.25) * 255);
  mask.close();
  small.ctx.putImageData(img, 0, 0);

  const W = photo.width;
  const H = photo.height;
  const big = canvas(W, H);
  big.ctx.drawImage(small.el, 0, 0, W, H);
  const data = big.ctx.getImageData(0, 0, W, H).data;
  const alpha = new Uint8ClampedArray(W * H);
  for (let i = 0; i < W * H; i++) alpha[i] = data[i * 4 + 3];
  const px = photo
    .getContext('2d', { willReadFrequently: true })!
    .getImageData(0, 0, W, H).data;
  keyEdge(alpha, px, W, H);
  return keepPiece(alpha, W, H, at);
}

/**
 * The model's edge is soft, so bits of wall cling to the piece. In that soft
 * band, pixels that match the nearby background fade out.
 */
function keyEdge(
  alpha: Uint8ClampedArray,
  px: Uint8ClampedArray,
  W: number,
  H: number
) {
  const R = Math.max(6, Math.round(Math.max(W, H) * 0.015));
  const S = W + 1;
  const n = new Float64Array(S * (H + 1));
  const r = new Float64Array(S * (H + 1));
  const g = new Float64Array(S * (H + 1));
  const b = new Float64Array(S * (H + 1));
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      const k = alpha[i] < 8 ? 1 : 0;
      const o = (y + 1) * S + x + 1;
      n[o] = k + n[o - 1] + n[o - S] - n[o - S - 1];
      r[o] = k * px[i * 4] + r[o - 1] + r[o - S] - r[o - S - 1];
      g[o] = k * px[i * 4 + 1] + g[o - 1] + g[o - S] - g[o - S - 1];
      b[o] = k * px[i * 4 + 2] + b[o - 1] + b[o - S] - b[o - S - 1];
    }
  const box = (t: Float64Array, x0: number, y0: number, x1: number, y1: number) =>
    t[y1 * S + x1] - t[y0 * S + x1] - t[y1 * S + x0] + t[y0 * S + x0];
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (alpha[i] === 0 || alpha[i] === 255) continue;
      const x0 = Math.max(0, x - R);
      const y0 = Math.max(0, y - R);
      const x1 = Math.min(W, x + R + 1);
      const y1 = Math.min(H, y + R + 1);
      const c = box(n, x0, y0, x1, y1);
      if (c < 4) continue;
      const d = Math.hypot(
        px[i * 4] - box(r, x0, y0, x1, y1) / c,
        px[i * 4 + 1] - box(g, x0, y0, x1, y1) / c,
        px[i * 4 + 2] - box(b, x0, y0, x1, y1) / c
      );
      alpha[i] = Math.round(alpha[i] * smooth((d - 4) / 12));
    }
}

/** Drops stray blobs: keeps the part under the tap, or the biggest part. */
function keepPiece(
  alpha: Uint8ClampedArray,
  W: number,
  H: number,
  at: [number, number]
) {
  const label = new Int32Array(W * H);
  const sizes = [0];
  const stack: number[] = [];
  for (let start = 0; start < W * H; start++) {
    if (alpha[start] < 128 || label[start]) continue;
    const id = sizes.length;
    let n = 0;
    label[start] = id;
    stack.push(start);
    while (stack.length) {
      const i = stack.pop()!;
      n++;
      const x = i % W;
      const near = [
        x > 0 ? i - 1 : -1,
        x < W - 1 ? i + 1 : -1,
        i - W,
        i + W,
      ];
      for (const j of near)
        if (j >= 0 && j < W * H && !label[j] && alpha[j] >= 128) {
          label[j] = id;
          stack.push(j);
        }
    }
    sizes.push(n);
  }
  if (sizes.length === 1) return null;

  const tx = Math.round(at[0] * (W - 1));
  const ty = Math.round(at[1] * (H - 1));
  let keep = label[ty * W + tx];
  if (!keep) keep = sizes.indexOf(Math.max(...sizes.slice(1)));
  if (sizes[keep] < W * H * 0.01) return null;

  // Grow the kept part by 2 px so its soft edge survives.
  let grown = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) grown[i] = label[i] === keep ? 1 : 0;
  for (let pass = 0; pass < 2; pass++) {
    const next = grown.slice();
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        const i = y * W + x;
        if (grown[i]) continue;
        if (
          (x > 0 && grown[i - 1]) ||
          (x < W - 1 && grown[i + 1]) ||
          (y > 0 && grown[i - W]) ||
          (y < H - 1 && grown[i + W])
        )
          next[i] = 1;
      }
    grown = next;
  }
  for (let i = 0; i < W * H; i++) if (!grown[i]) alpha[i] = 0;
  return alpha;
}

/** The photo with its background removed, edge colours pulled in from the piece so no halo shows. */
function lift(photo: HTMLCanvasElement, alpha: Uint8ClampedArray) {
  const W = photo.width;
  const H = photo.height;
  const out = canvas(W, H);
  out.ctx.drawImage(photo, 0, 0);
  const img = out.ctx.getImageData(0, 0, W, H);
  const d = img.data;
  const src = d.slice();
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      const a = alpha[i];
      d[i * 4 + 3] = a;
      if (a === 0 || a === 255) continue;
      let r = 0;
      let g = 0;
      let b = 0;
      let n = 0;
      for (let dy = -3; dy <= 3; dy++)
        for (let dx = -3; dx <= 3; dx++) {
          const xx = x + dx;
          const yy = y + dy;
          if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
          const j = yy * W + xx;
          if (alpha[j] < 250) continue;
          r += src[j * 4];
          g += src[j * 4 + 1];
          b += src[j * 4 + 2];
          n++;
        }
      if (n) {
        d[i * 4] = r / n;
        d[i * 4 + 1] = g / n;
        d[i * 4 + 2] = b / n;
      }
    }
  out.ctx.putImageData(img, 0, 0);
  return out.el;
}

interface Box {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

/** True when the piece is cut off by the bottom or a side of the photo. */
function runsOff(alpha: ArrayLike<number>, W: number, H: number) {
  let bottom = 0;
  let left = 0;
  let right = 0;
  for (let x = 0; x < W; x++) if (alpha[(H - 1) * W + x] > 128) bottom++;
  for (let y = 0; y < H; y++) {
    if (alpha[y * W] > 128) left++;
    if (alpha[y * W + W - 1] > 128) right++;
  }
  return bottom > W * 0.04 || left > H * 0.04 || right > H * 0.04;
}

function boxOf(alpha: ArrayLike<number>, W: number, H: number, min = 24) {
  let x0 = W;
  let y0 = H;
  let x1 = -1;
  let y1 = -1;
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++)
      if (alpha[y * W + x] > min) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
  return x1 < 0 ? null : { x0, y0, x1, y1 };
}

/** Opaque run of a row, as [first, last], or null. */
function runOf(alpha: ArrayLike<number>, W: number, y: number) {
  let a = -1;
  let b = -1;
  for (let x = 0; x < W; x++)
    if (alpha[y * W + x] > 128) {
      if (a < 0) a = x;
      b = x;
    }
  return a < 0 ? null : ([a, b] as const);
}

function firstDown(alpha: ArrayLike<number>, W: number, H: number, x: number) {
  for (let y = 0; y < H; y++) if (alpha[y * W + x] > 128) return y;
  return H - 1;
}

function lastDown(alpha: ArrayLike<number>, W: number, H: number, x: number) {
  for (let y = H - 1; y >= 0; y--) if (alpha[y * W + x] > 128) return y;
  return 0;
}

/** The hook of a hanger shows as a thin first few rows. */
function hasHook(alpha: Uint8ClampedArray, W: number, box: Box) {
  const bw = box.x1 - box.x0 + 1;
  const bh = box.y1 - box.y0 + 1;
  let widest = 0;
  let centre = 0;
  for (let y = box.y0; y < box.y0 + Math.max(3, bh * 0.035); y++) {
    const run = runOf(alpha, W, y);
    if (run && run[1] - run[0] > widest) {
      widest = run[1] - run[0];
      centre = (run[0] + run[1]) / 2;
    }
  }
  return widest < bw * 0.14 ? centre : null;
}

function drawHook(g: Ctx, to: number) {
  const path = new Path2D();
  path.arc(CLOTH.cx, 22, 17, Math.PI * 0.92, Math.PI * 2.1);
  path.quadraticCurveTo(362, 46, CLOTH.cx + 2, 56);
  path.lineTo(CLOTH.cx, to);
  g.lineCap = 'round';
  g.lineJoin = 'round';
  g.strokeStyle = '#8C877F';
  g.lineWidth = 4.5;
  g.stroke(path);
  g.save();
  g.translate(-0.9, -0.9);
  g.strokeStyle = 'rgba(240, 236, 228, 0.85)';
  g.lineWidth = 1.3;
  g.stroke(path);
  g.restore();
}

function woodBar(g: Ctx, x0: number, x1: number, y: number) {
  const grad = g.createLinearGradient(0, y, 0, y + 12);
  grad.addColorStop(0, '#D2B184');
  grad.addColorStop(1, '#A87E50');
  g.fillStyle = grad;
  g.beginPath();
  g.roundRect(x0, y, x1 - x0, 12, 4);
  g.fill();
}

function clip(g: Ctx, x: number, y: number) {
  g.fillStyle = '#3A3733';
  g.beginPath();
  g.roundRect(x - 5, y, 10, 24, 2);
  g.fill();
  g.fillStyle = 'rgba(255, 255, 255, 0.25)';
  g.fillRect(x - 3, y + 3, 1.5, 17);
}

function shadowOf(frame: HTMLCanvasElement) {
  const sil = canvas(CLOTH.w, CLOTH.h);
  sil.ctx.drawImage(frame, 0, 0);
  sil.ctx.globalCompositeOperation = 'source-in';
  sil.ctx.fillStyle = 'rgb(60, 45, 30)';
  sil.ctx.fillRect(0, 0, CLOTH.w, CLOTH.h);
  // Shrinking and growing again blurs without ctx.filter, which older Safari lacks.
  const tiny = canvas(CLOTH.w / 16, CLOTH.h / 16);
  tiny.ctx.drawImage(sil.el, 0, 0, tiny.el.width, tiny.el.height);
  const out = canvas((CLOTH.w + PAD * 2) / 2, (CLOTH.h + PAD * 2) / 2);
  out.ctx.globalAlpha = 0.42;
  out.ctx.drawImage(
    tiny.el,
    (PAD + 52) / 2,
    (PAD + 78) / 2,
    CLOTH.w / 2,
    CLOTH.h / 2
  );
  // The garment multiplies over its shadow, so the shadow keeps clear of it like the demo ones.
  out.ctx.globalAlpha = 1;
  out.ctx.globalCompositeOperation = 'destination-out';
  out.ctx.drawImage(frame, PAD / 2, PAD / 2, CLOTH.w / 2, CLOTH.h / 2);
  return out.el.toDataURL('image/webp', 0.8);
}

function thumbOf(frame: HTMLCanvasElement, w: number) {
  const out = canvas(w, (frame.height / frame.width) * w);
  out.ctx.drawImage(frame, 0, 0, out.el.width, out.el.height);
  return out.el.toDataURL('image/webp', 0.82);
}

/** Mean colour of the piece between two heights, as fractions of its box. */
function meanColour(
  px: Uint8ClampedArray,
  alpha: Uint8ClampedArray,
  W: number,
  box: Box,
  from: number,
  to: number
) {
  const bh = box.y1 - box.y0 + 1;
  const sum = [0, 0, 0];
  let n = 0;
  for (let y = Math.round(box.y0 + bh * from); y <= box.y0 + bh * to; y++)
    for (let x = box.x0; x <= box.x1; x++) {
      const i = y * W + x;
      if (alpha[i] < 200) continue;
      sum[0] += px[i * 4];
      sum[1] += px[i * 4 + 1];
      sum[2] += px[i * 4 + 2];
      n++;
    }
  return n ? sum.map((c) => c / n) : null;
}

/** Trousers photographed on a clip hanger whose wire hook got lost: the top band isn't the fabric. */
function ownBar(piece: HTMLCanvasElement, alpha: Uint8ClampedArray, box: Box) {
  const W = piece.width;
  const px = piece
    .getContext('2d', { willReadFrequently: true })!
    .getImageData(0, 0, W, piece.height).data;
  const top = meanColour(px, alpha, W, box, 0, 0.025);
  const body = meanColour(px, alpha, W, box, 0.12, 0.3);
  if (!top || !body) return false;
  return Math.hypot(top[0] - body[0], top[1] - body[1], top[2] - body[2]) > 45;
}

function clothes(piece: HTMLCanvasElement, alpha: Uint8ClampedArray, box: Box, slug: ListSlug): Cut {
  const W = piece.width;
  const bw = box.x1 - box.x0 + 1;
  const bh = box.y1 - box.y0 + 1;
  const hook = hasHook(alpha, W, box);
  const bottoms = slug === 'bottoms';
  const barred = hook === null && bottoms && ownBar(piece, alpha, box);
  const maxW = bottoms ? 470 : 600;
  const floor = bottoms ? 850 : 800;

  let s: number;
  let dx: number;
  let dy: number;
  let neck = 0;
  if (hook !== null) {
    s = Math.min(maxW / bw, (floor - 3) / bh);
    dx = CLOTH.cx - (hook - box.x0) * s;
    dy = 3;
  } else if (bottoms) {
    dy = barred ? 80 : 96;
    s = Math.min(maxW / bw, (floor - dy) / bh);
    dx = CLOTH.cx - (bw * s) / 2;
  } else {
    // Hang it so the back of the collar sits just under the hook.
    const mid = Math.round((box.x0 + box.x1) / 2);
    const dip = firstDown(alpha, W, piece.height, mid) - box.y0;
    s = Math.min(maxW / bw, (floor - 50) / bh);
    dy = Math.max(50, 76 - dip * s);
    s = Math.min(s, (floor - dy) / bh);
    dy = Math.max(50, 76 - dip * s);
    dx = CLOTH.cx - (bw * s) / 2;
    neck = dy + dip * s + 6;
  }

  const layer = canvas(CLOTH.w, CLOTH.h);
  layer.ctx.drawImage(piece, box.x0, box.y0, bw, bh, dx, dy, bw * s, bh * s);
  const a = layer.ctx.getImageData(0, 0, CLOTH.w, CLOTH.h).data;
  const al = new Uint8ClampedArray(CLOTH.w * CLOTH.h);
  for (let i = 0; i < al.length; i++) al[i] = a[i * 4 + 3];

  const frame = canvas(CLOTH.w, CLOTH.h);
  const g = frame.ctx;
  const gx0 = Math.round(dx);
  const gx1 = Math.round(dx + bw * s);
  if (hook === null && !bottoms) drawHook(g, neck);
  if (barred) drawHook(g, 84);
  if (hook === null && bottoms && !barred) {
    const run = runOf(al, CLOTH.w, Math.round(dy + 6)) ?? [gx0, gx1];
    drawHook(g, 82);
    woodBar(g, run[0] - 14, run[1] + 14, 80);
  }
  g.drawImage(layer.el, 0, 0);
  if (hook === null && bottoms && !barred) {
    const run = runOf(al, CLOTH.w, Math.round(dy + 6)) ?? [gx0, gx1];
    const span = run[1] - run[0];
    clip(g, run[0] + span * 0.14, 86);
    clip(g, run[1] - span * 0.14, 86);
  }

  return {
    cut: frame.el.toDataURL('image/webp', 0.86),
    shadow: shadowOf(frame.el),
    thumb: thumbOf(frame.el, 172),
    draw: clothesLines(al, slug, gx0, gx1),
  };
}

function clothesLines(
  al: Uint8ClampedArray,
  slug: ListSlug,
  gx0: number,
  gx1: number
): Drawing {
  const W = CLOTH.w;
  const H = CLOTH.h;
  const gw = gx1 - gx0;
  const box = boxOf(al, W, H, 128)!;
  let top = box.y0;
  for (let y = box.y0; y < box.y1; y++) {
    const run = runOf(al, W, y);
    if (run && run[1] - run[0] > gw * 0.3) {
      top = y;
      break;
    }
  }
  const hem = box.y1;
  const across = (y: number) => {
    let l = CLOTH.cx;
    let r = CLOTH.cx;
    while (l > 0 && al[y * W + l - 1] > 128) l--;
    while (r < W - 1 && al[y * W + r + 1] > 128) r++;
    return [l, r] as const;
  };
  const at = Math.max(14, box.x0 - 26);

  if (slug === 'bottoms') {
    const y = Math.round(top + (hem - top) * 0.05);
    const [l, r] = across(y);
    const sx = l + 4;
    const low = runOf(al, W, hem - 4) ?? [l, r];
    const hx = low[0] + 4;
    return {
      dims: [
        h(y, l, r),
        v(at, [sx, firstDown(al, W, H, sx)], [hx, lastDown(al, W, H, hx)]),
      ],
      dots: [],
    };
  }

  const y = Math.round(top + (hem - top) * 0.36);
  let [l, r] = across(y);
  if (r - l > gw * 0.86) {
    l = Math.round(CLOTH.cx - gw * 0.31);
    r = Math.round(CLOTH.cx + gw * 0.31);
  }
  const sx = Math.round(CLOTH.cx - gw * 0.12);
  const hx = l + 8;
  return {
    dims: [
      h(y, l, r),
      v(at, [sx, firstDown(al, W, H, sx)], [hx, lastDown(al, W, H, hx)]),
    ],
    dots: [],
  };
}

function shoes(piece: HTMLCanvasElement, alpha: Uint8ClampedArray, box: Box): Cut {
  const W = piece.width;
  const H = piece.height;
  const bw = box.x1 - box.x0 + 1;
  const bh = box.y1 - box.y0 + 1;
  // The heel side stands taller; the demo shoes have the heel on the left.
  const topIn = (from: number, to: number) => {
    let best = H;
    for (let x = Math.round(from); x < to; x++)
      best = Math.min(best, firstDown(alpha, W, H, x));
    return best;
  };
  const edge = bw * 0.22;
  const flip = topIn(box.x1 - edge, box.x1) < topIn(box.x0, box.x0 + edge);

  const s = Math.min(SHOE.maxW / bw, SHOE.maxH / bh);
  const w = bw * s;
  const hh = bh * s;
  const frame = canvas(SHOE.w, SHOE.h);
  const g = frame.ctx;
  g.save();
  if (flip) {
    g.translate(SHOE.w, 0);
    g.scale(-1, 1);
  }
  g.drawImage(piece, box.x0, box.y0, bw, bh, SHOE.cx - w / 2, SHOE.sole - hh, w, hh);
  g.restore();

  const a = g.getImageData(0, 0, SHOE.w, SHOE.h).data;
  const al = new Uint8ClampedArray(SHOE.w * SHOE.h);
  for (let i = 0; i < al.length; i++) al[i] = a[i * 4 + 3];
  const b = boxOf(al, SHOE.w, SHOE.h, 128)!;
  const span = b.x1 - b.x0;
  let heelX = b.x0;
  let heelY = SHOE.h;
  for (let x = b.x0; x < b.x0 + span * 0.3; x++) {
    const y = firstDown(al, SHOE.w, SHOE.h, x);
    if (y < heelY) {
      heelY = y;
      heelX = x;
    }
  }
  const lowY = (x: number) => lastDown(al, SHOE.w, SHOE.h, x);
  return {
    cut: frame.el.toDataURL('image/webp', 0.86),
    thumb: thumbOf(frame.el, 220),
    draw: {
      dims: [
        h(
          Math.min(490, b.y1 + 22),
          b.x0 + 4,
          b.x1 - 4,
          lowY(b.x0 + 4) - 6,
          lowY(b.x1 - 4) - 6
        ),
        v(Math.max(10, b.x0 - 22), [heelX, heelY], [b.x0 + 4, lowY(b.x0 + 4)]),
      ],
      dots: [],
    },
  };
}

// Where a piece usually is in a photo of it, tried in turn until one isn't the backdrop.
const GUESSES: Record<ListSlug, [number, number][]> = {
  tops: [
    [0.5, 0.45],
    [0.5, 0.32],
    [0.4, 0.55],
  ],
  bottoms: [
    [0.5, 0.3],
    [0.42, 0.55],
    [0.58, 0.55],
  ],
  shoes: [
    [0.5, 0.55],
    [0.4, 0.6],
    [0.6, 0.5],
  ],
};

/** Fills most of the photo or reaches three of its sides: the wall, not the piece. */
function isBackdrop(alpha: ArrayLike<number>, W: number, H: number) {
  let on = 0;
  for (let i = 0; i < W * H; i++) if (alpha[i] > 128) on++;
  if (on > W * H * 0.55) return true;
  let top = 0;
  let bottom = 0;
  let left = 0;
  let right = 0;
  for (let x = 0; x < W; x++) {
    if (alpha[x] > 128) top++;
    if (alpha[(H - 1) * W + x] > 128) bottom++;
  }
  for (let y = 0; y < H; y++) {
    if (alpha[y * W] > 128) left++;
    if (alpha[y * W + W - 1] > 128) right++;
  }
  const sides =
    Number(top > W * 0.1) +
    Number(bottom > W * 0.1) +
    Number(left > H * 0.1) +
    Number(right > H * 0.1);
  return sides >= 3;
}

/**
 * Cuts the piece out of the photo and hangs it like the demo pieces. `at`
 * (0 to 1 across the photo) is where the owner tapped; without it the usual
 * spots are tried. Null when nothing could be picked out.
 */
export async function cutOut(
  photo: HTMLCanvasElement,
  slug: ListSlug,
  at?: [number, number] | null
): Promise<Cut | null> {
  let alpha: Uint8ClampedArray | null = null;
  for (const point of at ? [at] : GUESSES[slug]) {
    const next = await maskAt(photo, point);
    if (next && !isBackdrop(next, photo.width, photo.height)) {
      alpha = next;
      break;
    }
  }
  if (!alpha) return null;
  const box = boxOf(alpha, photo.width, photo.height);
  if (!box) return null;
  const piece = lift(photo, alpha);
  const made =
    slug === 'shoes'
      ? shoes(piece, alpha, box)
      : clothes(piece, alpha, box, slug);
  return { ...made, cropped: runsOff(alpha, photo.width, photo.height) };
}
