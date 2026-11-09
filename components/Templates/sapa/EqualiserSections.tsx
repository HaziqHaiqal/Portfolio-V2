'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import WhatsAppButton from '@components/Templates/WhatsAppButton';
import { Reveal } from '@components/Templates/motion';
import { analyser, playNotes, progressOf, stopPlaying, useNowPlaying, type Playing } from './audio';
import { clock, CONTACT_LINE, lengthOf, MUSIC_LINE, Socials, useStopOnLeave } from './bits';
import { BIO, EMAIL, FACTS, HELLO, melodyOf, PHOTO, PIECES } from './data';
import { reducedMotion } from './keys';
import { PlayIcon, StopIcon } from './ui';

/** Ray lengths for one half, taken from the piece's melody; the other half mirrors it, as in the hero. */
function shapeOf(steps: number[], count: number) {
  const lo = Math.min(...steps);
  const hi = Math.max(...steps);
  return Array.from({ length: count }, (_, i) => {
    const m = steps[Math.floor((i / count) * Math.min(steps.length, count * 2))];
    return 0.18 + 0.82 * ((m - lo) / Math.max(1, hi - lo));
  });
}

const SHAPES = PIECES.map((piece) => shapeOf(melodyOf(piece.notes), 18));
const ABOUT_SHAPE = Array.from(
  { length: 40 },
  (_, i) => 0.22 + 0.2 * (0.5 + 0.5 * Math.cos((i / 40) * Math.PI * 6)) + 0.12 * Math.sin(i * 1.7) ** 2
);
const CALL_SHAPE = ABOUT_SHAPE.filter((_, i) => i % 2 === 0);

function ray(count: number, k: number, r0: number, len: number) {
  const t = ((Math.floor(k / 2) + 0.5) / count) * Math.PI;
  const x = Math.sin(t) * (k % 2 ? -1 : 1);
  const y = -Math.cos(t);
  return [50 + x * r0, 50 + y * r0, 50 + x * (r0 + len), 50 + y * (r0 + len)].map((v) => v.toFixed(2));
}

/** A ring of rays like the hero's. While music plays it follows the sound; `track` lights it as that piece plays. */
function Rays({
  shape,
  r0,
  reach,
  track,
}: {
  shape: number[];
  r0: number;
  reach: number;
  track?: Playing | null;
}) {
  const svg = useRef<SVGSVGElement>(null);
  const now = useNowPlaying();
  const live = track !== undefined ? !!track : !!now;
  const count = shape.length;

  useEffect(() => {
    const lines = svg.current ? Array.from(svg.current.querySelectorAll('line')) : [];
    if (!live || !lines.length) return;
    const still = reducedMotion();
    const data = new Uint8Array(1024);
    const level = Float32Array.from(shape, (v) => v * 0.5);
    const lo = Array.from({ length: count }, (_, i) => 70 * (2600 / 70) ** (i / count));
    const hi = Array.from({ length: count }, (_, i) => 70 * (2600 / 70) ** ((i + 1) / count));
    let raf = 0;
    const tick = () => {
      const a = analyser();
      if (a && !still) {
        a.getByteFrequencyData(data);
        const bin = a.context.sampleRate / a.fftSize;
        for (let i = 0; i < count; i++) {
          const from = Math.floor(lo[i] / bin);
          const to = Math.max(from + 1, Math.floor(hi[i] / bin));
          let v = 0;
          for (let b = from; b < to; b++) v = Math.max(v, data[b] / 255);
          const target = Math.max(shape[i] * 0.5, Math.min(1, (Math.max(0, v - 0.3) / 0.7) * (0.9 + (0.5 * i) / count)));
          level[i] += target > level[i] ? (target - level[i]) * 0.5 : Math.max(-0.03, target - level[i]);
        }
        lines.forEach((line, k) => {
          const [, , x2, y2] = ray(count, k, r0, reach * level[k >> 1]);
          line.setAttribute('x2', x2);
          line.setAttribute('y2', y2);
        });
      }
      if (track) {
        const p = progressOf(track);
        lines.forEach((line, k) => line.classList.toggle('lit', ((k >> 1) + 0.5) / count <= p));
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => {
      cancelAnimationFrame(raf);
      lines.forEach((line, k) => {
        const [, , x2, y2] = ray(count, k, r0, reach * shape[k >> 1]);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.classList.remove('lit');
      });
    };
  }, [live, track, shape, count, r0, reach]);

  return (
    <svg ref={svg} className="eq-rays" viewBox="0 0 100 100" aria-hidden="true">
      {Array.from({ length: count * 2 }, (_, k) => {
        const [x1, y1, x2, y2] = ray(count, k, r0, reach * shape[k >> 1]);
        return <line key={k} x1={x1} y1={y1} x2={x2} y2={y2} />;
      })}
    </svg>
  );
}

export function Music() {
  const now = useNowPlaying();
  useStopOnLeave();

  return (
    <section id="music" className="sapa-section">
      <div className="sapa-wrap">
        <Reveal className="eq-head">
          <h2 className="sapa-h2">Music</h2>
          <p className="sapa-lead">{MUSIC_LINE}</p>
        </Reveal>
        <ol className="eq-pieces">
          {PIECES.map((piece, i) => {
            const on = now?.id === piece.id;
            return (
              <li key={piece.id}>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => (on ? stopPlaying() : playNotes(piece.id, piece.notes))}
                >
                  <span className="eq-dial">
                    <Rays shape={SHAPES[i]} r0={27} reach={21} track={on ? now : null} />
                    <i>{on ? <StopIcon size={14} /> : <PlayIcon size={16} />}</i>
                  </span>
                  <span className="eq-piece-text">
                    <b>{piece.title}</b>
                    <small>{piece.by}</small>
                  </span>
                  <span className="eq-piece-len">{clock(lengthOf(piece.notes))}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

export function About() {
  return (
    <section id="about" className="sapa-section">
      <div className="sapa-wrap eq-about">
        <Reveal className="eq-me">
          <Rays shape={ABOUT_SHAPE} r0={31} reach={18} />
          <span className="eq-me-photo">
            <Image
              src={PHOTO.src}
              width={PHOTO.width}
              height={PHOTO.height}
              alt="Paper-cut illustration of Haziq Haiqal"
              sizes="(max-width: 767px) 60vw, 300px"
            />
          </span>
        </Reveal>
        <Reveal>
          <h2 className="sapa-h2">About</h2>
          <p className="eq-bio">{BIO[0]}</p>
          <p className="sapa-lead">{BIO[1]}</p>
          <dl className="eq-facts">
            {FACTS.map((fact) => (
              <div key={fact.label}>
                <dd>{fact.value}</dd>
                <dt>{fact.label}</dt>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}

export function Contact() {
  return (
    <section id="contact" className="sapa-section">
      <Reveal className="sapa-wrap eq-contact">
        <h2 className="sapa-h2">Contact</h2>
        <p className="sapa-lead">{CONTACT_LINE}</p>
        <div className="eq-call">
          <Rays shape={CALL_SHAPE} r0={25} reach={22} />
          <WhatsAppButton message={HELLO} className="eq-call-btn">
            WhatsApp
          </WhatsAppButton>
        </div>
        <a className="eq-mail" href={`mailto:${EMAIL}`}>
          {EMAIL}
        </a>
        <div className="eq-socials">
          <Socials className="eq-icon" />
        </div>
      </Reveal>
    </section>
  );
}
