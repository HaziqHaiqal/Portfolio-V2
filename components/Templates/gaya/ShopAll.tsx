'use client';

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { rm, useBag } from '@components/Templates/Bag';
import {
  bagProduct,
  hrefOf,
  hungOf,
  imageOf,
  ITEMS,
  listBySlug,
  listHref,
  LOW_STOCK,
  shadowOf,
  stockKey,
  variantOf,
  type Item,
  type List,
} from './data';
import { useStockLeft } from './orders';
import { fitLine } from './sheet';

const TOPS = listBySlug('tops');
const BOTTOMS = listBySlug('bottoms');
const SHOES = listBySlug('shoes');
const ROPE_Y = 22;
const SAG = 14;

const numberOf = (item: Item) =>
  `No. ${String(ITEMS.indexOf(item) + 1).padStart(2, '0')}`;

type Picked = { item: Item; el: HTMLElement; keyboard: boolean };
type Pick = (item: Item, el: HTMLElement, keyboard: boolean) => void;

function Rope() {
  const ref = useRef<SVGSVGElement>(null);
  const [w, setW] = useState(2400);
  const uid = useId().replace(/:/g, '');

  useLayoutEffect(() => {
    const box = ref.current?.parentElement;
    if (!box) return;
    const sync = () => setW(Math.max(1, Math.round(box.offsetWidth)));
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  const d = `M0 ${ROPE_Y} Q${w / 2} ${ROPE_Y + 2 * SAG} ${w} ${ROPE_Y}`;
  return (
    <svg
      ref={ref}
      className="gaya-amp-rope"
      width={w}
      height="80"
      viewBox={`0 0 ${w} 80`}
      aria-hidden="true"
    >
      <defs>
        <filter id={`${uid}b`} x="-5%" y="-200%" width="110%" height="500%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
        <pattern
          id={`${uid}t`}
          width="3.6"
          height="3.6"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(58)"
        >
          <rect width="3.6" height="3.6" fill="#A8977E" />
          <rect width="1.5" height="3.6" fill="#7A6A54" />
        </pattern>
      </defs>
      <path
        d={d}
        transform="translate(22 30)"
        stroke="rgba(70, 52, 34, 0.22)"
        strokeWidth="4"
        filter={`url(#${uid}b)`}
      />
      <path d={d} stroke={`url(#${uid}t)`} strokeWidth="3.4" />
      <path
        d={d}
        transform="translate(0 -0.9)"
        stroke="rgba(236, 228, 214, 0.75)"
        strokeWidth="0.8"
      />
    </svg>
  );
}

function Row({
  list,
  onScroll,
  children,
}: {
  list: List;
  onScroll: () => void;
  children: ReactNode;
}) {
  const name = list.slug;
  const count = list.items.length;
  const track = useRef<HTMLDivElement>(null);
  const edges = useRef('start');
  const [edge, setEdge] = useState('start');
  const drag = useRef({ on: false, moved: false, x: 0, left: 0, last: 0, t: 0, v: 0, raf: 0 });

  const measure = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const next =
      max <= 2
        ? 'none'
        : el.scrollLeft <= 2
          ? 'start'
          : el.scrollLeft >= max - 2
            ? 'end'
            : 'middle';
    if (next !== edges.current) {
      edges.current = next;
      setEdge(next);
    }
  }, []);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    const d = drag.current;
    return () => {
      observer.disconnect();
      cancelAnimationFrame(d.raf);
    };
  }, [measure]);

  const nudge = (dir: number) => {
    const el = track.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.6, behavior: 'smooth' });
  };

  const down = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    const d = drag.current;
    cancelAnimationFrame(d.raf);
    Object.assign(d, {
      on: true,
      moved: false,
      x: e.clientX,
      left: e.currentTarget.scrollLeft,
      last: e.clientX,
      t: performance.now(),
      v: 0,
    });
  };

  const move = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d.on) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) > 6) {
      d.moved = true;
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    if (!d.moved) return;
    e.currentTarget.scrollLeft = d.left - dx;
    const now = performance.now();
    d.v = (e.clientX - d.last) / Math.max(1, now - d.t);
    d.last = e.clientX;
    d.t = now;
  };

  const up = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d.on) return;
    d.on = false;
    if (!d.moved) return;
    setTimeout(() => (d.moved = false), 0);
    const el = e.currentTarget;
    let speed = -d.v * 16;
    const glide = () => {
      if (Math.abs(speed) < 0.4) return;
      el.scrollLeft += speed;
      speed *= 0.93;
      d.raf = requestAnimationFrame(glide);
    };
    glide();
  };

  const swallowClick = (e: ReactMouseEvent) => {
    if (drag.current.moved) {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  return (
    <div className={`gaya-amp-row is-${name}`} data-edge={edge}>
      <div
        ref={track}
        className="gaya-amp-track"
        onScroll={() => {
          measure();
          onScroll();
        }}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onClickCapture={swallowClick}
      >
        <div
          className="gaya-amp-line"
          style={{ '--n1': count + 1 } as CSSProperties}
        >
          {children}
        </div>
      </div>
      <Link
        href={listHref(list.slug)}
        className="gaya-amp-label"
        aria-label={`See all ${count} ${list.name.toLowerCase()}`}
        draggable={false}
      >
        <b>{list.name}</b>
        <span>
          {count} {list.unit}
          <i aria-hidden="true"> · </i>
          <u>See all</u>
        </span>
      </Link>
      <button
        type="button"
        className="gaya-amp-arrow is-back"
        aria-label={`Scroll ${name} back`}
        onClick={() => nudge(-1)}
      >
        <ChevronLeft size={18} aria-hidden="true" />
      </button>
      <button
        type="button"
        className="gaya-amp-arrow is-next"
        aria-label={`Scroll ${name} further`}
        onClick={() => nudge(1)}
      >
        <ChevronRight size={18} aria-hidden="true" />
      </button>
    </div>
  );
}

function Hung({
  item,
  index,
  count,
  dim,
  open,
  eager = false,
  onPick,
}: {
  item: Item;
  index: number;
  count: number;
  dim: boolean;
  open: boolean;
  eager?: boolean;
  onPick: Pick;
}) {
  const loading = eager ? 'eager' : 'lazy';
  const [swing, setSwing] = useState<{ n: number; dir: 'l' | 'r' } | null>(
    null
  );
  const t = (index + 1) / (count + 1);
  return (
    <div
      className="gaya-amp-piece"
      data-dim={dim}
      style={{ '--i': index + 1, '--k': 4 * t * (1 - t) } as CSSProperties}
    >
      <div
        className="gaya-amp-swing"
        style={swing ? { animationName: `gaya-sw-${swing.dir}${swing.n % 2}` } : undefined}
      >
        <Image
          src={shadowOf(item.id)}
          alt=""
          width={967}
          height={1224}
          unoptimized
          loading={loading}
          draggable={false}
          className="gaya-amp-shadow"
        />
        <Image
          src={hungOf(item.id)}
          alt=""
          width={687}
          height={944}
          unoptimized
          loading={loading}
          draggable={false}
          className="gaya-amp-cloth"
        />
      </div>
      <button
        type="button"
        className="gaya-amp-hit"
        aria-label={`${item.name}, ${item.colour}, ${rm(item.price)}`}
        aria-expanded={open}
        onPointerEnter={(e) => {
          if (e.pointerType !== 'mouse') return;
          const box = e.currentTarget.getBoundingClientRect();
          const dir = e.clientX < box.left + box.width / 2 ? 'l' : 'r';
          setSwing((s) => ({ n: (s?.n ?? 0) + 1, dir }));
        }}
        onClick={(e) =>
          onPick(item, e.currentTarget.parentElement!, e.detail === 0)
        }
      />
    </div>
  );
}

function Shoe({
  item,
  index,
  dim,
  open,
  onPick,
}: {
  item: Item;
  index: number;
  dim: boolean;
  open: boolean;
  onPick: Pick;
}) {
  const [rock, setRock] = useState(0);
  return (
    <div
      className="gaya-amp-slot"
      data-dim={dim}
      style={{ '--i': index + 1 } as CSSProperties}
    >
      <span className="gaya-amp-contact" aria-hidden="true" />
      <div className="gaya-amp-land">
        <div className="gaya-amp-step">
          <div
            className="gaya-amp-rock"
            style={rock ? { animationName: `gaya-rock${rock % 2}` } : undefined}
          >
            <Image
              src={imageOf(item.id)}
              alt=""
              width={804}
              height={500}
              unoptimized
              draggable={false}
              className="gaya-amp-shoe"
            />
          </div>
        </div>
      </div>
      <button
        type="button"
        className="gaya-amp-hit"
        aria-label={`${item.name}, ${item.colour}, ${rm(item.price)}`}
        aria-expanded={open}
        onPointerEnter={(e) => e.pointerType === 'mouse' && setRock((n) => n + 1)}
        onClick={(e) =>
          onPick(item, e.currentTarget.parentElement!, e.detail === 0)
        }
      />
    </div>
  );
}

function Tag({
  item,
  pos,
  keyboard,
  sheet,
  onClose,
}: {
  item: Item;
  pos: { x: number; y: number } | null;
  keyboard: boolean;
  sheet: boolean;
  onClose: () => void;
}) {
  const { add, lines } = useBag();
  const stockLeft = useStockLeft();
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (keyboard) ref.current?.focus();
    return () => clearTimeout(timer.current);
  }, [keyboard]);

  const label = item.kind === 'shoes' ? 'EU' : item.category === 'Bottoms' ? 'Waist' : '';
  const left = size ? stockLeft(stockKey(item, size)) : 0;
  const room =
    left -
    (lines.find((line) => size && line.key === stockKey(item, size))?.qty ?? 0);

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label={`${item.name}, ${item.colour}`}
      tabIndex={-1}
      className={`gaya-amp-tag ${sheet ? 'is-sheet' : ''}`}
      data-ready={sheet || pos !== null}
      style={
        pos ? ({ '--tx': `${pos.x}px`, '--ty': `${pos.y}px` } as CSSProperties) : undefined
      }
    >
      <span className="gaya-amp-hole" aria-hidden="true" />
      <button
        type="button"
        className="gaya-amp-x"
        aria-label="Close"
        onClick={onClose}
      >
        <X size={16} aria-hidden="true" />
      </button>
      <p className="gaya-amp-brand">
        GAYA <span>{numberOf(item)}</span>
      </p>
      <h2 className="gaya-amp-name">{item.name}</h2>
      <p className="gaya-amp-colour">{item.colour}</p>
      <p className="gaya-amp-price">{rm(item.price)}</p>
      <div className="gaya-amp-sizes" role="group" aria-label="Size">
        {item.sizes.map((s) => {
          const out = stockLeft(stockKey(item, s)) === 0;
          return (
            <button
              key={s}
              type="button"
              disabled={out}
              aria-pressed={size === s}
              aria-label={`${label ? `${label} ${s}` : s}${out ? ', sold out' : ''}`}
              onClick={() => {
                setSize(s);
                setAdded(false);
              }}
            >
              {s}
            </button>
          );
        })}
      </div>
      <p className="gaya-amp-fit" aria-live="polite">
        {size ? fitLine(item, size) : 'Pick a size to see how it measures.'}
        {size && left > 0 && left <= LOW_STOCK && (
          <span className="gaya-amp-low">{`\nOnly ${left} left`}</span>
        )}
      </p>
      <button
        type="button"
        className="gaya-btn gaya-amp-add"
        disabled={!size || (room < 1 && !added)}
        data-added={added}
        onClick={() => {
          if (!size || room < 1) return;
          add(bagProduct(item), variantOf(item, size));
          setAdded(true);
          clearTimeout(timer.current);
          timer.current = setTimeout(() => setAdded(false), 1800);
        }}
      >
        {added
          ? 'Added to bag'
          : !size
            ? 'Pick a size'
            : room < 1
              ? 'All in your bag'
              : 'Add to bag'}
      </button>
      <Link href={hrefOf(item)} className="gaya-amp-more">
        View details
      </Link>
    </div>
  );
}

export default function ShopAll() {
  const scene = useRef<HTMLDivElement>(null);
  const tagBox = useRef<HTMLDivElement>(null);
  const shoesRow = useRef<HTMLDivElement>(null);
  const [picked, setPicked] = useState<Picked | null>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [sheetRoot, setSheetRoot] = useState<Element | null>(null);

  useEffect(() => {
    const query = window.matchMedia('(max-width: 767px)');
    const sync = () =>
      setSheetRoot(
        query.matches
          ? (scene.current?.closest('[data-template-root]') ?? document.body)
          : null
      );
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  const close = useCallback(() => {
    setPicked(null);
    setPos(null);
  }, []);

  const place = useCallback(() => {
    const box = scene.current;
    const tag = tagBox.current?.firstElementChild as HTMLElement | null;
    if (!picked || !box || !tag) return;
    const s = box.getBoundingClientRect();
    const r = picked.el.getBoundingClientRect();
    if (r.right < s.left + 24 || r.left > s.right - 24) {
      close();
      return;
    }
    const w = tag.offsetWidth;
    const h = tag.offsetHeight;
    const gap = 14;
    let x = r.right - s.left + gap;
    if (x + w > s.width - 12) {
      const left = r.left - s.left - gap - w;
      x = left >= 12 ? left : s.width - w - 12;
    }
    const y = Math.max(12, Math.min(r.top - s.top + 24, s.height - h - 12));
    setPos({ x: Math.round(x), y: Math.round(y) });
  }, [picked, close]);

  useLayoutEffect(() => {
    place();
  }, [place]);

  useEffect(() => {
    if (!picked) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', place);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', place);
    };
  }, [picked, place, close]);

  useEffect(() => {
    const row = shoesRow.current;
    if (!row) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        row.dataset.land = 'go';
        observer.disconnect();
      },
      { threshold: 0.35 }
    );
    observer.observe(row);
    return () => observer.disconnect();
  }, []);

  const pick: Pick = (item, el, keyboard) => {
    if (picked?.item.id === item.id) {
      close();
      return;
    }
    el.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
    if (sheetRoot) {
      const r = el.getBoundingClientRect();
      const room = window.innerHeight - 380;
      if (r.bottom > room) window.scrollBy({ top: r.bottom - room, behavior: 'smooth' });
    }
    setPos(null);
    setPicked({ item, el, keyboard });
  };

  const sel = picked?.item.id;
  const dimOf = (id: string) => sel !== undefined && sel !== id;
  const tag = picked && (
    <Tag
      key={picked.item.id}
      item={picked.item}
      pos={pos}
      keyboard={picked.keyboard}
      sheet={sheetRoot !== null}
      onClose={close}
    />
  );

  return (
    <section className="gaya-shopall">
      <div className="gaya-amp-head">
        <h1>Fresh off the line</h1>
        <p>
          Everyday clothes and shoes, cut in Kuala Lumpur. Tap a piece to see
          its tag.
        </p>
      </div>

      <div
        ref={scene}
        className="gaya-amp"
        data-picked={sel !== undefined}
        onClick={(e) => {
          const t = e.target as Element;
          if (!t.closest('.gaya-amp-hit, .gaya-amp-tag, .gaya-amp-arrow')) close();
        }}
      >
        <div className="gaya-amp-wall" aria-hidden="true">
          <span className="gaya-amp-light" />
          <span className="gaya-amp-window" />
          <span className="gaya-amp-window is-far" />
          <span className="gaya-amp-floor" />
          <span className="gaya-amp-grain" />
        </div>

        <Row list={TOPS} onScroll={place}>
          {TOPS.items.map((item, i) => (
            <Hung
              key={item.id}
              item={item}
              index={i}
              count={TOPS.items.length}
              dim={dimOf(item.id)}
              open={sel === item.id}
              eager
              onPick={pick}
            />
          ))}
          <Rope />
        </Row>

        <Row list={BOTTOMS} onScroll={place}>
          {BOTTOMS.items.map((item, i) => (
            <Hung
              key={item.id}
              item={item}
              index={i}
              count={BOTTOMS.items.length}
              dim={dimOf(item.id)}
              open={sel === item.id}
              eager={i < 4}
              onPick={pick}
            />
          ))}
          <Rope />
        </Row>

        <div ref={shoesRow} className="gaya-amp-shoes">
          <Row list={SHOES} onScroll={place}>
            {SHOES.items.map((item, i) => (
              <Shoe
                key={item.id}
                item={item}
                index={i}
                dim={dimOf(item.id)}
                open={sel === item.id}
                onPick={pick}
              />
            ))}
          </Row>
        </div>

        <div ref={tagBox}>{!sheetRoot && tag}</div>
      </div>
      {sheetRoot && tag && createPortal(tag, sheetRoot)}
    </section>
  );
}
