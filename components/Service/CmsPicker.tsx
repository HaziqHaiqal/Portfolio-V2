'use client';

import { Check, Wallet } from 'lucide-react';
import { cmsPrice, type CmsConfig, type CmsTab } from '@constants/services';
import { formatRM } from '@lib/format';

const GROUP_ORDER: CmsTab['group'][] = ['pages', 'sell', 'show'];

function Box({
  checked,
  muted = false,
}: {
  checked: boolean;
  muted?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md border transition-colors ${
        checked
          ? 'border-green-600 bg-green-600 text-white'
          : 'border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-900'
      } ${muted ? 'opacity-50' : ''}`}
    >
      {checked && <Check size={11} strokeWidth={3} />}
    </span>
  );
}

function Row({
  name,
  price,
  checked,
  locked = false,
  onToggle,
}: {
  name: string;
  price: string;
  checked: boolean;
  locked?: boolean;
  onToggle?: () => void;
}) {
  return (
    <label
      className={`-mx-2 flex items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-green-500/40 ${
        locked
          ? 'cursor-default'
          : 'cursor-pointer hover:bg-gray-900/[0.04] dark:hover:bg-white/[0.04]'
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={locked}
        onChange={onToggle}
        className="sr-only"
      />
      <Box checked={checked} muted={locked} />
      <span className="min-w-0 flex-1 text-gray-800 dark:text-gray-200">
        {name}
      </span>
      <span
        className={`shrink-0 text-xs font-semibold tabular-nums ${
          locked
            ? 'text-gray-500 dark:text-gray-400'
            : 'text-green-700 dark:text-green-400'
        }`}
      >
        {price}
      </span>
    </label>
  );
}

/** `selection` is null when the CMS is off and lists the chosen tabs when on. */
export default function CmsPicker({
  cms,
  selection,
  onChange,
  idPrefix,
  className = '',
}: {
  cms: CmsConfig;
  selection: string[] | null;
  onChange: (selection: string[] | null) => void;
  idPrefix: string;
  className?: string;
}) {
  const on = selection !== null;
  const tabIds = selection ?? [];
  const toggleTab = (id: string) =>
    onChange(
      tabIds.includes(id)
        ? tabIds.filter((item) => item !== id)
        : [...tabIds, id]
    );

  return (
    <div
      className={`rounded-2xl border transition-colors ${
        on
          ? 'border-green-500/70 bg-green-500/[0.06] dark:border-green-400/60 dark:bg-green-400/[0.06]'
          : 'border-gray-200 bg-white/60 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900/30 dark:hover:border-gray-600'
      } ${className}`}
    >
      <label className="flex cursor-pointer items-start gap-3 rounded-2xl p-4 has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-green-500/20">
        <input
          type="checkbox"
          checked={on}
          onChange={() => onChange(on ? null : [])}
          aria-controls={`${idPrefix}-cms-tabs`}
          className="sr-only"
        />
        <span
          aria-hidden="true"
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
            on
              ? 'border-green-600 bg-green-600 text-white'
              : 'border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-900'
          }`}
        >
          {on && <Check size={12} strokeWidth={3} />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-baseline justify-between gap-x-2">
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {cms.name}
            </span>
            <span className="text-xs font-semibold text-green-700 dark:text-green-400">
              {on
                ? `+${formatRM(cmsPrice(cms, tabIds))}`
                : `From ${formatRM(cms.price)}`}
            </span>
          </span>
          <span className="mt-1 block text-xs leading-relaxed text-gray-500 dark:text-gray-400">
            {cms.description}
          </span>
          <span className="mt-2 flex items-start gap-1.5 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
            <Wallet size={13} aria-hidden="true" className="mt-0.5 shrink-0" />
            <span className="sr-only">Running cost: </span>
            {cms.runningCost}
          </span>
        </span>
      </label>

      {on && (
        <fieldset
          id={`${idPrefix}-cms-tabs`}
          className="mx-4 mb-3 border-t border-gray-200 pt-2 dark:border-gray-700 sm:ml-12"
        >
          <legend className="sr-only">
            What do you want to update yourself?
          </legend>
          <div className="max-w-md">
            <Row name={cms.dashboard} price="Included" checked locked />
            {GROUP_ORDER.map((group) => {
              const tabs = cms.tabs.filter((tab) => tab.group === group);
              if (!tabs.length) return null;
              return (
                <div key={group} className="mt-2">
                  <p className="pb-0.5 pt-1 text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    {cms.groups[group]}
                  </p>
                  {tabs.map((tab) => (
                    <Row
                      key={tab.id}
                      name={tab.name}
                      price={`+${formatRM(tab.price)}`}
                      checked={tabIds.includes(tab.id)}
                      onToggle={() => toggleTab(tab.id)}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        </fieldset>
      )}
    </div>
  );
}
