'use client';

import * as React from 'react';
import { cn } from '@lib/utils';

interface ToolbarProps {
  children: React.ReactNode;
  meta?: React.ReactNode;
  className?: string;
}

export function Toolbar({ children, meta, className }: ToolbarProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        {children}
      </div>
      {meta && (
        <p className="shrink-0 text-xs tabular-nums text-muted-foreground">
          {meta}
        </p>
      )}
    </div>
  );
}
