'use client';

import * as React from 'react';
import { m } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@components/ui/button';
import { cn } from '@lib/utils';
import { rise } from '@constants/motion';

interface EditorPanelProps {
  title: string;
  description?: string;
  onBack: () => void;
  backLabel?: string;
  eyebrow?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

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
    <m.div {...rise} className={cn('space-y-6', className)}>
      <div className="admin-bloom relative isolate space-y-5">
        <div className="relative z-10 space-y-5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onBack}
            className="admin-raised h-8 gap-1.5 border-border bg-card px-2.5 text-xs font-normal text-muted-foreground hover:border-input hover:bg-accent hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {backLabel}
          </Button>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="h-px w-6 bg-copper" />
              <p className="admin-eyebrow">{eyebrow}</p>
            </div>
            <h1 className="admin-display text-2xl font-semibold text-foreground">
              {title}
            </h1>
            {description && (
              <p className="max-w-xl text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="admin-raised overflow-hidden rounded-xl border border-border bg-card">
        <div className="space-y-8 p-6">{children}</div>
        {footer}
      </div>
    </m.div>
  );
}
