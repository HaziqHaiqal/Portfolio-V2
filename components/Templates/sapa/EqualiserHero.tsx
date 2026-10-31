'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { analyser, playNotes, stopPlaying, strike, useNowPlaying } from './audio';
import { NAME, PIECES } from './data';
import { fitCanvas, tokenColour, usePlayable } from './keys';
import { PlayIcon, StopIcon } from './ui';

const SIDE = 64;

export default function EqualiserHero() {
  const hero = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const kick = useRef(() => {});
  const awake = useRef({ playing: false, until: 0 });
  const [index, setIndex] = useState(0);
  const now = useNowPlaying();
  const piece = PIECES[index];
  const on = now?.id === piece.id;

  useEffect(() => {
    const cv = canvas.current!;
    const accent = tokenColour(hero.current!, 'accent');
    const data = new Uint8Array(1024);
    const level = new Float32Array(SIDE);
    // Mirrored halves: lows at the top, highs at the bottom.
    const idle = Array.from({ length: SIDE }, (_, i) => 0.1 + 0.06 * (0.5 + 0.5 * Math.cos((i / SIDE) * Math.PI * 6)));
    const lo = Array.from({ length: SIDE }, (_, i) => 70 * (2600 / 70) ** (i / SIDE));
    const hi = Array.from({ length: SIDE }, (_, i) => 70 * (2600 / 70) ** ((i + 1) / SIDE));
    let size = fitCanvas(cv);
    let raf = 0;
    level.set(idle);

    function frame() {
      const a = analyser();
      let energy = 0;
      let bass = 0;
      let settled = true;
      if (a) {
        a.getByteFrequencyData(data);
        const bin = a.context.sampleRate / a.fftSize;
        for (let b = 1; b < 160 / bin; b++) bass = Math.max(bass, data[b] / 255);
        bass = Math.max(0, (bass - 0.55) / 0.45);
        for (let i = 0; i < SIDE; i++) {
          const from = Math.floor(lo[i] / bin);
          const to = Math.max(from + 1, Math.floor(hi[i] / bin));
          let v = 0;
          for (let b = from; b < to; b++) v = Math.max(v, data[b]);
          v /= 255;
          energy += v;
          const target = Math.min(1, Math.max(idle[i], ((Math.max(0, v - 0.3) / 0.7) ** 1.1) * (0.9 + (0.5 * i) / SIDE)));
          level[i] += target > level[i] ? (target - level[i]) * 0.5 : Math.max(-0.025, target - level[i]);
          if (Math.abs(level[i] - target) > 0.004) settled = false;
        }
      }

      const { g, w, h } = size;
      const c = w / 2;
      const r0 = w * 0.215;
      const reach = w * 0.27;
      g.clearRect(0, 0, w, h);
      g.lineCap = 'round';
      g.lineWidth = Math.max(2, w / 190);
      g.strokeStyle = accent();
      g.beginPath();
      for (let i = 0; i < SIDE; i++) {
        const len = reach * (0.04 + level[i] * 0.96);
        const t = ((i + 0.5) / SIDE) * Math.PI;
        for (const side of [1, -1]) {
          const x = Math.sin(t) * side;
          const y = -Math.cos(t);
          g.moveTo(c + x * r0, c + y * r0);
          g.lineTo(c + x * (r0 + len), c + y * (r0 + len));
        }
      }
      g.stroke();
      if (button.current) button.current.style.scale = `${1 + bass * 0.06}`;

      const keep = awake.current.playing || performance.now() < awake.current.until;
      raf = keep || energy > 1 || !settled ? requestAnimationFrame(frame) : 0;
    }

    kick.current = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };
    const ro = new ResizeObserver(() => {
      size = fitCanvas(cv);
      cancelAnimationFrame(raf);
      raf = 0;
      frame();
    });
    ro.observe(cv);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
      PIECES.forEach((item) => stopPlaying(item.id));
    };
  }, []);

  useEffect(() => {
    awake.current.playing = !!now;
    if (now) kick.current();
  }, [now]);

  usePlayable(hero, (m) => {
    strike(m);
    awake.current.until = performance.now() + 400;
    kick.current();
  });

  const toggle = () => {
    if (on) stopPlaying();
    else playNotes(piece.id, piece.notes);
  };

  const step = (by: number) => {
    const next = (index + by + PIECES.length) % PIECES.length;
    setIndex(next);
    if (now) playNotes(PIECES[next].id, PIECES[next].notes);
  };

  return (
    <section ref={hero} id="top" className="sapa-hero eq">
      <h1 className="eq-name sapa-display">{NAME}</h1>
      <div className="eq-stage">
        <canvas ref={canvas} className="sapa-canvas" aria-hidden="true" />
        <button
          ref={button}
          type="button"
          className="eq-play"
          aria-label={on ? `Pause ${piece.title}` : `Play ${piece.title}`}
          onClick={toggle}
        >
          {on ? <StopIcon size={30} /> : <PlayIcon size={34} />}
        </button>
      </div>
      <div className="eq-track">
        <button type="button" aria-label="Previous piece" onClick={() => step(-1)}>
          <ChevronLeft size={20} aria-hidden="true" />
        </button>
        <p aria-live="polite">
          <b>{piece.title}</b>
          <span>{piece.by.split(',')[0]}</span>
        </p>
        <button type="button" aria-label="Next piece" onClick={() => step(1)}>
          <ChevronRight size={20} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
