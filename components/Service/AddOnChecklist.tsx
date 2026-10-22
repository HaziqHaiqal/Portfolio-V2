'use client';

import { useState, type ReactNode } from 'react';
import { Check, ChevronDown, Wallet, X } from 'lucide-react';
import {
  type AddOn,
  cmsPrice,
  type CmsConfig,
  type CmsTab,
  MULTI_LANGUAGE,
  offeredFor,
  type SiteType,
} from '@constants/services';
import { formatRM } from '@lib/format';

const GROUP_ORDER: CmsTab['group'][] = ['pages', 'sell', 'show'];

export interface AddOnGroup {
  label: string;
  addOns: AddOn[];
}

function Box({
  checked,
  quoted = false,
  small = false,
  muted = false,
}: {
  checked: boolean;
  quoted?: boolean;
  small?: boolean;
  muted?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-md border transition-colors ${
        small ? 'h-4 w-4' : 'mt-0.5 h-[18px] w-[18px]'
      } ${
        checked
          ? quoted
            ? 'border-purple-600 bg-purple-600 text-white'
            : 'border-green-600 bg-green-600 text-white'
          : 'border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-900'
      } ${muted ? 'opacity-50' : ''}`}
    >
      {checked && <Check size={small ? 10 : 11} strokeWidth={3} />}
    </span>
  );
}

function Row({
  name,
  price,
  description,
  runningCost,
  checked,
  onToggle,
  quoted = false,
  locked = false,
  children,
}: {
  name: string;
  price: string;
  description: string;
  runningCost?: string;
  checked: boolean;
  onToggle: () => void;
  quoted?: boolean;
  /** Already part of the package or build: ticked and fixed. */
  locked?: boolean;
  /** Shown under the row while it is ticked. */
  children?: ReactNode;
}) {
  return (
    <li
      className={`transition-colors ${
        checked ? (quoted ? 'bg-purple-500/[0.06]' : 'bg-green-500/[0.06]') : ''
      }`}
    >
      <label
        className={`flex items-start gap-3 px-4 py-3.5 ${locked ? 'cursor-default' : 'cursor-pointer'} has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-inset has-[:focus-visible]:ring-green-500/40 sm:px-5`}
      >
        <input
          type="checkbox"
          checked={checked}
          disabled={locked}
          onChange={onToggle}
          className="sr-only"
        />
        <Box checked={checked} quoted={quoted} muted={locked} />
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline justify-between gap-3">
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {name}
            </span>
            {price && (
              <span
                className={`shrink-0 text-xs font-semibold tabular-nums ${
                  locked
                    ? 'text-gray-500 dark:text-gray-400'
                    : quoted
                      ? 'text-purple-700 dark:text-purple-300'
                      : 'text-green-700 dark:text-green-400'
                }`}
              >
                {price}
              </span>
            )}
          </span>
          <span className="mt-0.5 block text-xs leading-relaxed text-gray-500 dark:text-gray-400">
            {description}
          </span>
          {runningCost && (
            <span className="mt-1 flex items-start gap-1.5 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
              <Wallet
                size={12}
                aria-hidden="true"
                className="mt-0.5 shrink-0"
              />
              <span className="sr-only">Running cost: </span>
              {runningCost}
            </span>
          )}
        </span>
      </label>
      {checked && children && (
        <div className="pb-4 pl-[46px] pr-4 sm:pl-[50px] sm:pr-5">
          {children}
        </div>
      )}
    </li>
  );
}

function LanguageRow({
  languages,
  onChange,
  idPrefix,
}: {
  languages: string[];
  onChange: (languages: string[]) => void;
  idPrefix: string;
}) {
  const [open, setOpen] = useState(languages.length > 0);
  const checked = open || languages.length > 0;
  const available = MULTI_LANGUAGE.languages.filter(
    (language) => !languages.includes(language)
  );
  const selectId = `${idPrefix}-language`;

  return (
    <Row
      name={MULTI_LANGUAGE.name}
      price={
        languages.length
          ? `+${formatRM(languages.length * MULTI_LANGUAGE.pricePerLanguage)}`
          : `${formatRM(MULTI_LANGUAGE.pricePerLanguage)} per language`
      }
      description={MULTI_LANGUAGE.description}
      checked={checked}
      onToggle={() => {
        if (checked) onChange([]);
        setOpen(!checked);
      }}
    >
      {languages.length > 0 && (
        <ul aria-label="Added languages" className="mb-2 flex flex-wrap gap-2">
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
        <div className="relative max-w-xs">
          <label htmlFor={selectId} className="sr-only">
            Add a language
          </label>
          <select
            id={selectId}
            value=""
            onChange={(event) =>
              event.target.value && onChange([...languages, event.target.value])
            }
            className="w-full appearance-none rounded-xl border border-gray-200 bg-white py-2 pl-3 pr-9 text-sm text-gray-700 outline-none transition-colors focus:border-green-500/60 focus:ring-4 focus:ring-green-500/15 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
          >
            <option value="">
              {languages.length ? 'Add another language' : 'Add a language'}
            </option>
            {available.map((language) => (
              <option key={language} value={language}>
                {language}
              </option>
            ))}
          </select>
          <ChevronDown
            size={15}
            aria-hidden="true"
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
        </div>
      )}
    </Row>
  );
}

function DashboardRow({
  cms,
  selection,
  onChange,
  siteType,
  idPrefix,
}: {
  cms: CmsConfig;
  selection: string[] | null;
  onChange: (selection: string[] | null) => void;
  siteType: SiteType | null;
  idPrefix: string;
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
    <Row
      name={cms.name}
      price={
        on
          ? `+${formatRM(cmsPrice(cms, tabIds))}`
          : `From ${formatRM(cms.price)}`
      }
      description={cms.description}
      runningCost={cms.runningCost}
      checked={on}
      onToggle={() => onChange(on ? null : [])}
    >
      <fieldset id={`${idPrefix}-dashboard`} className="max-w-sm">
        <legend className="mb-1 text-xs font-semibold text-gray-700 dark:text-gray-300">
          What do you want to manage?
        </legend>
        <p className="flex items-center gap-2.5 py-1.5 text-sm text-gray-500 dark:text-gray-400">
          <Box checked small muted />
          <span className="flex-1">{cms.dashboard}</span>
          <span className="text-xs font-semibold">Included</span>
        </p>
        {GROUP_ORDER.map((group) => {
          const tabs = cms.tabs.filter(
            (tab) =>
              tab.group === group &&
              (offeredFor(tab, siteType) || tabIds.includes(tab.id))
          );
          if (!tabs.length) return null;
          return (
            <div key={group} className="mt-1.5">
              <p className="pt-1 text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {cms.groups[group]}
              </p>
              {tabs.map((tab) => {
                const checked = tabIds.includes(tab.id);
                return (
                  <label
                    key={tab.id}
                    className="-mx-2 flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-gray-900/[0.04] has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-green-500/40 dark:hover:bg-white/[0.04]"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleTab(tab.id)}
                      className="sr-only"
                    />
                    <Box checked={checked} small />
                    <span className="min-w-0 flex-1 text-gray-800 dark:text-gray-200">
                      {tab.name}
                    </span>
                    <span className="shrink-0 text-xs font-semibold tabular-nums text-green-700 dark:text-green-400">
                      +{formatRM(tab.price)}
                    </span>
                  </label>
                );
              })}
            </div>
          );
        })}
      </fieldset>
    </Row>
  );
}

/** Add-ons as one compact checklist, grouped by site type then every site. */
export default function AddOnChecklist({
  groups,
  selected,
  included = [],
  onToggle,
  idPrefix,
  hidePrices = false,
  leadingRows,
  languages,
  onLanguagesChange,
  cms,
  cmsSelection,
  onCmsChange,
  siteType,
}: {
  groups: AddOnGroup[];
  selected: string[];
  /** Ticked and fixed, such as a feature the chosen build includes. */
  included?: string[];
  onToggle: (id: string) => void;
  idPrefix: string;
  /** For quote-only services, where prices stay internal. */
  hidePrices?: boolean;
  /** Extra rows at the top of the last group, such as a stepper. */
  leadingRows?: ReactNode;
  languages?: string[];
  onLanguagesChange?: (languages: string[]) => void;
  cms?: CmsConfig;
  cmsSelection?: string[] | null;
  onCmsChange?: (selection: string[] | null) => void;
  siteType: SiteType | null;
}) {
  return (
    <div className="space-y-5">
      {groups.map((group, index) => {
        const last = index === groups.length - 1;
        return (
          <div key={group.label}>
            <p
              id={`${idPrefix}-addons-${index}`}
              className={
                groups.length > 1
                  ? 'mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400'
                  : 'sr-only'
              }
            >
              {group.label}
            </p>
            <ul
              aria-labelledby={`${idPrefix}-addons-${index}`}
              className="divide-y divide-gray-200 overflow-hidden rounded-2xl border border-gray-200 bg-white/60 dark:divide-gray-700 dark:border-gray-700 dark:bg-gray-900/30"
            >
              {last && leadingRows}
              {group.addOns.map((addOn) => {
                const locked = included.includes(addOn.id);
                return (
                  <Row
                    key={addOn.id}
                    name={addOn.name}
                    price={
                      locked
                        ? 'Included'
                        : hidePrices
                          ? ''
                          : addOn.priceTo
                            ? `From ${formatRM(addOn.price)}`
                            : `+${formatRM(addOn.price)}`
                    }
                    description={addOn.description}
                    runningCost={addOn.runningCost}
                    checked={locked || selected.includes(addOn.id)}
                    onToggle={() => onToggle(addOn.id)}
                    quoted={Boolean(addOn.priceTo) || hidePrices}
                    locked={locked}
                  />
                );
              })}
              {last && languages && onLanguagesChange && (
                <LanguageRow
                  languages={languages}
                  onChange={onLanguagesChange}
                  idPrefix={idPrefix}
                />
              )}
              {last && cms && cmsSelection !== undefined && onCmsChange && (
                <DashboardRow
                  cms={cms}
                  selection={cmsSelection}
                  onChange={onCmsChange}
                  siteType={siteType}
                  idPrefix={idPrefix}
                />
              )}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
