'use client';

import { useState } from 'react';
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  LayoutTemplate,
  Minus,
  Plus,
} from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import type { WebsiteTemplate } from '@lib/supabase';
import {
  careFirstPayment,
  carePrice,
  type CareBilling,
  cmsLabel,
  cmsPrice,
  MULTI_LANGUAGE,
  TEMPLATE_CATEGORIES,
  TEMPLATE_FEATURES,
  TEMPLATE_INCLUDES,
  TEMPLATE_PAYMENTS,
  TEMPLATE_PROMO_TARGET,
  TEMPLATE_SECTION,
  WEBSITE_CMS,
  WEBSITE_ESTIMATOR,
} from '@constants/services';
import { formatRM, formatRMRange, pluralize } from '@lib/format';
import UniversalImage from '@components/Media/UniversalImage';
import PromoField from '@components/Promo/PromoField';
import { PromoPerks } from '@components/Promo/PromoParts';
import { usePromo } from '@components/Promo/PromoProvider';
import { discountedPrice, promoAppliesTo } from '@lib/promo';
import CmsPicker from './CmsPicker';
import BillingSwitch from './BillingSwitch';
import LanguagePicker from './LanguagePicker';
import OrderSummary from './OrderSummary';
import OrderDialog from './OrderDialog';
import ExtraOption from './ExtraOption';

const STEPPER_BUTTON =
  'flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-gray-700 transition-colors hover:border-green-500/60 hover:text-green-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-500/20 disabled:pointer-events-none disabled:opacity-40 dark:border-gray-600 dark:text-gray-200 dark:hover:text-green-400';

export default function TemplateOrder({
  template,
  whatsappHref,
  onClose,
}: {
  template: WebsiteTemplate;
  whatsappHref: string;
  onClose: () => void;
}) {
  const [showExtras, setShowExtras] = useState(false);
  const [sections, setSections] = useState(0);
  const [featureIds, setFeatureIds] = useState<string[]>([]);
  const [cmsTabIds, setCmsTabIds] = useState<string[] | null>(null);
  const [languages, setLanguages] = useState<string[]>([]);
  const [payments, setPayments] = useState(false);
  const carePlan = WEBSITE_ESTIMATOR.carePlan;
  const [billing, setBilling] = useState<CareBilling>('monthly');

  const categoryLabel =
    TEMPLATE_CATEGORIES.find((c) => c.id === template.category)?.label ??
    'Template';
  const saving =
    template.compare_price != null && template.compare_price > template.price
      ? template.compare_price - template.price
      : 0;

  const isIncluded = (feature: (typeof TEMPLATE_FEATURES)[number]) =>
    Boolean(feature.includedIn?.includes(template.category));
  const includedFeatures = TEMPLATE_FEATURES.filter(isIncluded);
  const optionalFeatures = TEMPLATE_FEATURES.filter(
    (feature) => !isIncluded(feature)
  );
  const chosen = optionalFeatures.filter((feature) =>
    featureIds.includes(feature.id)
  );
  const canPayOnline = TEMPLATE_FEATURES.some(
    (feature) =>
      feature.id === TEMPLATE_PAYMENTS.requires &&
      (isIncluded(feature) || featureIds.includes(feature.id))
  );
  const quoted = payments && canPayOnline;
  const cmsTotal = cmsPrice(WEBSITE_CMS, cmsTabIds);

  const lines = [
    { label: `${template.name} template`, price: template.price },
    ...(sections > 0
      ? [
          {
            label: pluralize(sections, 'extra section'),
            price: sections * TEMPLATE_SECTION.price,
          },
        ]
      : []),
    ...chosen.map((feature) => ({ label: feature.name, price: feature.price })),
    ...(languages.length
      ? [
          {
            label: `${MULTI_LANGUAGE.name}: ${languages.join(', ')}`,
            price: languages.length * MULTI_LANGUAGE.pricePerLanguage,
          },
        ]
      : []),
    ...(cmsTotal
      ? [{ label: cmsLabel(WEBSITE_CMS, cmsTabIds ?? []), price: cmsTotal }]
      : []),
  ];
  const total = lines.reduce((sum, line) => sum + line.price, 0);
  const paymentsRange = formatRMRange(
    TEMPLATE_PAYMENTS.from,
    TEMPLATE_PAYMENTS.to
  );
  const extrasCount = lines.length - 1 + (quoted ? 1 : 0);
  const { promo } = usePromo();
  const eligiblePromo =
    promo && !quoted && promoAppliesTo(promo, [TEMPLATE_PROMO_TARGET.id])
      ? promo
      : null;
  const afterPromo = eligiblePromo
    ? discountedPrice(total, eligiblePromo)
    : total;
  const careWithDatabase = cmsTabIds !== null || quoted;
  const careText = carePrice(carePlan, careWithDatabase, billing);
  const firstCare = careFirstPayment(carePlan, careWithDatabase, billing);
  const grandTotal = quoted
    ? formatRMRange(
        total + TEMPLATE_PAYMENTS.from + firstCare.amount,
        total + TEMPLATE_PAYMENTS.to + firstCare.amount
      )
    : formatRM(afterPromo + firstCare.amount);

  const href = (() => {
    const url = new URL(whatsappHref);
    url.searchParams.set(
      'text',
      [
        quoted
          ? `Hi Haziq, I'd like a quote for the ${template.name} template with online payments.`
          : `Hi Haziq, I'd like the ${template.name} template.`,
        ...lines.map((line) => `• ${line.label}: ${formatRM(line.price)}`),
        ...(quoted
          ? [`• ${TEMPLATE_PAYMENTS.name}: ${paymentsRange} (to be quoted)`]
          : []),
        `• ${firstCare.label}: ${formatRM(firstCare.amount)}`,
        ...(eligiblePromo && afterPromo < total
          ? [`• Promo ${eligiblePromo.code}: −${formatRM(total - afterPromo)}`]
          : []),
        `${quoted ? 'Estimated total' : 'Total'}: ${grandTotal}`,
        `Then ${careText} for the ${carePlan.name}`,
        quoted
          ? 'Please confirm the final quote and what you need from me.'
          : 'Please let me know what you need from me to get started.',
      ].join('\n')
    );
    return url.toString();
  })();

  const toggle = (id: string) =>
    setFeatureIds((ids) =>
      ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]
    );

  const orderButton = (className = '') => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold text-white shadow-lg transition-colors focus-visible:outline-none focus-visible:ring-4 ${
        quoted
          ? 'bg-purple-600 shadow-purple-600/20 hover:bg-purple-700 focus-visible:ring-purple-500/30'
          : 'bg-green-600 shadow-green-600/20 hover:bg-green-700 focus-visible:ring-green-500/30'
      } ${className}`}
    >
      <SiWhatsapp size={16} aria-hidden="true" />
      {quoted ? 'Request a quote' : 'Order on WhatsApp'}
    </a>
  );

  return (
    <OrderDialog
      titleId="template-order-title"
      title={template.name}
      onClose={onClose}
      details={
        <>
          <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-gray-100 ring-1 ring-gray-900/5 dark:bg-gray-900 dark:ring-white/10">
            {template.preview_image_url ? (
              <UniversalImage
                src={template.preview_image_url}
                alt={`${template.name} template preview`}
                width={0}
                height={0}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <span className="absolute inset-0 flex items-center justify-center text-gray-400">
                <LayoutTemplate size={28} aria-hidden="true" />
              </span>
            )}
          </div>

          <div className="mt-4 flex items-baseline justify-between gap-4">
            <p className="min-w-0 text-sm text-gray-500 dark:text-gray-400">
              {categoryLabel}
              {template.pages && ` · ${template.pages}`}
            </p>
            {template.demo_url && (
              <a
                href={template.demo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-gray-600 underline-offset-4 hover:text-gray-900 hover:underline dark:text-gray-400 dark:hover:text-white"
              >
                Live demo
                <ArrowUpRight size={14} aria-hidden="true" />
              </a>
            )}
          </div>

          <h4 className="mt-6 text-sm font-semibold">What&apos;s included</h4>
          <ul className="mt-3 space-y-2">
            {[
              ...includedFeatures.map((feature) => feature.name),
              ...TEMPLATE_INCLUDES,
            ].map((item) => (
              <li
                key={item}
                className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300"
              >
                <Check
                  size={16}
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-green-600 dark:text-green-400"
                />
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              aria-expanded={showExtras}
              aria-controls="template-extras"
              onClick={() => setShowExtras((value) => !value)}
              className="flex w-full items-center justify-between gap-3 py-4 text-left text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/40"
            >
              <span>
                Add extras{' '}
                <span className="font-normal text-gray-500 dark:text-gray-400">
                  (optional)
                </span>
                {extrasCount > 0 && (
                  <span className="font-medium text-green-700 dark:text-green-400">
                    {' '}
                    · {extrasCount} added
                  </span>
                )}
              </span>
              <ChevronDown
                size={18}
                aria-hidden="true"
                className={`shrink-0 text-gray-500 transition-transform duration-200 ${
                  showExtras ? 'rotate-180' : ''
                }`}
              />
            </button>
            {showExtras && (
              <div id="template-extras" className="space-y-3 pb-4">
                <div className="flex items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white/60 p-4 dark:border-gray-700 dark:bg-gray-900/30">
                  <div className="min-w-0">
                    <p id="template-sections-label" className="font-semibold">
                      {TEMPLATE_SECTION.name}s
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                      {TEMPLATE_SECTION.description}{' '}
                      {formatRM(TEMPLATE_SECTION.price)} each.
                    </p>
                  </div>
                  <div
                    role="group"
                    aria-labelledby="template-sections-label"
                    className="flex shrink-0 items-center gap-2"
                  >
                    <button
                      type="button"
                      onClick={() => setSections((count) => count - 1)}
                      disabled={sections === 0}
                      aria-label="Remove a section"
                      className={STEPPER_BUTTON}
                    >
                      <Minus size={15} aria-hidden="true" />
                    </button>
                    <output
                      aria-live="polite"
                      className="w-5 text-center font-mono font-semibold"
                    >
                      {sections}
                    </output>
                    <button
                      type="button"
                      onClick={() => setSections((count) => count + 1)}
                      disabled={sections === TEMPLATE_SECTION.max}
                      aria-label="Add a section"
                      className={STEPPER_BUTTON}
                    >
                      <Plus size={15} aria-hidden="true" />
                    </button>
                  </div>
                </div>

                {optionalFeatures.map((feature) => (
                  <ExtraOption
                    key={feature.id}
                    name={feature.name}
                    price={`+${formatRM(feature.price)}`}
                    description={feature.description ?? ''}
                    runningCost={feature.runningCost}
                    checked={featureIds.includes(feature.id)}
                    onChange={() => toggle(feature.id)}
                  />
                ))}

                {canPayOnline && (
                  <ExtraOption
                    name={TEMPLATE_PAYMENTS.name}
                    price={`+${paymentsRange}`}
                    description={`${TEMPLATE_PAYMENTS.description} The final price is confirmed in a quote.`}
                    runningCost={TEMPLATE_PAYMENTS.runningCost}
                    checked={payments}
                    onChange={() => setPayments((value) => !value)}
                    quoted
                  />
                )}

                <LanguagePicker
                  languages={languages}
                  onChange={setLanguages}
                  idPrefix="template"
                />
                <CmsPicker
                  cms={WEBSITE_CMS}
                  selection={cmsTabIds}
                  onChange={setCmsTabIds}
                  idPrefix="template"
                />
              </div>
            )}
          </div>
        </>
      }
      order={
        <>
          <OrderSummary
            id="template-order-summary"
            plain
            lines={[
              ...lines.map((line) => ({
                label: line.label,
                value: formatRM(line.price),
              })),
              ...(quoted
                ? [
                    {
                      label: `${TEMPLATE_PAYMENTS.name} (quoted)`,
                      value: paymentsRange,
                    },
                  ]
                : []),
              {
                label: firstCare.label,
                value: formatRM(firstCare.amount),
                detail: (
                  <BillingSwitch
                    name="template-billing"
                    value={billing}
                    onChange={setBilling}
                    label={`Pay the ${carePlan.name}`}
                  />
                ),
              },
            ]}
            discount={
              eligiblePromo && afterPromo < total
                ? {
                    label: `Promo ${eligiblePromo.code}`,
                    amount: total - afterPromo,
                  }
                : null
            }
            totalLabel={quoted ? 'Estimated total' : 'Total'}
            total={grandTotal}
            note={`Then ${careText} for the ${carePlan.name}`}
            quoted={quoted}
            action={orderButton('hidden w-full md:inline-flex')}
            footnote={
              saving > 0 && (
                <p className="mt-3 text-xs font-medium text-green-700 dark:text-green-400 md:text-center">
                  {formatRM(saving)} less than a custom build
                </p>
              )
            }
          >
            <ul className="space-y-2 empty:hidden">
              <PromoPerks target={TEMPLATE_PROMO_TARGET.id} quoted={false} />
            </ul>
            <PromoField
              targets={[TEMPLATE_PROMO_TARGET]}
              inputId="template-promo-code"
            />
          </OrderSummary>
        </>
      }
      bar={
        <>
          <div className="min-w-0">
            <p
              className={`truncate font-black tracking-tight ${
                quoted
                  ? 'text-base text-purple-700 dark:text-purple-300'
                  : 'text-xl'
              }`}
            >
              {grandTotal}
            </p>
            <p className="truncate text-xs text-gray-500 dark:text-gray-400">
              then {careText}
            </p>
          </div>
          {orderButton('shrink-0')}
        </>
      }
    />
  );
}
