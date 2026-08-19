'use client';

import * as React from 'react';
import { Label } from '@components/ui/label';
import { cn } from '@lib/utils';

/**
 * Form building blocks shared by every editor.
 *
 * Forms are grouped into titled sections on a single card surface rather than
 * one flat wall of inputs, so a long record stays scannable.
 */

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormSection({
  title,
  description,
  children,
  className,
}: FormSectionProps) {
  return (
    <section
      className={cn(
        'space-y-4 border-t border-border/70 pt-7 first:border-t-0 first:pt-0',
        className
      )}
    >
      <div className="space-y-1">
        <h3 className="admin-display flex items-center gap-2 text-sm font-medium text-foreground">
          <span className="h-3.5 w-[2px] rounded-full bg-primary" />
          {title}
        </h3>
        {description && (
          <p className="pl-[14px] text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

/** Responsive two-column field grid. Pass `columns={1}` for full-width rows. */
export function FormGrid({
  children,
  columns = 2,
  className,
}: {
  children: React.ReactNode;
  columns?: 1 | 2 | 3;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'grid gap-4',
        columns === 1 && 'grid-cols-1',
        columns === 2 && 'grid-cols-1 md:grid-cols-2',
        columns === 3 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        className
      )}
    >
      {children}
    </div>
  );
}

interface FieldProps {
  label: string;
  htmlFor?: string;
  /** Renders a subtle marker next to the label. */
  required?: boolean;
  /** Helper copy under the control. */
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

export function Field({
  label,
  htmlFor,
  required,
  hint,
  error,
  children,
  className,
}: FieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <Label
        htmlFor={htmlFor}
        className="text-xs font-medium text-muted-foreground"
      >
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {children}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : (
        hint && <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

/**
 * A labelled switch/checkbox row. Keeps toggles from being mistaken for
 * ordinary fields by giving them their own inset surface.
 */
export function ToggleRow({
  label,
  description,
  control,
  className,
}: {
  label: string;
  description?: string;
  control: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 rounded-lg border border-border bg-surface-raised/60 px-4 py-3 transition-colors hover:border-input',
        className
      )}
    >
      <div className="min-w-0 space-y-0.5">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  );
}

/** Sticky action bar pinned to the bottom of an editor form. */
export function FormActions({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-2 border-t border-border bg-surface-sunken/60 px-6 py-4',
        className
      )}
    >
      {children}
    </div>
  );
}
