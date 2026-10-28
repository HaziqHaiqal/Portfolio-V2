'use client';

import { useEffect, useId, useRef, useState } from 'react';

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
const INK = '#232838';
const ACCENT = '#6B8EC4';
const BODY =
  'M24 10C33.4 10 39.5 16.6 39.5 26C39.5 31.2 38.9 35.6 37.2 38.6C35.6 41.4 33 43 30 43C27.6 43 26.2 41.6 24 41.6C21.8 41.6 20.4 43 18 43C15 43 12.4 41.4 10.8 38.6C9.1 35.6 8.5 31.2 8.5 26C8.5 16.6 14.6 10 24 10Z';
const line = {
  stroke: INK,
  strokeWidth: 1.3,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  fill: 'none',
} as const;

const cheeks = (
  <>
    <ellipse cx="14.4" cy="27.4" rx="2" ry="1.1" fill="#F4A6C0" opacity="0.5" />
    <ellipse cx="33.6" cy="27.4" rx="2" ry="1.1" fill="#F4A6C0" opacity="0.5" />
  </>
);

const eye = (cx: number, cy = 23, rx = 1.8, ry = 2.6) => (
  <g className="hoon-eye">
    <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={INK} />
    <ellipse
      cx={cx - rx * 0.32}
      cy={cy - ry * 0.42}
      rx={rx * 0.3}
      ry={ry * 0.26}
      fill="#fff"
      opacity="0.85"
    />
  </g>
);

function Face({ mood }: { mood: HoonMood }) {
  switch (mood) {
    case 'laughing':
      return (
        <>
          {cheeks}
          <path
            d="M16.4 21.4l2.6 1.6-2.6 1.6M31.6 21.4l-2.6 1.6 2.6 1.6"
            {...line}
            strokeWidth={1.5}
          />
          <path d="M21.8 27h4.4q0 3-2.2 3t-2.2-3z" fill={INK} />
        </>
      );
    case 'thinking':
      return (
        <>
          {eye(18.6, 21.8, 1.7, 2.4)}
          {eye(30.6, 21.8, 1.7, 2.4)}
          {[38.6, 41.2, 43.8].map((cx, index) => (
            <circle
              key={cx}
              className="hoon-dot"
              cx={cx}
              cy="9.4"
              r="1.1"
              fill={ACCENT}
              style={{ animationDelay: `${index * 0.2}s` }}
            />
          ))}
        </>
      );
    case 'typing':
      return (
        <>
          {eye(18, 24.6, 1.8, 2.2)}
          {eye(30, 24.6, 1.8, 2.2)}
        </>
      );
    case 'excited':
      return (
        <>
          {cheeks}
          <path
            d="M16 24l2-2.4 2 2.4M28 24l2-2.4 2 2.4"
            {...line}
            strokeWidth={1.5}
          />
          <path d="M22.2 27h3.6q0 2.6-1.8 2.6t-1.8-2.6z" fill={INK} />
        </>
      );
    case 'confused':
      return (
        <>
          {eye(18)}
          {eye(30, 23.4, 1.5, 1.9)}
          <path d="M28 18.8l3.6-.9" {...line} />
          <path d="M21.6 28.4q1.2-1.2 2.4 0t2.4 0" {...line} />
          <text x="38.6" y="13.4" fontSize="7" fontWeight="700" fill={ACCENT}>
            ?
          </text>
        </>
      );
    case 'sad':
      return (
        <>
          {eye(18, 23.6, 1.7, 2.3)}
          {eye(30, 23.6, 1.7, 2.3)}
          <path d="M15.8 19.8l3.4-1M32.2 19.8l-3.4-1" {...line} />
          <path d="M22.2 29q1.8-1.5 3.6 0" {...line} />
          <path d="M32.6 25.4q-1.3 1.9 0 2.7 1.3-.8 0-2.7z" fill="#7DD3FC" />
        </>
      );
    case 'sleepy':
      return (
        <>
          <path d="M16.2 23.4q1.8 1.3 3.6 0M28.2 23.4q1.8 1.3 3.6 0" {...line} />
          <text x="37.6" y="13.6" fontSize="4.5" fontWeight="700" fill={ACCENT}>
            z
          </text>
          <text x="40.2" y="10.6" fontSize="6" fontWeight="700" fill={ACCENT}>
            z
          </text>
        </>
      );
    case 'surprised':
      return (
        <>
          {eye(18, 22.6, 2.2, 2.9)}
          {eye(30, 22.6, 2.2, 2.9)}
          <ellipse cx="24" cy="28.8" rx="1.2" ry="1.5" fill={INK} />
        </>
      );
    case 'wink':
      return (
        <>
          {cheeks}
          {eye(18)}
          <path d="M28.2 23.6q1.8-2 3.6 0" {...line} strokeWidth={1.5} />
          <path d="M22.4 27.4q1.6 1.4 3.2 0" {...line} />
        </>
      );
    default:
      return (
        <>
          {eye(18)}
          {eye(30)}
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
  const id = `hoon${useId().replace(/[^\w-]/g, '')}`;

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
      viewBox="2 5 44 44"
      aria-hidden="true"
      data-mood={mood}
      className={mood === 'excited' ? `${className} hoon-waving` : className}
    >
      <defs>
        <radialGradient id={`${id}-body`} cx="0.38" cy="0.28" r="0.82">
          <stop offset="0" stopColor="#EBF4FC" />
          <stop offset="0.45" stopColor="#CCE0F2" />
          <stop offset="0.85" stopColor="#ABC4DF" />
          <stop offset="1" stopColor="#98B2D1" />
        </radialGradient>
        <linearGradient id={`${id}-shade`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.55" stopColor="#5D7FAF" stopOpacity="0" />
          <stop offset="1" stopColor="#5D7FAF" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id={`${id}-arm`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#CFE1F4" />
          <stop offset="1" stopColor="#9BB5D6" />
        </linearGradient>
        <radialGradient id={`${id}-shine`}>
          <stop offset="0" stopColor="#fff" stopOpacity="0.75" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-ground`}>
          <stop offset="0" stopColor="#3C5A8A" stopOpacity="0.35" />
          <stop offset="1" stopColor="#3C5A8A" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="24" cy="44.4" rx="12.5" ry="2" fill={`url(#${id}-ground)`} />
      <ellipse
        cx="8.6"
        cy="30.6"
        rx="2.7"
        ry="4.9"
        transform="rotate(28 8.6 30.6)"
        fill={`url(#${id}-arm)`}
      />
      <g className="hoon-arm">
        <ellipse
          cx="39.4"
          cy="30.6"
          rx="2.7"
          ry="4.9"
          transform="rotate(-28 39.4 30.6)"
          fill={`url(#${id}-arm)`}
        />
      </g>
      <path d={BODY} fill={`url(#${id}-body)`} />
      <path d={BODY} fill={`url(#${id}-shade)`} />
      <ellipse
        cx="18.4"
        cy="15.6"
        rx="6.4"
        ry="3.6"
        transform="rotate(-24 18.4 15.6)"
        fill={`url(#${id}-shine)`}
      />

      <g ref={lookRef} className="hoon-look">
        <g key={mood} className="hoon-face">
          <Face mood={mood} />
        </g>
      </g>
    </svg>
  );
}
