'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@components/ui/button';
import { cn } from '@lib/utils';
import { rise } from '@constants/motion';

interface EditorPanelProps {
  title: string;
  description?: string;
  /** Returns to the collection view. */
  onBack: () => void;
  backLabel?: string;
  /** Micro-label above the title. */
  eyebrow?: string;
  children: React.ReactNode;
  /** Sticky footer buttons; use FormActions inside a <form> instead when possible. */
  footer?: React.ReactNode;
  className?: string;
}

/**
 * Full-page create/edit surface. Editors swap their collection view for this
 * panel, so the form gets the whole viewport instead of being squeezed into a
 * card beside the list.
 */
export function EditorPanel({
  title,
  description,
  onBack,
  backLabel = 'Back',
  eyebrow = 'Editing',
  children,
  footer,
  className,
}: EditorPanelProps) {
  return (
    <motion.div {...rise} className={cn('space-y-6', className)}>
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="-ml-2 h-8 gap-1.5 px-2 text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Button>
      </div>

      <div className="relative isolate admin-bloom space-y-2">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="h-px w-6 bg-copper" />
            <p className="admin-eyebrow">{eyebrow}</p>
          </div>
          <h1 className="admin-display text-2xl font-semibold text-foreground">
            {title}
          </h1>
          {description && (
            <p className="max-w-xl text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>

      <div className="admin-raised overflow-hidden rounded-xl border border-border bg-card">
        <div className="space-y-8 p-6">{children}</div>
        {footer}
      </div>
    </motion.div>
  );
}
