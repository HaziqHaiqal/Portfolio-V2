'use client';

import * as React from 'react';
import { Plus, X, type LucideIcon } from 'lucide-react';
import { Input } from '@components/ui/input';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { cn } from '@lib/utils';

interface BaseProps {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  unique?: boolean;
  className?: string;
}

function useAdder({ value, onChange, unique = true }: BaseProps) {
  const [draft, setDraft] = React.useState('');

  const add = () => {
    const next = draft.trim();
    if (!next) return;
    if (unique && value.includes(next)) {
      setDraft('');
      return;
    }
    onChange([...value, next]);
    setDraft('');
  };

  const removeAt = (index: number) =>
    onChange(value.filter((_, i) => i !== index));

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      add();
    }
  };

  return { draft, setDraft, add, removeAt, onKeyDown };
}

export function TagInput({
  value,
  onChange,
  placeholder = 'Add an item',
  unique,
  className,
}: BaseProps) {
  const { draft, setDraft, add, removeAt, onKeyDown } = useAdder({
    value,
    onChange,
    unique,
  });

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={add}
          disabled={!draft.trim()}
          aria-label="Add"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((item, index) => (
            <Badge
              key={`${item}-${index}`}
              variant="secondary"
              className="gap-1.5 py-1 pl-2.5 pr-1.5 font-normal"
            >
              {item}
              <button
                type="button"
                onClick={() => removeAt(index)}
                aria-label={`Remove ${item}`}
                className="rounded-sm p-0.5 text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

export function BulletList({
  value,
  onChange,
  placeholder = 'Add an item',
  unique,
  icon: Icon,
  accent = 'primary',
  className,
}: BaseProps & {
  icon?: LucideIcon;
  accent?: 'primary' | 'copper';
}) {
  const { draft, setDraft, add, removeAt, onKeyDown } = useAdder({
    value,
    onChange,
    unique,
  });

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={add}
          disabled={!draft.trim()}
          aria-label="Add"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {value.length > 0 && (
        <ul className="space-y-1.5">
          {value.map((item, index) => (
            <li
              key={`${item}-${index}`}
              className="group flex items-start gap-2.5 rounded-lg border border-border bg-surface-raised/50 px-3 py-2.5 transition-colors hover:border-input"
            >
              {Icon ? (
                <Icon
                  className={cn(
                    'mt-0.5 h-3.5 w-3.5 shrink-0',
                    accent === 'copper' ? 'text-copper' : 'text-primary'
                  )}
                />
              ) : (
                <span
                  className={cn(
                    'mt-[7px] h-1 w-1 shrink-0 rounded-full',
                    accent === 'copper' ? 'bg-copper' : 'bg-primary'
                  )}
                />
              )}
              <span className="flex-1 text-sm leading-relaxed text-foreground">
                {item}
              </span>
              <button
                type="button"
                onClick={() => removeAt(index)}
                aria-label={`Remove item ${index + 1}`}
                className="shrink-0 rounded-sm p-1 text-muted-foreground opacity-0 transition-all hover:bg-destructive/15 hover:text-destructive focus-visible:opacity-100 group-hover:opacity-100"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
