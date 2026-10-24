import Link from 'next/link';
import { Star } from 'lucide-react';
import { BASE_PATH, BRAND } from './data';

export const CONTAINER = 'mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10';
export const DISPLAY =
  'font-[family-name:var(--display-font)] font-extrabold tracking-[-0.035em]';
export const BUTTON =
  'inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-bold transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-tpl-accent/40 disabled:pointer-events-none disabled:opacity-40';
export const BUTTON_ACCENT = `${BUTTON} bg-tpl-accent text-tpl-on-accent`;
export const BUTTON_GHOST = `${BUTTON} border border-tpl-line text-tpl-ink hover:bg-tpl-tint`;

export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <Link
      href={BASE_PATH}
      className={`${DISPLAY} text-2xl tracking-wide ${className}`}
    >
      {BRAND}
      <span className="text-tpl-accent">.</span>
    </Link>
  );
}

export function Stars({
  rating,
  size = 14,
  tone = 'text-amber-400',
}: {
  rating: number;
  size?: number;
  /** Colour class for the filled stars. */
  tone?: string;
}) {
  return (
    <span
      className="inline-flex items-center gap-0.5"
      aria-label={`${rating} out of 5`}
    >
      {[0, 1, 2, 3, 4].map((index) => (
        <Star
          key={index}
          size={size}
          aria-hidden="true"
          className={
            index < Math.round(rating)
              ? `fill-current ${tone}`
              : 'text-current opacity-25'
          }
        />
      ))}
    </span>
  );
}
