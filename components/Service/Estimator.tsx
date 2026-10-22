'use client';

import { useEffect, useState } from 'react';
import { Check, ShieldCheck, Wallet } from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import {
  type AddOn,
  CARE_TIERS,
  careName,
  cmsLabel,
  careFirstPayment,
  carePrice,
  type CareBilling,
  cmsPrice,
  MULTI_LANGUAGE,
  type EstimatorConfig,
  type PackageOption,
  offeredFor,
  type PromoTarget,
  SITE_TYPES,
  type SiteType,
  toggleAddOn,
} from '@constants/services';
import { formatRM, formatRMRange } from '@lib/format';
import { discountedPrice, promoAppliesTo } from '@lib/promo';
import { usePromo } from '@components/Promo/PromoProvider';
import PromoField from '@components/Promo/PromoField';
import { PromoPerks, PromoPrice } from '@components/Promo/PromoParts';
import HostingCare from './HostingCare';
import OrderSummary, { type SummaryLine } from './OrderSummary';
import AddOnChecklist from './AddOnChecklist';
import SiteTypePicker from './SiteTypePicker';
import { useServicePick } from './servicePick';
import { openFaq } from './FaqTabs';

const CARD =
  'rounded-3xl border border-gray-200 bg-white/70 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/70';

const OPTION =
  'relative flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-all duration-200 has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-green-500/20';
const OPTION_IDLE =
  'border-gray-200 bg-white/60 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900/30 dark:hover:border-gray-600';
const OPTION_SELECTED =
  'border-green-500/70 bg-green-500/[0.06] dark:border-green-400/60 dark:bg-green-400/[0.06]';
const OPTION_SELECTED_CUSTOM =
  'border-purple-500/70 bg-purple-500/[0.06] dark:border-purple-400/60 dark:bg-purple-400/[0.06]';

const BUTTON =
  'inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4';
const SEND_BUTTON = `${BUTTON} bg-green-600 shadow-green-600/20 hover:bg-green-700 focus-visible:ring-green-500/30`;
const CUSTOM_BUTTON = `${BUTTON} bg-purple-600 shadow-purple-600/20 hover:bg-purple-700 focus-visible:ring-purple-500/30`;

function Indicator({
  selected,
  shape,
  custom = false,
}: {
  selected: boolean;
  shape: 'radio' | 'checkbox';
  custom?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border transition-colors ${
        shape === 'radio' ? 'rounded-full' : 'rounded-md'
      } ${
        selected
          ? custom
            ? 'border-purple-600 bg-purple-600 text-white'
            : 'border-green-600 bg-green-600 text-white'
          : 'border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-900'
      }`}
    >
      {selected && <Check size={12} strokeWidth={3} />}
    </span>
  );
}

function GroupTitle({ title, hint }: { title: string; hint?: string }) {
  return (
    <p className="mb-3 flex items-baseline gap-2">
      <span className="font-bold text-gray-900 dark:text-gray-100">
        {title}
      </span>
      {hint && (
        <span className="text-xs text-gray-500 dark:text-gray-400">{hint}</span>
      )}
    </p>
  );
}

function PackageCard({
  pkg,
  single = false,
  name,
  selected,
  onSelect,
  promoTarget,
  startingAt,
  quoteOnly = false,
  basedOn,
}: {
  pkg: PackageOption;
  single?: boolean;
  name: string;
  selected: boolean;
  onSelect: () => void;
  promoTarget: string;
  startingAt: number | null;
  quoteOnly?: boolean;
  basedOn?: string;
}) {
  const priceLabel =
    pkg.price !== undefined
      ? 'One-time price'
      : quoteOnly || startingAt === null
        ? 'Price'
        : 'Starting at';
  const tone = pkg.custom
    ? 'border-purple-500 ring-1 ring-purple-500 dark:border-purple-400 dark:ring-purple-400'
    : 'border-green-500 ring-1 ring-green-500 dark:border-green-400 dark:ring-green-400';

  const Wrapper = single ? 'div' : 'label';

  return (
    <Wrapper
      className={`flex h-full flex-col rounded-3xl border bg-white/70 p-6 shadow-xl backdrop-blur-sm transition-all duration-200 dark:bg-gray-800/70 sm:p-7 ${
        single
          ? 'border-gray-200 dark:border-gray-700'
          : `cursor-pointer has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-green-500/20 ${
              selected
                ? tone
                : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
            }`
      }`}
    >
      {!single && (
        <input
          type="radio"
          name={name}
          value={pkg.id}
          checked={selected}
          onChange={onSelect}
          className="sr-only"
        />
      )}
      <span className="flex items-start justify-between gap-3">
        <span>
          <span className="block text-xl font-extrabold text-gray-900 dark:text-gray-100">
            {pkg.name}
          </span>
          <span className="mt-1 block text-sm text-gray-500 dark:text-gray-400">
            {pkg.summary}
          </span>
        </span>
        {!single && (
          <Indicator selected={selected} shape="radio" custom={pkg.custom} />
        )}
      </span>

      <span className="mt-5 block">
        <span className="block text-xs font-medium text-gray-500 dark:text-gray-400">
          {priceLabel}
        </span>
        {pkg.price === undefined ? (
          <span className="mt-1 block text-3xl font-black tracking-tight text-purple-700 dark:text-purple-300">
            {quoteOnly || startingAt === null
              ? 'By quotation'
              : formatRM(startingAt)}
          </span>
        ) : (
          <span className="mt-1 flex flex-wrap items-baseline gap-x-2 text-4xl font-black tracking-tight text-gray-900 dark:text-white">
            <PromoPrice target={promoTarget} price={pkg.price} />
          </span>
        )}
      </span>

      <span className="mt-5 block flex-1 border-t border-gray-200 pt-5 dark:border-gray-700">
        {basedOn && (
          <span className="mb-3 block text-xs font-semibold text-gray-500 dark:text-gray-400">
            Everything in {basedOn}, plus
          </span>
        )}
        <span className="block space-y-2.5">
          {pkg.includes.map((item) => (
            <span
              key={item}
              className="flex items-start gap-2.5 text-sm leading-relaxed text-gray-700 dark:text-gray-300"
            >
              <Check
                size={16}
                aria-hidden="true"
                className={`mt-0.5 shrink-0 ${pkg.custom ? 'text-purple-500' : 'text-green-500'}`}
              />
              {item}
            </span>
          ))}
        </span>
      </span>

      {pkg.bestFor && (
        <span className="mt-5 block border-t border-gray-200 pt-4 text-xs leading-relaxed text-gray-600 dark:border-gray-700 dark:text-gray-400">
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            Choose this if{' '}
          </span>
          {pkg.bestFor}
        </span>
      )}

      <span className="mt-5 flex items-start gap-2 text-xs font-medium text-gray-700 dark:text-gray-300">
        <ShieldCheck
          size={15}
          aria-hidden="true"
          className={`shrink-0 ${pkg.custom ? 'text-purple-500' : 'text-green-600 dark:text-green-400'}`}
        />
        Lifetime bug fixes
      </span>
    </Wrapper>
  );
}

export default function Estimator({
  config,
  whatsappHref,
  promoTargets,
}: {
  config: EstimatorConfig;
  whatsappHref: string;
  promoTargets: PromoTarget[];
}) {
  const { promo } = usePromo();
  const [packageId, setPackageId] = useState(config.packages[0].id);
  const [siteType, setSiteType] = useState<SiteType | null>(null);
  const [addOnIds, setAddOnIds] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [cmsTabIds, setCmsTabIds] = useState<string[] | null>(null);
  const [billing, setBilling] = useState<CareBilling>('monthly');
  const [quoteIds, setQuoteIds] = useState<string[]>([]);
  const [buildId, setBuildId] = useState<string | null>(null);
  const [other, setOther] = useState('');

  useEffect(
    () =>
      useServicePick.subscribe(({ pick }) => {
        if (pick?.tab !== config.id) return;
        if (pick.packageId) setPackageId(pick.packageId);
        setSiteType(pick.siteType ?? null);
        setAddOnIds(pick.addOnIds ?? []);
        setCmsTabIds(pick.cmsTabIds ?? null);
        setBuildId(pick.buildId ?? null);
      }),
    [config.id]
  );

  const pkg =
    config.packages.find((item) => item.id === packageId) ?? config.packages[0];
  const isCustom = Boolean(pkg.custom);
  const quoteOnly = Boolean(config.quoteOnly);
  const rangeOrBlank = (from: number, to: number) =>
    quoteOnly ? '' : formatRMRange(from, to);

  const addOns = config.addOns.filter((addOn) => addOnIds.includes(addOn.id));
  const fixedAddOns = addOns.filter((addOn) => !addOn.priceTo);
  const quotedAddOns = isCustom ? [] : addOns.filter((addOn) => addOn.priceTo);
  const quoted = quotedAddOns.length > 0;
  const quotedFrom = quotedAddOns.reduce((sum, addOn) => sum + addOn.price, 0);
  const quotedTo = quotedAddOns.reduce(
    (sum, addOn) => sum + (addOn.priceTo ?? addOn.price),
    0
  );
  const siteTypeLabel = SITE_TYPES.find((type) => type.id === siteType)?.label;
  const hasSiteTypes = config.addOns.some((addOn) => addOn.siteTypes);
  const typeAddOns = config.addOns.filter(
    (addOn) =>
      addOn.siteTypes &&
      (offeredFor(addOn, siteType) || addOnIds.includes(addOn.id))
  );
  const everySiteAddOns = config.addOns.filter((addOn) => !addOn.siteTypes);
  const { cms } = config;
  const cmsTotal = cms ? cmsPrice(cms, cmsTabIds) : 0;
  const languageTotal = languages.length * MULTI_LANGUAGE.pricePerLanguage;

  const customRange = config.customPackages.length
    ? {
        from: Math.min(...config.customPackages.map((build) => build.from)),
        to: Math.max(...config.customPackages.map((build) => build.to)),
      }
    : null;
  const customBuild =
    config.customPackages.find((build) => build.id === buildId) ?? null;
  const customAddOns = [
    ...config.customAddOns,
    ...config.addOns.filter((addOn) => !addOn.siteTypes),
  ];
  const includedInBuild = (addOn: AddOn) =>
    Boolean(customBuild && addOn.includedInBuilds?.includes(customBuild.id));
  const chosenCustom = customAddOns.filter((addOn) =>
    quoteIds.includes(addOn.id)
  );
  const pricedCustom = chosenCustom.filter((addOn) => !includedInBuild(addOn));
  const customDetails = other.trim();
  const hasCustomDetails =
    Boolean(customBuild) ||
    chosenCustom.length > 0 ||
    languages.length > 0 ||
    Boolean(customDetails);

  // A custom request without a listed build starts from the cheapest build.
  const fixedPrices = config.packages.flatMap((item) => item.price ?? []);
  const customFloor =
    customRange?.from ?? (fixedPrices.length ? Math.max(...fixedPrices) : 0);
  const rangeFrom =
    (customBuild?.from ?? customFloor) +
    pricedCustom.reduce((total, addOn) => total + addOn.price, 0) +
    languageTotal;
  const rangeTo =
    (customBuild?.to ?? customFloor) +
    pricedCustom.reduce(
      (total, addOn) => total + (addOn.priceTo ?? addOn.price),
      0
    ) +
    languageTotal;
  const rangeText = (extra: number) =>
    customBuild
      ? formatRMRange(rangeFrom + extra, rangeTo + extra)
      : hasCustomDetails || !customRange
        ? `From ${formatRM(rangeFrom + extra)}`
        : formatRMRange(customRange.from + extra, customRange.to + extra);
  const customPrice = (addOn: AddOn) =>
    addOn.priceTo
      ? formatRMRange(addOn.price, addOn.priceTo)
      : formatRM(addOn.price);
  const rangeLabel = rangeText(0);

  const estimate =
    (pkg.price ?? 0) +
    fixedAddOns.reduce((total, addOn) => total + addOn.price, 0) +
    cmsTotal +
    languageTotal;
  const eligiblePromo =
    promo && !quoted && promoAppliesTo(promo, [config.promoTarget])
      ? promo
      : null;
  const afterPromo = eligiblePromo
    ? discountedPrice(estimate, eligiblePromo)
    : estimate;

  const extras = [
    ...fixedAddOns.map((addOn) => `${addOn.name} (+${formatRM(addOn.price)})`),
    ...quotedAddOns.map(
      (addOn) =>
        `${addOn.name} (${formatRMRange(addOn.price, addOn.priceTo ?? addOn.price)}, to be quoted)`
    ),
    ...(languageTotal
      ? [
          `${MULTI_LANGUAGE.name}: ${languages.join(', ')} (+${formatRM(languageTotal)})`,
        ]
      : []),
    ...(cms && cmsTotal
      ? [`${cmsLabel(cms, cmsTabIds ?? [])} (+${formatRM(cmsTotal)})`]
      : []),
  ];

  const toWhatsApp = (lines: string[]) => {
    const url = new URL(whatsappHref);
    url.searchParams.set('text', lines.join('\n'));
    return url.toString();
  };

  const withDatabase = isCustom || cmsTabIds !== null || quoted;
  const careFrom = quoteOnly
    ? 'by quotation'
    : `from ${formatRM(config.carePlan.monthlyPrice)}/month`;
  const careTier = pkg.careTier ? CARE_TIERS[pkg.careTier] : undefined;
  const careLabel = careName(config.carePlan, careTier);
  const firstCare = config.carePlan.quoted
    ? null
    : careFirstPayment(config.carePlan, withDatabase, billing, careTier);
  const careText = firstCare
    ? carePrice(config.carePlan, withDatabase, billing, careTier)
    : careFrom;
  const careAmount = firstCare?.amount ?? 0;
  const careLine = [
    firstCare
      ? `${careLabel}: ${careText}, first ${firstCare.period} included in the total${careTier?.from ? ', confirmed in the quote' : ''}`
      : quoteOnly
        ? `${config.carePlan.name}: by quotation`
        : `${config.carePlan.name}: ${careFrom}, confirmed in the quote`,
  ];
  const grandTotal = quoteOnly
    ? 'By quotation'
    : isCustom
      ? rangeText(careAmount)
      : quoted
        ? formatRMRange(
            afterPromo + quotedFrom + careAmount,
            afterPromo + quotedTo + careAmount
          )
        : formatRM(afterPromo + careAmount);

  const buildLines: SummaryLine[] = isCustom
    ? [
        ...(customBuild
          ? [
              {
                label: customBuild.name,
                value: rangeOrBlank(customBuild.from, customBuild.to),
              },
            ]
          : hasCustomDetails
            ? [
                {
                  label: `Custom ${config.label.toLowerCase()}`,
                  value: quoteOnly ? '' : `From ${formatRM(customFloor)}`,
                },
              ]
            : []),
        ...chosenCustom.map((addOn) => ({
          label: addOn.name,
          value: includedInBuild(addOn)
            ? 'Included'
            : quoteOnly
              ? ''
              : customPrice(addOn),
        })),
        ...(languageTotal
          ? [
              {
                label: `${MULTI_LANGUAGE.name}: ${languages.join(', ')}`,
                value: formatRM(languageTotal),
              },
            ]
          : []),
      ]
    : [
        { label: `${pkg.name} package`, value: formatRM(pkg.price ?? 0) },
        ...fixedAddOns.map((addOn) => ({
          label: addOn.name,
          value: formatRM(addOn.price),
        })),
        ...quotedAddOns.map((addOn) => ({
          label: `${addOn.name} (quoted)`,
          value: formatRMRange(addOn.price, addOn.priceTo ?? addOn.price),
        })),
        ...(languageTotal
          ? [
              {
                label: `${MULTI_LANGUAGE.name}: ${languages.join(', ')}`,
                value: formatRM(languageTotal),
              },
            ]
          : []),
        ...(cms && cmsTotal
          ? [
              {
                label: cmsLabel(cms, cmsTabIds ?? []),
                value: formatRM(cmsTotal),
              },
            ]
          : []),
      ];
  const summaryLines = [
    ...buildLines,
    firstCare
      ? {
          label: careLabel,
          value: careText.charAt(0).toUpperCase() + careText.slice(1),
        }
      : {
          label: config.carePlan.name,
          value: quoteOnly
            ? 'By quotation'
            : `From ${formatRM(config.carePlan.monthlyPrice)}/month`,
        },
  ];
  const discount =
    !isCustom && eligiblePromo && afterPromo < estimate
      ? { label: `Promo ${eligiblePromo.code}`, amount: estimate - afterPromo }
      : null;

  const quoteHref = toWhatsApp([
    quoted
      ? `Hi Haziq, I'd like a quote for this ${config.label.toLowerCase()}.`
      : config.messageIntro,
    `Package: ${pkg.name} (${formatRM(pkg.price ?? 0)})`,
    ...(siteTypeLabel ? [`Site type: ${siteTypeLabel}`] : []),
    `Add-ons: ${extras.length ? extras.join(', ') : 'none'}`,
    `Build price: ${formatRM(afterPromo)}${eligiblePromo ? ` with promo ${eligiblePromo.code}` : ''}${quoted ? ', plus the quoted items' : ''}`,
    ...careLine,
    `${quoted ? 'Estimated total' : 'Total'}: ${grandTotal}`,
    'Includes lifetime bug fixes',
    quoted
      ? 'Please confirm the final quote and what you need from me.'
      : 'Please let me know what you need from me to get started.',
  ]);

  const customQuoteHref = toWhatsApp([
    `Hi Haziq, I'd like a custom quote for a ${config.label.toLowerCase()} project.`,
    ...(customBuild
      ? [
          quoteOnly
            ? `Build: ${customBuild.name}`
            : `Build: ${customBuild.name} (${formatRMRange(customBuild.from, customBuild.to)})`,
        ]
      : []),
    ...(chosenCustom.length
      ? [
          `Add-ons: ${chosenCustom
            .map((addOn) =>
              includedInBuild(addOn)
                ? `${addOn.name} (included)`
                : quoteOnly
                  ? addOn.name
                  : `${addOn.name} (+${customPrice(addOn)})`
            )
            .join(', ')}`,
        ]
      : []),
    ...(languageTotal
      ? [
          `${MULTI_LANGUAGE.name}: ${languages.join(', ')} (+${formatRM(languageTotal)})`,
        ]
      : []),
    ...(customDetails ? [`Details: ${customDetails}`] : []),
    ...(quoteOnly ? [] : [`Estimated range: ${rangeLabel}`]),
    ...careLine,
    'Please let me know the final price and timeline.',
  ]);

  const changeSiteType = (next: SiteType) => {
    setSiteType(next);
    setAddOnIds((ids) =>
      ids.filter((id) => {
        const addOn = config.addOns.find((item) => item.id === id);
        return addOn ? offeredFor(addOn, next) : false;
      })
    );
    setCmsTabIds(
      (ids) =>
        ids?.filter((id) => {
          const tab = cms?.tabs.find((item) => item.id === id);
          return tab ? offeredFor(tab, next) : false;
        }) ?? null
    );
  };

  return (
    <div className="space-y-6">
      <fieldset>
        <legend className="sr-only">Package</legend>
        <div
          className={`grid gap-4 ${config.packages.length > 1 ? 'lg:grid-cols-3' : ''}`}
        >
          {config.packages.map((item) => (
            <PackageCard
              key={item.id}
              single={config.packages.length === 1}
              pkg={item}
              name={`${config.id}-package`}
              selected={item.id === pkg.id}
              onSelect={() => setPackageId(item.id)}
              promoTarget={config.promoTarget}
              startingAt={customRange?.from ?? null}
              quoteOnly={quoteOnly}
              basedOn={
                config.packages.find((base) => base.id === item.includesFrom)
                  ?.name
              }
            />
          ))}
        </div>
      </fieldset>

      <div className={`${CARD} space-y-8 p-6 shadow-xl sm:p-8`}>
        {!isCustom && (
          <>
            {hasSiteTypes && (
              <SiteTypePicker
                value={siteType}
                onChange={changeSiteType}
                idPrefix={config.id}
              />
            )}

            <div>
              <GroupTitle title="Add-ons" hint="Optional" />
              <AddOnChecklist
                idPrefix={config.id}
                groups={[
                  ...(typeAddOns.length
                    ? [
                        {
                          label: siteTypeLabel ?? 'Your site',
                          addOns: typeAddOns,
                        },
                      ]
                    : []),
                  { label: 'Other add-ons', addOns: everySiteAddOns },
                ]}
                selected={addOnIds}
                onToggle={(id) => setAddOnIds(toggleAddOn(addOnIds, id))}
                languages={config.multiLanguage ? languages : undefined}
                onLanguagesChange={setLanguages}
                cms={config.cms}
                cmsSelection={cmsTabIds}
                onCmsChange={setCmsTabIds}
                siteType={siteType}
              />
            </div>
          </>
        )}

        {isCustom && (
          <>
            {config.customPackages.length > 0 && (
              <fieldset>
                <legend className="sr-only">Build</legend>
                <GroupTitle title="What are you building?" hint="Optional" />
                <div
                  className={`grid gap-3 ${
                    config.customPackages.length === 4
                      ? 'md:grid-cols-2 xl:grid-cols-4'
                      : 'md:grid-cols-3'
                  }`}
                >
                  {config.customPackages.map((build) => {
                    const selected = buildId === build.id;
                    return (
                      <button
                        key={build.id}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => setBuildId(selected ? null : build.id)}
                        className={`flex h-full flex-col rounded-2xl border p-4 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple-500/20 ${
                          selected ? OPTION_SELECTED_CUSTOM : OPTION_IDLE
                        }`}
                      >
                        <span className="flex items-start justify-between gap-3">
                          <span className="font-semibold text-gray-900 dark:text-gray-100">
                            {build.name}
                          </span>
                          <Indicator selected={selected} shape="radio" custom />
                        </span>
                        {!quoteOnly && (
                          <span className="mt-1 text-sm font-bold text-purple-700 dark:text-purple-300">
                            {formatRMRange(build.from, build.to)}
                          </span>
                        )}
                        <span className="mt-3 block space-y-1.5">
                          {build.includes.map((item) => (
                            <span
                              key={item}
                              className="flex items-start gap-2 text-xs leading-relaxed text-gray-600 dark:text-gray-400"
                            >
                              <Check
                                size={13}
                                aria-hidden="true"
                                className="mt-0.5 shrink-0 text-purple-500"
                              />
                              {item}
                            </span>
                          ))}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            )}

            <div>
              <GroupTitle title="Add-ons" hint="Optional" />
              <AddOnChecklist
                idPrefix={`${config.id}-custom`}
                groups={[
                  {
                    label: everySiteAddOns.length
                      ? 'For your build'
                      : 'Features',
                    addOns: config.customAddOns,
                  },
                  ...(everySiteAddOns.length
                    ? [{ label: 'Other add-ons', addOns: everySiteAddOns }]
                    : []),
                ]}
                selected={quoteIds}
                included={customAddOns
                  .filter(includedInBuild)
                  .map((addOn) => addOn.id)}
                onToggle={(id) => setQuoteIds(toggleAddOn(quoteIds, id))}
                hidePrices={quoteOnly}
                languages={config.multiLanguage ? languages : undefined}
                onLanguagesChange={setLanguages}
                siteType={null}
              />
            </div>

            <div>
              <label
                htmlFor={`${config.id}-other`}
                className="mb-3 block font-bold text-gray-900 dark:text-gray-100"
              >
                Anything else?
              </label>
              <textarea
                id={`${config.id}-other`}
                value={other}
                onChange={(event) => setOther(event.target.value)}
                rows={3}
                placeholder="Describe your business and what it should do"
                className="w-full rounded-2xl border border-gray-200 bg-white/60 px-4 py-3 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-purple-500/60 focus:ring-4 focus:ring-purple-500/15 dark:border-gray-700 dark:bg-gray-900/30 dark:text-gray-100 dark:placeholder:text-gray-500"
              />
            </div>
          </>
        )}

        <div>
          <GroupTitle title="After launch" hint="Required" />
          <HostingCare
            plan={config.carePlan}
            tier={careTier}
            withDatabase={withDatabase}
            billing={billing}
            onBillingChange={setBilling}
            name={`${config.id}-billing`}
            onShowDetails={() => openFaq('care-plan')}
            className="rounded-2xl border border-gray-200 bg-white/60 p-4 dark:border-gray-700 dark:bg-gray-900/30"
          />
        </div>

        <OrderSummary
          id={`${config.id}-order-summary`}
          lines={summaryLines}
          discount={discount}
          totalLabel={
            quoteOnly
              ? 'Price'
              : isCustom
                ? 'Estimated range'
                : quoted
                  ? 'Estimated total'
                  : 'Total'
          }
          total={grandTotal}
          note={
            firstCare
              ? `Includes ${formatRM(firstCare.amount)} for the first ${firstCare.period}, then ${careText}`
              : `The ${config.carePlan.name} is confirmed in your quote`
          }
          quoted={isCustom || quoted}
          plain
          className="border-t border-gray-200 pt-8 dark:border-gray-700"
          action={
            isCustom ? (
              hasCustomDetails ? (
                <a
                  href={customQuoteHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${CUSTOM_BUTTON} w-full sm:w-auto sm:min-w-64`}
                >
                  Request a quote
                  <SiWhatsapp size={16} aria-hidden="true" />
                </a>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Pick or describe what you need
                </p>
              )
            ) : (
              <a
                href={quoteHref}
                target="_blank"
                rel="noopener noreferrer"
                className={`${quoted ? CUSTOM_BUTTON : SEND_BUTTON} w-full sm:w-auto sm:min-w-64`}
              >
                {quoted ? 'Request a quote' : 'Order on WhatsApp'}
                <SiWhatsapp size={16} aria-hidden="true" />
              </a>
            )
          }
        >
          {!isCustom && (
            <>
              {eligiblePromo?.perks.length ? (
                <ul className="space-y-2">
                  <PromoPerks target={config.promoTarget} quoted={false} />
                </ul>
              ) : null}
              <PromoField
                targets={promoTargets.filter(
                  (target) => target.id === config.promoTarget
                )}
                inputId={`${config.id}-promo-code`}
              />
            </>
          )}
        </OrderSummary>
      </div>
    </div>
  );
}
