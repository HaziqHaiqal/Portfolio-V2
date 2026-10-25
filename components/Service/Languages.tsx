'use client';

import { ChevronDown, Plus, X } from 'lucide-react';
import { MAX_EXTRA_LANGUAGES, SITE_LANGUAGES } from '@constants/services';

export const MAIN_LANGUAGES = SITE_LANGUAGES.filter((item) => item !== 'Other');

export const nextLanguage = (taken: string[]) =>
  SITE_LANGUAGES.find((item) => !taken.includes(item));

// Native select: a Radix dropdown would open behind the modal order window.
export function LanguageSelect({
  value,
  options,
  label,
  onChange,
}: {
  value: string;
  options: string[];
  label: string;
  onChange: (value: string) => void;
}) {
  return (
    <span className="relative inline-flex w-44 max-w-full">
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-10 w-full cursor-pointer appearance-none rounded-full border border-gray-300 bg-white pl-4 pr-10 text-sm font-medium text-gray-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        aria-hidden="true"
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400"
      />
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
  const next = nextLanguage([main, ...languages]);

  return (
    <div className="mt-3 space-y-2">
      {languages.map((language, index) => (
        <div key={index} className="flex items-center gap-1">
          <LanguageSelect
            value={language}
            label={`Extra language ${index + 1}`}
            options={SITE_LANGUAGES.filter(
              (item) =>
                item === language ||
                (item !== main && !languages.includes(item))
            )}
            onChange={(value) =>
              onChange(
                languages.map((item, at) => (at === index ? value : item))
              )
            }
          />
          <button
            type="button"
            onClick={() => onChange(languages.filter((_, at) => at !== index))}
            aria-label={`Remove ${language}`}
            className="flex h-10 w-10 items-center justify-center rounded-full text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/40 dark:text-gray-400"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      ))}
      {next && languages.length < MAX_EXTRA_LANGUAGES && (
        <button
          type="button"
          onClick={() => onChange([...languages, next])}
          className="inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/40 dark:text-gray-300"
        >
          <Plus size={14} aria-hidden="true" />
          Add another language
        </button>
      )}
    </div>
  );
}
