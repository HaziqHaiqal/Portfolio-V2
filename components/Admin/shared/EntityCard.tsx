'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Pencil, Star, Trash2 } from 'lucide-react';
import { Button } from '@components/ui/button';
import { cn } from '@lib/utils';
import { listItem } from '@constants/motion';

interface EntityCardProps {
  cover?: React.ReactNode;
  media?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  meta?: React.ReactNode;
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

export function MediaTile({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={style}
      className={cn(
        'admin-raised flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-surface-raised text-sm font-medium text-muted-foreground',
        className
      )}
    >
      {children}
    </div>
  );
}

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

export function EditDeleteActions({
  onEdit,
  onDelete,
  disabled,
  extra,
}: {
  onEdit: () => void;
  onDelete: () => void;
  disabled?: boolean;
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
