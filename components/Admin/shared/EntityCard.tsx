'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Pencil, Star, Trash2 } from 'lucide-react';
import { Button } from '@components/ui/button';
import { cn } from '@lib/utils';
import { listItem } from '@constants/motion';

/**
 * The card used for one record in a collection view. Every editor renders this
 * same surface, so Projects, Skills and Education stop looking like three
 * different products.
 *
 * Depth comes from `admin-raised` — a 1px top highlight plus a real shadow —
 * and hover lifts the border to steel blue rather than moving the card.
 */

interface EntityCardProps {
  /** Full-bleed 16:9 image rendered above everything else. */
  cover?: React.ReactNode;
  /** Avatar, logo, icon tile — anything 40px square. */
  media?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Badges or status pills shown under the title block. */
  meta?: React.ReactNode;
  /** Corner slot, typically a featured indicator. */
  adornment?: React.ReactNode;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function EntityCard({
  cover,
  media,
  title,
  subtitle,
  meta,
  adornment,
  children,
  actions,
  onClick,
  className,
}: EntityCardProps) {
  return (
    <motion.div
      variants={listItem}
      className={cn(
        'admin-raised hover:admin-raised-hover group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card',
        'transition-[border-color,box-shadow,background-color] duration-200',
        'hover:border-primary/40 hover:bg-surface-raised/60',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {cover}

      {adornment && (
        <div className="absolute right-3 top-3 z-20">{adornment}</div>
      )}

      <div className="flex items-start gap-3 p-5 pb-3">
        {media && <div className="shrink-0">{media}</div>}
        <div className="min-w-0 flex-1 space-y-1">
          <h3 className="admin-display truncate pr-6 text-[15px] font-medium leading-5 text-foreground">
            {title}
          </h3>
          {subtitle && (
            <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
          )}
          {meta && <div className="flex flex-wrap gap-1.5 pt-1.5">{meta}</div>}
        </div>
      </div>

      {children && <div className="flex-1 px-5 pb-4">{children}</div>}

      {actions && (
        <div className="mt-auto flex items-center justify-end gap-1 border-t border-border/70 bg-surface-sunken/40 px-3 py-2">
          {actions}
        </div>
      )}
    </motion.div>
  );
}

/**
 * Square media tile with a fixed size and fallback, so cards line up whether
 * the record has a logo or not.
 */
export function MediaTile({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'admin-raised flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-surface-raised text-sm font-medium text-muted-foreground',
        className
      )}
    >
      {children}
    </div>
  );
}

/** Compact ghost icon button used in card action rows and list rows. */
export const IconAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button> & { label: string; destructive?: boolean }
>(({ label, destructive, className, children, ...props }, ref) => (
  <Button
    ref={ref}
    type="button"
    variant="ghost"
    size="sm"
    title={label}
    aria-label={label}
    className={cn(
      'h-8 w-8 p-0 text-muted-foreground transition-colors',
      destructive
        ? 'hover:bg-destructive/15 hover:text-destructive'
        : 'hover:bg-accent hover:text-foreground',
      className
    )}
    {...props}
  >
    {children}
  </Button>
));
IconAction.displayName = 'IconAction';

/** The default edit + delete pairing, since every collection needs it. */
export function EditDeleteActions({
  onEdit,
  onDelete,
  disabled,
  extra,
}: {
  onEdit: () => void;
  onDelete: () => void;
  disabled?: boolean;
  /** Rendered before edit/delete — e.g. a feature toggle. */
  extra?: React.ReactNode;
}) {
  return (
    <>
      {extra}
      <IconAction label="Edit" onClick={onEdit} disabled={disabled}>
        <Pencil className="h-3.5 w-3.5" />
      </IconAction>
      <IconAction
        label="Delete"
        destructive
        onClick={onDelete}
        disabled={disabled}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </IconAction>
    </>
  );
}

/**
 * The featured marker. A small copper star on a legible backdrop — used in the
 * `adornment` slot so it works both on a plain card and on top of a cover
 * image. Deliberately the *only* featured treatment: an earlier version also
 * drew a copper edge down every featured card, which meant nothing once most
 * records were featured.
 */
export function FeaturedMark({ onCover }: { onCover?: boolean }) {
  return (
    <span
      title="Featured"
      className={cn(
        'flex h-6 w-6 items-center justify-center rounded-md',
        onCover ? 'bg-background/70 backdrop-blur' : 'bg-transparent'
      )}
    >
      <Star className="h-3.5 w-3.5 fill-copper text-copper" />
    </span>
  );
}

/** 16:9 cover for a record that has a real image. */
export function CardCover({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden border-b border-border bg-surface-sunken">
      {children}
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-card/80 to-transparent"
      />
    </div>
  );
}
