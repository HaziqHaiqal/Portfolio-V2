'use client';

import { Check } from 'lucide-react';
import { MAX_EXTRA_LANGUAGES, SITE_LANGUAGES } from '@constants/services';

const MAIN_LANGUAGES = SITE_LANGUAGES.filter((item) => item !== 'Other');

export const nextLanguage = (taken: string[]) =>
  SITE_LANGUAGES.find((item) => !taken.includes(item));

// The native select sits invisibly over "Change", so phones open their own picker
// and it never opens behind the modal order window.
export function MainLanguage({
  value,
  onChange,
  className = '',
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <span
      className={`flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-400 ${className}`}
    >
      <span>
        Built in{' '}
        <span className="font-semibold text-gray-900 dark:text-gray-100">
          {value}
        </span>{' '}
        · Included
      </span>
      <span className="relative font-semibold text-gray-900 underline decoration-gray-400 underline-offset-4 has-[:focus-visible]:rounded has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-green-500/40 dark:text-gray-100 dark:decoration-gray-500">
        Change
        <select
          aria-label="Main language"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer appearance-none text-base opacity-0"
        >
          {MAIN_LANGUAGES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </span>
    </span>
  );
}

export function ExtraLanguages({
  main,
  languages,
  onChange,
}: {
  main: string;
  languages: string[];
  onChange: (languages: string[]) => void;
}) {
  const full = languages.length >= MAX_EXTRA_LANGUAGES;

  return (
    <div className="mt-3">
      <div
        role="group"
        aria-label="Extra languages"
        className="flex flex-wrap gap-2"
      >
        {SITE_LANGUAGES.filter((item) => item !== main).map((language) => {
          const on = languages.includes(language);
          return (
            <button
              key={language}
              type="button"
              aria-pressed={on}
              disabled={!on && full}
              onClick={() =>
                onChange(
                  on
                    ? languages.filter((item) => item !== language)
                    : [...languages, language]
                )
              }
              className={`inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/40 disabled:opacity-40 ${
                on
                  ? 'border-green-500 bg-green-500/10 text-green-800 dark:border-green-400 dark:bg-green-400/10 dark:text-green-300'
                  : 'border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300'
              }`}
            >
              {language}
              {on && <Check size={14} strokeWidth={3} aria-hidden="true" />}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        Up to {MAX_EXTRA_LANGUAGES}.
      </p>
    </div>
  );
}
