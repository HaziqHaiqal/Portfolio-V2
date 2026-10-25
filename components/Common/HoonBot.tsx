'use client';

import { useEffect, useRef, useState } from 'react';

export type HoonMood =
  | 'happy'
  | 'thinking'
  | 'typing'
  | 'laughing'
  | 'excited'
  | 'confused'
  | 'sad'
  | 'sleepy'
  | 'surprised'
  | 'wink';

const MOODS: HoonMood[] = [
  'confused',
  'sad',
  'sleepy',
  'surprised',
  'wink',
  'excited',
];
const GREEN = '#34D399';
const line = {
  stroke: GREEN,
  strokeWidth: 1.4,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  fill: 'none',
} as const;

const cheeks = (
  <>
    <circle cx="15.6" cy="24.6" r="1.2" fill="#F472B6" opacity="0.5" />
    <circle cx="32.4" cy="24.6" r="1.2" fill="#F472B6" opacity="0.5" />
  </>
);

const eye = (cx: number) => (
  <ellipse
    className="hoon-eye"
    cx={cx}
    cy="19.8"
    rx="2.1"
    ry="2.5"
    fill={GREEN}
  />
);

function Face({ mood }: { mood: HoonMood }) {
  switch (mood) {
    case 'laughing':
      return (
        <>
          {cheeks}
          <path
            d="M17.6 18l2.8 1.8-2.8 1.8M30.4 18l-2.8 1.8 2.8 1.8"
            {...line}
            strokeWidth={1.6}
          />
          <path d="M20.8 23h6.4q0 4-3.2 4t-3.2-4z" fill={GREEN} />
        </>
      );
    case 'thinking':
      return (
        <>
          <ellipse cx="20.6" cy="18.6" rx="1.8" ry="2.1" fill={GREEN} />
          <ellipse cx="29.2" cy="18.6" rx="1.8" ry="2.1" fill={GREEN} />
          <path d="M22 25.2h4" {...line} />
          {[37.2, 40, 42.8].map((cx, index) => (
            <circle
              key={cx}
              className="hoon-dot"
              cx={cx}
              cy="10.4"
              r="1.2"
              fill={GREEN}
              style={{ animationDelay: `${index * 0.2}s` }}
            />
          ))}
        </>
      );
    case 'typing':
      return (
        <>
          {cheeks}
          <ellipse
            className="hoon-eye"
            cx="19.2"
            cy="21"
            rx="2.1"
            ry="2.3"
            fill={GREEN}
          />
          <ellipse
            className="hoon-eye"
            cx="28"
            cy="21"
            rx="2.1"
            ry="2.3"
            fill={GREEN}
          />
          <path d="M21.6 25.2q2.4 1.6 4.8 0" {...line} />
        </>
      );
    case 'excited':
      return (
        <>
          {cheeks}
          <path
            d="M17.6 20.8l2-2.4 2 2.4M26.4 20.8l2-2.4 2 2.4"
            {...line}
            strokeWidth={1.6}
          />
          <path d="M21.2 23.4h5.6q0 3.4-2.8 3.4t-2.8-3.4z" fill={GREEN} />
        </>
      );
    case 'confused':
      return (
        <>
          {eye(19.6)}
          <ellipse cx="28.4" cy="20.4" rx="1.6" ry="1.6" fill={GREEN} />
          <path d="M26.4 16.6l3.8-1" {...line} />
          <path d="M21 25q1.3-1.3 2.6 0t2.6 0" {...line} />
          <text x="38.4" y="13.6" fontSize="7" fontWeight="700" fill={GREEN}>
            ?
          </text>
        </>
      );
    case 'sad':
      return (
        <>
          <ellipse cx="19.6" cy="20.6" rx="1.9" ry="2.1" fill={GREEN} />
          <ellipse cx="28.4" cy="20.6" rx="1.9" ry="2.1" fill={GREEN} />
          <path d="M17.4 17.6l3.6-1M30.6 17.6l-3.6-1" {...line} />
          <path d="M21.4 26.2q2.6-2.2 5.2 0" {...line} />
          <path d="M31.4 22.6q-1.3 1.9 0 2.7 1.3-.8 0-2.7z" fill="#7DD3FC" />
        </>
      );
    case 'sleepy':
      return (
        <>
          <path d="M17.6 20.2q2 1.4 4 0M26.4 20.2q2 1.4 4 0" {...line} />
          <circle cx="24" cy="25" r="1" fill={GREEN} />
          <text x="37.4" y="14.4" fontSize="4.5" fontWeight="700" fill={GREEN}>
            z
          </text>
          <text x="39.8" y="11.4" fontSize="6" fontWeight="700" fill={GREEN}>
            z
          </text>
        </>
      );
    case 'surprised':
      return (
        <>
          <circle cx="19.6" cy="19.6" r="2.6" fill={GREEN} />
          <circle cx="28.4" cy="19.6" r="2.6" fill={GREEN} />
          <ellipse cx="24" cy="25.6" rx="1.5" ry="1.8" fill={GREEN} />
        </>
      );
    case 'wink':
      return (
        <>
          {cheeks}
          {eye(19.6)}
          <path d="M26.4 20.6q2-2.2 4 0" {...line} strokeWidth={1.6} />
          <path d="M21 23.8q3 2.6 6 0" {...line} />
        </>
      );
    default:
      return (
        <>
          {cheeks}
          {eye(19.6)}
          {eye(28.4)}
          <path d="M21.4 24q2.6 2.2 5.2 0" {...line} />
        </>
      );
  }
}

export default function HoonBot({
  className = '',
  excited = false,
  mood: forced,
  moods = MOODS,
}: {
  className?: string;
  excited?: boolean;
  mood?: HoonMood;
  /** The moods Hoon picks from when idle. */
  moods?: HoonMood[];
}) {
  const [idle, setIdle] = useState<HoonMood>('happy');
  const lookRef = useRef<SVGGElement>(null);

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let timer = 0;
    const later = (ms: number, run: () => void) => {
      timer = window.setTimeout(run, ms);
    };
    const rest = () =>
      later(3500 + Math.random() * 4000, () => {
        setIdle(moods[Math.floor(Math.random() * moods.length)]);
        later(2200, () => {
          setIdle('happy');
          rest();
        });
      });
    rest();
    return () => clearTimeout(timer);
  }, [moods]);

  useEffect(() => {
    if (
      matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !matchMedia('(pointer: fine)').matches
    )
      return;
    let frame = 0;
    const follow = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const look = lookRef.current;
        const box = look?.ownerSVGElement?.getBoundingClientRect();
        if (!look || !box) return;
        const dx = event.clientX - (box.left + box.width / 2);
        const dy = event.clientY - (box.top + box.height / 2);
        const distance = Math.hypot(dx, dy) || 1;
        const reach = Math.min(distance / 160, 1) * 1.4;
        look.style.transform = `translate(${(dx / distance) * reach}px, ${(dy / distance) * reach}px)`;
      });
    };
    window.addEventListener('pointermove', follow, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', follow);
    };
  }, []);

  const mood = excited ? 'excited' : (forced ?? idle);

  return (
    <svg
      viewBox="4 8 40 40"
      aria-hidden="true"
      data-mood={mood}
      className={mood === 'excited' ? `${className} hoon-waving` : className}
    >
      <rect
        x="10.4"
        y="36.4"
        width="3.6"
        height="7.4"
        rx="1.8"
        fill="#94A3B8"
      />
      <rect
        className="hoon-arm"
        x="34"
        y="36.4"
        width="3.6"
        height="7.4"
        rx="1.8"
        fill="#94A3B8"
      />
      <rect x="21" y="32" width="6" height="4" fill="#CBD5E1" />
      <rect
        x="14"
        y="34.6"
        width="20"
        height="12"
        rx="5"
        fill="#F1F5F9"
        stroke="#CBD5E1"
        strokeWidth="0.8"
      />
      <circle cx="24" cy="40.6" r="1.8" fill={GREEN} />

      <rect x="4.6" y="16.8" width="4" height="8.4" rx="2" fill="#94A3B8" />
      <rect x="39.4" y="16.8" width="4" height="8.4" rx="2" fill="#94A3B8" />
      <rect
        x="8"
        y="9"
        width="32"
        height="24"
        rx="9"
        fill="#F1F5F9"
        stroke="#CBD5E1"
        strokeWidth="0.8"
      />
      <rect
        x="11.8"
        y="12.8"
        width="24.4"
        height="16.4"
        rx="6"
        fill="#0F172A"
      />

      <g ref={lookRef} className="hoon-look">
        <g key={mood} className="hoon-face">
          <Face mood={mood} />
        </g>
      </g>
    </svg>
  );
}
