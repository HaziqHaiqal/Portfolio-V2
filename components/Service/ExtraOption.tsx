'use client';

import { Check, Wallet } from 'lucide-react';

const IDLE_CARD =
  'border-gray-200 bg-white/60 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900/30 dark:hover:border-gray-600';

export default function ExtraOption({
  name,
  price,
  description,
  runningCost,
  checked,
  onChange,
  quoted = false,
}: {
  name: string;
  price: string;
  description: string;
  runningCost?: string;
  checked: boolean;
  onChange: () => void;
  quoted?: boolean;
}) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors has-[:focus-visible]:ring-4 ${
        quoted
          ? 'has-[:focus-visible]:ring-purple-500/20'
          : 'has-[:focus-visible]:ring-green-500/20'
      } ${
        checked
          ? quoted
            ? 'border-purple-500/70 bg-purple-500/[0.06] dark:border-purple-400/60'
            : 'border-green-500/70 bg-green-500/[0.06] dark:border-green-400/60'
          : IDLE_CARD
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <span
        aria-hidden="true"
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
          checked
            ? quoted
              ? 'border-purple-600 bg-purple-600 text-white'
              : 'border-green-600 bg-green-600 text-white'
            : 'border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-900'
        }`}
      >
        {checked && <Check size={12} strokeWidth={3} />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-baseline justify-between gap-x-2">
          <span className="font-semibold">{name}</span>
          {price && (
            <span
              className={`text-xs font-semibold ${
                quoted
                  ? 'text-purple-700 dark:text-purple-300'
                  : 'text-green-700 dark:text-green-400'
              }`}
            >
              {price}
            </span>
          )}
        </span>
        <span className="mt-1 block text-xs leading-relaxed text-gray-500 dark:text-gray-400">
          {description}
        </span>
        {runningCost && (
          <span className="mt-2 flex items-start gap-1.5 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
            <Wallet size={13} aria-hidden="true" className="mt-0.5 shrink-0" />
            <span className="sr-only">Running cost: </span>
            {runningCost}
          </span>
        )}
      </span>
    </label>
  );
}
