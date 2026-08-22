'use client';

import * as React from 'react';
import { m } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@lib/utils';
import { listItem } from '@constants/motion';

interface StatTileProps {
  label: string;
  value: number | string;
  hint?: string;
  icon: LucideIcon;
  onClick?: () => void;
  className?: string;
}

export function StatTile({
  label,
  value,
  hint,
  icon: Icon,
  onClick,
  className,
}: StatTileProps) {
  return (
    <m.div
      variants={listItem}
      onClick={onClick}
      className={cn(
        'admin-raised group relative overflow-hidden rounded-xl border border-border bg-card p-5',
        'transition-[border-color,box-shadow] duration-200',
        onClick &&
          'hover:admin-raised-hover cursor-pointer hover:border-primary/40',
        className
      )}
    >
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100"
      />

      <div className="flex items-start justify-between gap-3">
        <p className="admin-eyebrow">{label}</p>
        <div className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-surface-raised transition-colors group-hover:border-primary/40">
          <Icon className="h-3.5 w-3.5 text-muted-foreground transition-colors group-hover:text-primary" />
        </div>
      </div>
      <p className="admin-display mt-4 text-3xl font-semibold tabular-nums text-foreground">
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </m.div>
  );
}
