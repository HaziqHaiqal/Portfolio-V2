'use client';

import { ChevronDown, Languages, Wallet, X } from 'lucide-react';
import { MULTI_LANGUAGE } from '@constants/services';
import { formatRM } from '@lib/format';

export default function LanguagePicker({
  languages,
  onChange,
  idPrefix,
  className = '',
}: {
  languages: string[];
  onChange: (languages: string[]) => void;
  idPrefix: string;
  className?: string;
}) {
  const on = languages.length > 0;
  const available = MULTI_LANGUAGE.languages.filter(
    (language) => !languages.includes(language)
  );
  const selectId = `${idPrefix}-language`;

  return (
    <div
      className={`rounded-2xl border p-4 transition-colors ${
        on
          ? 'border-green-500/70 bg-green-500/[0.06] dark:border-green-400/60'
          : 'border-gray-200 bg-white/60 dark:border-gray-700 dark:bg-gray-900/30'
      } ${className}`}
    >
      <div className="flex items-start gap-3">
        <Languages
          size={20}
          strokeWidth={1.8}
          aria-hidden="true"
          className={`mt-0.5 shrink-0 ${on ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-2">
            <label htmlFor={selectId} className="font-semibold">
              {MULTI_LANGUAGE.name}
            </label>
            <span className="text-xs font-semibold text-green-700 dark:text-green-400">
              {on
                ? `+${formatRM(languages.length * MULTI_LANGUAGE.pricePerLanguage)}`
                : `${formatRM(MULTI_LANGUAGE.pricePerLanguage)} per language`}
            </span>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
            {MULTI_LANGUAGE.description}
          </p>
          <p className="mt-2 flex items-start gap-1.5 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
            <Wallet size={13} aria-hidden="true" className="mt-0.5 shrink-0" />
            <span className="sr-only">Running cost: </span>
            {MULTI_LANGUAGE.runningCost}
          </p>

          {on && (
            <ul
              aria-label="Added languages"
              className="mt-3 flex flex-wrap gap-2"
            >
              {languages.map((language) => (
                <li key={language}>
                  <button
                    type="button"
                    onClick={() =>
                      onChange(languages.filter((item) => item !== language))
                    }
                    aria-label={`Remove ${language}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-green-600/10 py-1 pl-3 pr-2 text-xs font-medium text-green-800 transition-colors hover:bg-green-600/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/40 dark:bg-green-400/10 dark:text-green-300 dark:hover:bg-green-400/20"
                  >
                    {language}
                    <X size={12} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {available.length > 0 && (
            <div className="relative mt-3">
              <select
                id={selectId}
                value=""
                onChange={(event) =>
                  event.target.value &&
                  onChange([...languages, event.target.value])
                }
                className="w-full appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-3 pr-10 text-sm text-gray-700 outline-none transition-colors focus:border-green-500/60 focus:ring-4 focus:ring-green-500/15 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
              >
                <option value="">
                  {on ? 'Add another language' : 'Add a language'}
                </option>
                {available.map((language) => (
                  <option key={language} value={language}>
                    {language}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                aria-hidden="true"
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
