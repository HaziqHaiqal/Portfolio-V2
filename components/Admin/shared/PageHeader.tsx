'use client';

import * as React from 'react';
import { cn } from '@lib/utils';

interface PageHeaderProps {
  /** Micro-label above the title. */
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  /** Adds the steel-blue bloom behind the title. On by default. */
  bloom?: boolean;
  className?: string;
}

/**
 * The single header treatment for every admin page. A copper rule anchors the
 * title block; a soft accent bloom sits behind it so the top of the page has
 * some light in it rather than starting cold.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  bloom = true,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('relative isolate', bloom && 'admin-bloom', className)}>
      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 space-y-2">
          {eyebrow && (
            <div className="flex items-center gap-2">
              <span className="h-px w-6 bg-copper" />
              <p className="admin-eyebrow">{eyebrow}</p>
            </div>
          )}
          <h1 className="admin-display truncate text-2xl font-semibold text-foreground">
            {title}
          </h1>
          {description && (
            <p className="max-w-xl text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        )}
      </div>
    </div>
  );
}
