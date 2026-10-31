'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { playNotes, stopPlaying, strike, useNowPlaying, type Note } from './audio';
import { HAS_BLACK, KEY_ORDER, NAME, SONGS, songNotes, whiteNote, type Song } from './data';
import { fitCanvas, flash, reducedMotion, usePlayable } from './keys';
import { KeyHint, PlayIcon, StopIcon } from './ui';

const WHITES = Array.from({ length: 10 }, (_, i) => whiteNote(60, i));
const BLACKS = WHITES.slice(0, -1).flatMap((note, i) =>
  HAS_BLACK[i % 7] ? [{ note: note + 1, after: i + 1 }] : []
);
const letter = (m: number) => KEY_ORDER[m - 60]?.toUpperCase();
const hue = (m: number) => 195 + ((m - 60) / 16) * 125;
const ID = 'light';
const keyIn = (deck: HTMLElement | null, m: number) =>
  deck?.querySelector(`[data-note="${m}"]`) ?? null;

interface Trail {
  x: number;
  y: number;
  w: number;
  len: number;
  hue: number;
  born: number;
  alpha: number;
}

export default function LightHero() {
  const hero = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const deck = useRef<HTMLDivElement>(null);
  const kick = useRef(() => {});
  const live = useRef({
    trails: [] as Trail[],
    song: null as Song | null,
    idx: 0,
    hearing: false,
    shift: 0,
    rec: [] as { m: number; t: number }[],
  });
  const [song, setSong] = useState<Song | null>(null);
  const [idx, setIdx] = useState(0);
  const [recorded, setRecorded] = useState(0);
  const now = useNowPlaying();
  const hearing = now?.id === ID;
  const done = !!song && idx >= song.notes.length;

  const keyFor = (m: number) => keyIn(deck.current, m);

  const launch = (m: number, key: Element | null, alpha = 1) => {
    const heroEl = hero.current;
    if (!key || !heroEl) return;
    const hr = heroEl.getBoundingClientRect();
    const r = key.getBoundingClientRect();
    const black = key.classList.contains('bk');
    live.current.trails.push({
      x: r.left + r.width / 2 - hr.left,
      y: r.top - hr.top + 6,
      w: Math.min(r.width * 0.42, 40),
      len: black ? 84 : 112,
      hue: hue(m),
      born: performance.now(),
      alpha,
    });
    kick.current();
  };

  const perform = (notes: Note[]) =>
    playNotes(ID, notes, (m) => {
      const key = keyFor(m);
      flash(key);
      launch(m, key);
    });

  useEffect(() => {
    live.current.song = song;
    live.current.hearing = hearing;
    kick.current();
    const next = song && !hearing ? song.notes[idx] : null;
    deck.current?.querySelectorAll('[data-note]').forEach((key) => {
      key.classList.toggle('next', Number(key.getAttribute('data-note')) === next);
    });
  }, [song, idx, hearing]);

  useEffect(() => {
    const heroEl = hero.current!;
    const cv = canvas.current!;
    let size = fitCanvas(cv);
    let raf = 0;
    let visible = true;

    function frame(t: number) {
      const { g, w, h } = size;
      const l = live.current;
      g.clearRect(0, 0, w, h);
      for (let i = l.trails.length - 1; i >= 0; i--) {
        const b = l.trails[i];
        const a = (t - b.born) / 1000;
        if (a > 3.4) {
          l.trails.splice(i, 1);
          continue;
        }
        const len = b.len * Math.min(1, a / 0.16);
        const top = b.y - len - Math.max(0, a - 0.16) * 170;
        const alpha = Math.max(0, 1 - a / 3.4) * b.alpha;
        const grad = g.createLinearGradient(0, top, 0, top + len);
        grad.addColorStop(0, `hsl(${b.hue} 95% 66% / ${alpha})`);
        grad.addColorStop(1, `hsl(${b.hue + 25} 95% 60% / ${alpha * 0.85})`);
        g.shadowColor = `hsl(${b.hue} 95% 60% / ${alpha * 0.7})`;
        g.shadowBlur = 26;
        g.fillStyle = grad;
        g.beginPath();
        g.roundRect(b.x - b.w / 2, top, b.w, len, b.w / 2);
        g.fill();
      }

      const guiding = !!l.song && !l.hearing && l.idx < l.song.notes.length;
      if (guiding) {
        const hr = heroEl.getBoundingClientRect();
        const phone = w < 768;
        const ph = phone ? 26 : 34;
        const gap = ph + (phone ? 10 : 14);
        l.shift = Math.max(0, l.shift - 0.12);
        const ease = l.shift * l.shift;
        for (let k = 3; k >= 0; k--) {
          const m = l.song!.notes[l.idx + k];
          const key = m === undefined ? null : keyIn(deck.current, m);
          if (!key) continue;
          const r = key.getBoundingClientRect();
          const pw = Math.min(r.width * 0.42, 40);
          const x = r.left + r.width / 2 - hr.left - pw / 2;
          const y = r.top - hr.top - 16 - ph - (k + ease) * gap;
          const pulse = k === 0 && !reducedMotion() ? 0.5 + 0.5 * Math.sin(t / 160) : 0;
          const alpha = [0.95, 0.42, 0.24, 0.12][k];
          g.shadowColor = `hsl(${hue(m)} 95% 60% / ${k === 0 ? 0.55 + pulse * 0.3 : 0})`;
          g.shadowBlur = k === 0 ? 18 + pulse * 14 : 0;
          g.fillStyle = `hsl(${hue(m)} 95% ${k === 0 ? 64 : 70}% / ${alpha})`;
          g.beginPath();
          g.roundRect(x, y, pw, ph, pw / 2);
          g.fill();
        }
      }
      g.shadowBlur = 0;
      raf = visible && (l.trails.length || guiding) ? requestAnimationFrame(frame) : 0;
    }

    kick.current = () => {
      if (!raf && visible) raf = requestAnimationFrame(frame);
    };
    const ro = new ResizeObserver(() => {
      size = fitCanvas(cv);
      kick.current();
    });
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      kick.current();
    });
    ro.observe(heroEl);
    io.observe(heroEl);
    return () => {
      ro.disconnect();
      io.disconnect();
      cancelAnimationFrame(raf);
      stopPlaying(ID);
    };
  }, []);

  usePlayable(hero, (m, key) => {
    strike(m);
    const l = live.current;
    if (l.song && !l.hearing && l.idx < l.song.notes.length) {
      const right = m === l.song.notes[l.idx];
      launch(m, key, right ? 1 : 0.35);
      if (!right) {
        key?.classList.add('miss');
        window.setTimeout(() => key?.classList.remove('miss'), 320);
        return;
      }
      l.idx += 1;
      l.shift = 1;
      setIdx(l.idx);
      if (l.idx === l.song.notes.length) {
        const finished = l.song;
        window.setTimeout(() => perform(songNotes(finished)), 700);
      }
      return;
    }
    launch(m, key);
    if (l.song) return;
    const t = performance.now();
    if (l.rec.length && t - l.rec[l.rec.length - 1].t > 2500) l.rec = [];
    l.rec.push({ m, t });
    if (l.rec.length > 48) l.rec.shift();
    setRecorded(l.rec.length);
  });

  const choose = (next: Song | null) => {
    stopPlaying(ID);
    live.current.idx = 0;
    live.current.shift = 0;
    setIdx(0);
    setSong(next);
  };

  const hear = () => {
    if (hearing) stopPlaying(ID);
    else if (song) perform(songNotes(song));
  };

  const replay = () => {
    const rec = live.current.rec;
    if (hearing) stopPlaying(ID);
    else if (rec.length) perform(rec.map(({ m, t }) => [m, (t - rec[0].t) / 1000, 2.2, 0.17]));
  };

  return (
    <section ref={hero} id="top" className="sapa-hero light">
      <canvas ref={canvas} className="sapa-canvas" aria-hidden="true" />
      <div className="lt-top">
        <h1 className="lt-name sapa-display">{NAME}</h1>
        <div className="lt-songs" role="group" aria-label="Pick a song to learn">
          <button type="button" aria-pressed={!song} onClick={() => choose(null)}>
            Free play
          </button>
          {SONGS.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={song?.id === item.id}
              onClick={() => choose(item)}
            >
              {item.title}
            </button>
          ))}
        </div>
        <div className="lt-status" aria-live="polite">
          {song ? (
            <>
              <span className="lt-count">
                {done ? 'Well played' : `${idx} / ${song.notes.length}`}
              </span>
              <span className="lt-bar">
                <i style={{ width: `${(idx / song.notes.length) * 100}%` }} />
              </span>
              <button type="button" onClick={hear}>
                {hearing ? <StopIcon size={12} /> : <PlayIcon size={12} />}
                {hearing ? 'Stop' : 'Hear it'}
              </button>
              <button type="button" onClick={() => choose(song)}>
                {done ? 'Again' : 'Restart'}
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={replay} disabled={!recorded}>
                {hearing ? <StopIcon size={12} /> : <PlayIcon size={12} />}
                {hearing ? 'Stop' : 'Replay'}
              </button>
              <KeyHint from="A" to=";" />
            </>
          )}
        </div>
      </div>
      <div className="lt-kb">
        <div className="lt-deck">
          <div ref={deck} className="lt-keys">
            {WHITES.map((note) => (
              <div key={note} className="w" data-note={note}>
                <span>{letter(note)}</span>
              </div>
            ))}
            {BLACKS.map(({ note, after }) => (
              <div
                key={note}
                className="bk"
                data-note={note}
                style={{ '--after': after } as CSSProperties}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
