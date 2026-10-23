'use client';

import { ChevronDown } from 'lucide-react';
import { SITE_TYPES, type SiteType } from '@constants/services';

export default function SiteTypePicker({
  value,
  onChange,
  idPrefix,
}: {
  value: SiteType | null;
  onChange: (value: SiteType) => void;
  idPrefix: string;
}) {
  const selectId = `${idPrefix}-site-type`;

  return (
    <fieldset>
      <legend className="mb-3 flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-2">
        <span className="font-bold text-gray-900 dark:text-gray-100">
          What kind of business is it?
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Shows the add-ons that fit
        </span>
      </legend>

      <div className="hidden flex-wrap gap-2 sm:flex">
        {SITE_TYPES.map((type) => {
          const checked = value === type.id;
          return (
            <label
              key={type.id}
              className={`relative flex min-h-10 cursor-pointer items-center rounded-full border px-4 text-sm font-medium transition-all duration-200 has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-green-500/20 ${
                checked
                  ? 'border-gray-900 bg-gray-900 text-white dark:border-white dark:bg-white dark:text-gray-900'
                  : 'border-gray-300 bg-white/60 text-gray-700 hover:border-gray-400 dark:border-gray-600 dark:bg-gray-800/60 dark:text-gray-300'
              }`}
            >
              <input
                type="radio"
                name={selectId}
                value={type.id}
                checked={checked}
                onChange={() => onChange(type.id)}
                className="sr-only"
              />
              {type.label}
            </label>
          );
        })}
      </div>

      <div className="relative sm:hidden">
        <label htmlFor={selectId} className="sr-only">
          Business type
        </label>
        <select
          id={selectId}
          value={value ?? ''}
          onChange={(event) =>
            event.target.value && onChange(event.target.value as SiteType)
          }
          className="w-full appearance-none rounded-xl border border-gray-200 bg-white py-3 pl-4 pr-10 text-sm text-gray-800 outline-none transition-colors focus:border-green-500/60 focus:ring-4 focus:ring-green-500/15 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
        >
          <option value="" disabled>
            Choose your type of business
          </option>
          {SITE_TYPES.map((type) => (
            <option key={type.id} value={type.id}>
              {type.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
      </div>
    </fieldset>
  );
}
