'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@lib/utils';
import { listItem } from '@constants/motion';

interface StatTileProps {
  label: string;
  value: number | string;
  /** Short qualifier under the number, e.g. "3 featured". */
  hint?: string;
  icon: LucideIcon;
  onClick?: () => void;
  className?: string;
}

/**
 * Dashboard metric. No trend arrows — the previous version rendered a green
 * "increase" chevron on every tile regardless of whether anything had changed,
 * which made all four of them meaningless.
 */
export function StatTile({
  label,
  value,
  hint,
  icon: Icon,
  onClick,
  className,
}: StatTileProps) {
  return (
    <motion.div
      variants={listItem}
      onClick={onClick}
      className={cn(
        'group admin-raised relative overflow-hidden rounded-xl border border-border bg-card p-5',
        'transition-[border-color,box-shadow] duration-200',
        onClick && 'cursor-pointer hover:border-primary/40 hover:admin-raised-hover',
        className
      )}
    >
      {/* Accent edge, revealed on hover. */}
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
    </motion.div>
  );
}
