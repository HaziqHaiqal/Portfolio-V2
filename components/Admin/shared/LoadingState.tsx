'use client';

import * as React from 'react';
import { Skeleton } from '@components/ui/skeleton';
import { cn } from '@lib/utils';

/**
 * Skeletons rather than spinners: the page keeps its shape while data loads,
 * so nothing jumps when it arrives.
 */

export function CardGridSkeleton({
  count = 6,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3',
        className
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="admin-raised rounded-xl border border-border bg-card p-5"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
          <div className="mt-5 space-y-2">
            <Skeleton className="h-2.5 w-full" />
            <Skeleton className="h-2.5 w-4/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="admin-raised divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-16 rounded-md" />
        </div>
      ))}
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="admin-raised space-y-4 rounded-xl border border-border bg-card p-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-9 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function PageSkeleton({ children }: { children?: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-6 w-56" />
        <Skeleton className="h-3.5 w-72" />
      </div>
      {children ?? <CardGridSkeleton />}
    </div>
  );
}
