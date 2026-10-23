'use client';

import { Check, MessageSquare } from 'lucide-react';
import {
  adminFeaturesFor,
  adminPrice,
  type AdminFeature,
  type CustomAdminConfig,
} from '@constants/services';
import { formatRM } from '@lib/format';

function Box({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md border transition-colors ${
        checked
          ? 'border-purple-600 bg-purple-600 text-white'
          : 'border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-900'
      }`}
    >
      {checked && <Check size={11} strokeWidth={3} />}
    </span>
  );
}

function FeatureOption({
  feature,
  checked,
  suggested,
  onToggle,
}: {
  feature: AdminFeature;
  checked: boolean;
  suggested: boolean;
  onToggle: () => void;
}) {
  return (
    <label
      className={`relative flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-purple-500/40 ${
        checked
          ? 'border-purple-500/50 bg-purple-500/[0.06]'
          : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="sr-only"
      />
      <Box checked={checked} />
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-3">
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {feature.name}
          </span>
          <span className="shrink-0 text-xs font-semibold tabular-nums text-purple-700 dark:text-purple-300">
            +{formatRM(feature.price)}
          </span>
        </span>
        <span className="mt-0.5 block text-xs leading-relaxed text-gray-500 dark:text-gray-400">
          {feature.description}
        </span>
        {suggested && (
          <span className="mt-1.5 inline-block rounded-full bg-purple-500/10 px-2 py-0.5 text-[11px] font-semibold text-purple-700 dark:text-purple-300">
            Suggested for your build
          </span>
        )}
      </span>
    </label>
  );
}

/** The Custom package's Admin portal: switched on, then priced by feature. */
export default function AdminPortalPicker({
  admin,
  selection,
  onChange,
  extra,
  onExtraChange,
  buildId,
  buildName,
  idPrefix,
}: {
  admin: CustomAdminConfig;
  selection: string[] | null;
  onChange: (selection: string[] | null) => void;
  extra: string;
  onExtraChange: (extra: string) => void;
  buildId: string | null;
  buildName?: string;
  idPrefix: string;
}) {
  const on = selection !== null;
  const ids = selection ?? [];
  const suggested = buildId ? (admin.suggested[buildId] ?? []) : [];
  const offered = adminFeaturesFor(admin, buildId);
  const buildFeatures = offered.filter((feature) => feature.core);
  const forAny = offered.filter((feature) => !feature.core);
  const toggle = (id: string) =>
    onChange(
      ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]
    );

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white/60 dark:border-gray-700 dark:bg-gray-900/30">
      <label
        className={`relative flex cursor-pointer items-start gap-3 px-4 py-4 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-inset has-[:focus-visible]:ring-purple-500/40 sm:px-5 ${
          on ? 'bg-purple-500/[0.06]' : ''
        }`}
      >
        <input
          type="checkbox"
          checked={on}
          onChange={() => onChange(on ? null : [])}
          className="sr-only"
        />
        <Box checked={on} />
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline justify-between gap-3">
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {admin.name}
            </span>
            <span className="shrink-0 text-xs font-semibold tabular-nums text-purple-700 dark:text-purple-300">
              {on
                ? `+${formatRM(adminPrice(admin, ids))}`
                : `From ${formatRM(admin.price)}`}
            </span>
          </span>
          <span className="mt-0.5 block text-xs leading-relaxed text-gray-500 dark:text-gray-400">
            {admin.description}
          </span>
        </span>
      </label>

      {on && (
        <div
          id={`${idPrefix}-admin`}
          className="space-y-5 border-t border-gray-200 px-4 pb-5 pt-4 dark:border-gray-700 sm:px-5"
        >
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600 dark:text-gray-400">
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              Base, {formatRM(admin.price)}:
            </span>
            {admin.base.map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <Check
                  size={13}
                  aria-hidden="true"
                  className="text-purple-500"
                />
                {item}
              </span>
            ))}
          </p>

          {buildFeatures.length > 0 ? (
            <fieldset>
              <legend className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {buildName
                  ? `Core for your ${buildName.toLowerCase()}`
                  : 'Core for your build'}
              </legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {buildFeatures.map((feature) => (
                  <FeatureOption
                    key={feature.id}
                    feature={feature}
                    checked={ids.includes(feature.id)}
                    suggested={suggested.includes(feature.id)}
                    onToggle={() => toggle(feature.id)}
                  />
                ))}
              </div>
            </fieldset>
          ) : (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Choose what you are building above to see the features made for
              it, such as products and orders for an online store.
            </p>
          )}

          <fieldset>
            <legend className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {buildName ? 'More options' : 'For any build'}
            </legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {forAny.map((feature) => (
                <FeatureOption
                  key={feature.id}
                  feature={feature}
                  checked={ids.includes(feature.id)}
                  suggested={suggested.includes(feature.id)}
                  onToggle={() => toggle(feature.id)}
                />
              ))}
            </div>
          </fieldset>

          <div>
            <label
              htmlFor={`${idPrefix}-admin-extra`}
              className="text-sm font-semibold text-gray-900 dark:text-gray-100"
            >
              Other features you need
            </label>
            <textarea
              id={`${idPrefix}-admin-extra`}
              value={extra}
              onChange={(event) => onExtraChange(event.target.value)}
              rows={2}
              placeholder="For example: supplier list, loyalty points, Shopee or Lazada stock sync"
              className="mt-2 w-full rounded-xl border border-gray-200 bg-white/60 px-4 py-3 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-purple-500/60 focus:ring-4 focus:ring-purple-500/15 dark:border-gray-700 dark:bg-gray-900/30 dark:text-gray-100 dark:placeholder:text-gray-500"
            />
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <MessageSquare size={12} aria-hidden="true" />
              Not in the list? Describe it here and we agree the price on
              WhatsApp.
            </p>
          </div>

          <p className="flex items-baseline justify-between border-t border-gray-200 pt-4 text-sm dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">
              {admin.name} total
              {extra.trim() ? ', plus the features you described' : ''}
            </span>
            <span className="text-base font-bold tabular-nums text-purple-700 dark:text-purple-300">
              {formatRM(adminPrice(admin, ids))}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
