'use client';

import * as React from 'react';
import { cn } from '@lib/utils';

/**
 * Progress readout for a percentage. The figure is the hero — a 1px bar alone
 * was unreadable against the card surface, especially when the stored gradient
 * colours were dark.
 */
export function ProficiencyBar({
  value,
  from,
  to,
  label = 'Proficiency',
  className,
}: {
  value: number;
  /** Optional stored gradient. Falls back to the steel accent. */
  from?: string;
  to?: string;
  label?: string;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, value));
  const fill =
    from && to
      ? { background: `linear-gradient(90deg, ${from}, ${to})` }
      : undefined;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="admin-eyebrow">{label}</span>
        <span className="admin-display text-sm font-semibold tabular-nums text-foreground">
          {pct}
          <span className="ml-0.5 text-[11px] font-normal text-muted-foreground">
            %
          </span>
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-sunken ring-1 ring-inset ring-border">
        <div
          className={cn('h-full rounded-full', !fill && 'bg-primary')}
          style={{ width: `${pct}%`, ...fill }}
        />
      </div>
    </div>
  );
}

/**
 * Segmented meter for ordinal levels (Beginner → Expert).
 *
 * One colour for every level on purpose. The number of filled segments already
 * encodes the level, so tinting the top one adds a second encoding that reads
 * as an error next to its neighbours — and copper is spoken for elsewhere as
 * the featured/current marker.
 */
export function LevelMeter({
  level,
  levels,
  className,
}: {
  level: string;
  levels: string[];
  className?: string;
}) {
  const index = levels.indexOf(level);
  const filled = index < 0 ? 0 : index + 1;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="flex gap-1" aria-hidden>
        {levels.map((_, i) => (
          <span
            key={i}
            className={cn(
              'h-1 w-4 rounded-full transition-colors',
              i < filled
                ? 'bg-primary'
                : 'bg-surface-sunken ring-1 ring-inset ring-border'
            )}
          />
        ))}
      </span>
      <span className="text-[11px] text-muted-foreground">{level}</span>
    </div>
  );
}
