'use client';

import { useRef, useState } from 'react';
import { hz, strike } from './audio';
import { HAS_BLACK, noteName, PHOTO, whiteNote } from './data';
import { reducedMotion, usePlayable } from './keys';
import { KeyHint } from './ui';

const C = 380;
const RI = 226;
const RO = 360;
const RB = 298;
const N = 21;
const STEP = (2 * Math.PI) / N;
const A0 = -Math.PI / 2 - STEP / 2;

function wedge(r0: number, r1: number, a0: number, a1: number) {
  const p = (r: number, a: number) =>
    `${(C + r * Math.cos(a)).toFixed(2)} ${(C + r * Math.sin(a)).toFixed(2)}`;
  return `M${p(r1, a0)}A${r1} ${r1} 0 0 1 ${p(r1, a1)}L${p(r0, a1)}A${r0} ${r0} 0 0 0 ${p(r0, a0)}Z`;
}

const WHITES = Array.from({ length: N }, (_, i) => ({
  note: whiteNote(48, i),
  d: wedge(RI, RO, A0 + i * STEP + 0.008, A0 + (i + 1) * STEP - 0.008),
}));
const BLACKS = WHITES.slice(0, -1).flatMap((white, i) => {
  if (!HAS_BLACK[i % 7]) return [];
  const mid = A0 + (i + 1) * STEP;
  return [{ note: white.note + 1, d: wedge(RB, RO, mid - STEP * 0.3, mid + STEP * 0.3) }];
});

export default function RingHero() {
  const hero = useRef<HTMLElement>(null);
  const ripples = useRef<SVGGElement>(null);
  const core = useRef<SVGGElement>(null);
  const [note, setNote] = useState(60);

  usePlayable(hero, (m) => {
    strike(m);
    setNote(m);
    if (!reducedMotion() && ripples.current) {
      const rip = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      rip.setAttribute('class', 'ring-rip');
      rip.setAttribute('cx', `${C}`);
      rip.setAttribute('cy', `${C}`);
      rip.setAttribute('r', `${RO}`);
      rip.addEventListener('animationend', () => rip.remove());
      ripples.current.appendChild(rip);
    }
    core.current?.classList.add('pulse');
    window.setTimeout(() => core.current?.classList.remove('pulse'), 90);
  });

  return (
    <section ref={hero} id="top" className="sapa-hero ring">
      <h1 className="ring-name sapa-display">
        Haziq
        <br />
        Haiqal
      </h1>
      <svg className="ring-keys" viewBox="0 0 760 760" role="group" aria-label="Round piano keyboard">
        <defs>
          <clipPath id="ring-core">
            <circle cx={C} cy={C} r={RI - 14} />
          </clipPath>
        </defs>
        <circle cx={C} cy={C} r={RO + 10} className="ring-plate" />
        <g ref={ripples} />
        <g ref={core} className="ring-core">
          <circle cx={C} cy={C} r={RI - 14} className="ring-disc" />
          <image
            href={PHOTO.src}
            x={C - 205}
            y={C - 196}
            width={410}
            height={430}
            clipPath="url(#ring-core)"
          />
        </g>
        {WHITES.map((key) => (
          <path key={key.note} className="w" d={key.d} data-note={key.note} />
        ))}
        {BLACKS.map((key) => (
          <path key={key.note} className="bk" d={key.d} data-note={key.note} />
        ))}
      </svg>
      <div className="ring-tuner" aria-live="polite">
        <small>You played</small>
        <b className="sapa-display">{noteName(note)}</b>
        <span>{hz(note).toFixed(1)} Hz</span>
      </div>
      <div className="ring-hint">
        <KeyHint />
      </div>
    </section>
  );
}
