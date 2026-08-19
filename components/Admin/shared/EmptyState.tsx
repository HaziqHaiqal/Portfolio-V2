'use client';

import * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

/**
 * Shown when a collection is empty or filtered to nothing. Sits on the sunken
 * surface with the blueprint grid showing through, so an empty page still has
 * something to look at.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'admin-grid relative flex flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-surface-sunken px-6 py-16 text-center',
        className
      )}
    >
      <div className="admin-raised mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-card">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h3 className="admin-display text-base font-medium text-foreground">
        {title}
      </h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
