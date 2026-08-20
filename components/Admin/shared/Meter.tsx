'use client';

import * as React from 'react';
import { cn } from '@lib/utils';

export function ProficiencyBar({
  value,
  from,
  to,
  label = 'Proficiency',
  className,
}: {
  value: number;
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
