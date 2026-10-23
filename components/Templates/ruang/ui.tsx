'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Heart, Star } from 'lucide-react';
import { useHydrated, useStore } from './store';

export {
  BUTTON,
  BUTTON_ACCENT,
  BUTTON_DARK,
  BUTTON_OUTLINE,
  CONTAINER,
} from './styles';

/** The Ruang mark: an arch, the shape of a doorway into a room. */
export function Logo({ inverse = false }: { inverse?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <span
        aria-hidden="true"
        className={`flex h-8 w-8 items-center justify-center rounded-[10px] ${
          inverse ? 'bg-tpl-accent' : 'bg-tpl-ink'
        }`}
      >
        <svg viewBox="0 0 20 20" className="h-4 w-4">
          <path
            d="M4 18V9a6 6 0 0 1 12 0v9"
            fill="none"
            stroke={`rgb(var(${inverse ? '--tpl-on-accent' : '--tpl-accent'}))`}
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <span className="text-xl font-semibold tracking-[-0.03em]">ruang</span>
    </span>
  );
}

export function Stars({
  rating,
  size = 13,
  className = '',
}: {
  rating: number;
  size?: number;
  className?: string;
}) {
  return (
    <span
      role="img"
      aria-label={`Rated ${rating} out of 5`}
      className={`flex items-center gap-0.5 ${className}`}
    >
      {[1, 2, 3, 4, 5].map((index) => (
        <Star
          key={index}
          size={size}
          aria-hidden="true"
          className={
            rating >= index - 0.25
              ? 'fill-amber-400 text-amber-400'
              : 'fill-tpl-line text-tpl-line'
          }
        />
      ))}
    </span>
  );
}

export function HeartButton({
  slug,
  name,
  className = '',
}: {
  slug: string;
  name: string;
  className?: string;
}) {
  const hydrated = useHydrated();
  const saved = useStore((state) => state.saved.includes(slug));
  const toggleSaved = useStore((state) => state.toggleSaved);
  const on = hydrated && saved;

  return (
    <button
      type="button"
      onClick={() => toggleSaved(slug)}
      aria-pressed={on}
      aria-label={
        on ? `Remove ${name} from wishlist` : `Save ${name} to wishlist`
      }
      className={`flex h-9 w-9 items-center justify-center rounded-full bg-tpl-surface/95 shadow-sm backdrop-blur transition-transform hover:scale-105 ${className}`}
    >
      <Heart
        size={16}
        aria-hidden="true"
        className={on ? 'fill-rose-500 text-rose-500' : 'text-tpl-ink'}
      />
    </button>
  );
}

export function SectionHeader({
  title,
  text,
  href,
  action = 'View all',
  children,
}: {
  title: string;
  text?: string;
  href?: string;
  action?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className="text-[clamp(1.75rem,3.2vw,2.6rem)] font-semibold leading-tight tracking-[-0.03em]">
          {title}
        </h2>
        {text && <p className="mt-2 max-w-xl text-tpl-muted">{text}</p>}
      </div>
      {children}
      {href && (
        <Link
          href={href}
          className="inline-flex h-10 items-center gap-1.5 rounded-full border border-tpl-ink/15 bg-tpl-surface px-4 text-sm font-medium transition-colors hover:border-tpl-ink"
        >
          {action}
          <ArrowUpRight size={15} aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}

export function percentOff(price: number, compareAt?: number) {
  return compareAt ? Math.round(((compareAt - price) / compareAt) * 100) : 0;
}
