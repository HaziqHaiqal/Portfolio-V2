'use client';

import { useState } from 'react';
import { Loader2, Tag } from 'lucide-react';
import type { PromoTarget } from '@constants/services';
import { formatSiteLastDay } from '@lib/format';
import { promoAppliesTo, rewardSummary } from '@lib/promo';
import { usePromo } from './PromoProvider';

const STATUS_MESSAGES = {
  invalid: 'That code is invalid or has expired.',
  error: "Couldn't check the code. Please try again.",
} as const;

const TICKET =
  'flex w-full items-center gap-3 rounded-xl border-[1.5px] border-dashed px-3.5 transition-colors';

export default function PromoField({
  targets,
  inputId = 'promo-code',
}: {
  targets: PromoTarget[];
  inputId?: string;
}) {
  const { promo, status, apply, clear } = usePromo();
  const [draft, setDraft] = useState('');
  const checking = status === 'checking';
  const ready = Boolean(draft.trim()) && !checking;

  if (promo) {
    const eligible = targets.some((target) =>
      promoAppliesTo(promo, [target.id])
    );

    return (
      <div
        role="status"
        className={`${TICKET} min-h-11 py-2 ${
          eligible
            ? 'border-green-500/60 bg-green-500/[0.07] dark:border-green-400/50 dark:bg-green-400/[0.07]'
            : 'border-gray-300 dark:border-gray-600'
        }`}
      >
        <Tag
          size={17}
          aria-hidden="true"
          className={`shrink-0 ${eligible ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}
        />
        <p className="min-w-0 flex-1 truncate text-sm text-gray-900 dark:text-gray-100">
          <span className="font-semibold tracking-wide">{promo.code}</span>
          <span className="text-gray-600 dark:text-gray-300">
            {' '}
            · {eligible ? rewardSummary(promo) : 'not valid for this service'}
          </span>
          {eligible && promo.expiresAt && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {' '}
              · until {formatSiteLastDay(promo.expiresAt)}
            </span>
          )}
        </p>
        <button
          type="button"
          onClick={clear}
          aria-label={`Remove promo code ${promo.code}`}
          className="shrink-0 text-xs font-medium text-gray-500 underline-offset-4 hover:text-gray-900 hover:underline dark:text-gray-400 dark:hover:text-white"
        >
          Remove
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (ready) void apply(draft);
      }}
      className="w-full"
    >
      <label htmlFor={inputId} className="sr-only">
        Promo code
      </label>
      <div
        className={`${TICKET} focus-within:border-green-500/70 focus-within:bg-green-500/[0.04] dark:focus-within:border-green-400/60 ${
          status === 'invalid'
            ? 'border-red-400/70 dark:border-red-400/60'
            : 'border-gray-300 dark:border-gray-600'
        }`}
      >
        <Tag size={17} aria-hidden="true" className="shrink-0 text-gray-400" />
        <input
          id={inputId}
          value={draft}
          onChange={(e) => setDraft(e.target.value.toUpperCase())}
          placeholder="Enter promo code"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={32}
          aria-invalid={status === 'invalid' || undefined}
          className="min-h-11 min-w-0 flex-1 bg-transparent text-sm font-semibold tracking-wide text-gray-900 placeholder:font-normal placeholder:tracking-normal placeholder:text-gray-400 focus:outline-none dark:text-gray-100 dark:placeholder:text-gray-500"
        />
        <button
          type="submit"
          disabled={!ready}
          className="inline-flex min-h-11 shrink-0 items-center gap-1.5 text-sm font-semibold text-green-700 transition-colors hover:text-green-600 disabled:cursor-default disabled:text-gray-400 dark:text-green-400 dark:hover:text-green-300 dark:disabled:text-gray-500"
        >
          {checking && (
            <Loader2 size={14} aria-hidden="true" className="animate-spin" />
          )}
          Apply
        </button>
      </div>
      <p
        aria-live="polite"
        className="text-xs text-red-600 dark:text-red-400 [&:not(:empty)]:mt-1.5"
      >
        {status === 'invalid' || status === 'error'
          ? STATUS_MESSAGES[status]
          : ''}
      </p>
    </form>
  );
}
