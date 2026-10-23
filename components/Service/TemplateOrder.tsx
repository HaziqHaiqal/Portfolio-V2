'use client';

import { useState } from 'react';
import { ArrowUpRight, Check, ChevronDown, LayoutTemplate } from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import type { WebsiteTemplate } from '@lib/supabase';
import {
  ADD_ONS,
  careFirstPayment,
  careName,
  carePrice,
  careTierForTemplate,
  type CareBilling,
  cmsLabel,
  cmsPrice,
  GATEWAY_RUNNING_COST,
  isStoreTemplate,
  MULTI_LANGUAGE,
  offeredFor,
  SITE_TYPES,
  STORE_TEMPLATE_ADD_ONS,
  STORE_TEMPLATE_ADMIN_ADD_ONS,
  templateCategoryLabel,
  TEMPLATE_INCLUDES,
  TEMPLATE_PROMO_TARGET,
  templatePromoTarget,
  toggleAddOn,
  WEBSITE_CMS,
  WEBSITE_ESTIMATOR,
} from '@constants/services';
import { formatRM, formatRMRange } from '@lib/format';
import UniversalImage from '@components/Media/UniversalImage';
import PromoField from '@components/Promo/PromoField';
import { PromoPerks } from '@components/Promo/PromoParts';
import { usePromo } from '@components/Promo/PromoProvider';
import { type AppliedPromo, discountedPrice, promoAppliesTo } from '@lib/promo';
import BillingSwitch from './BillingSwitch';
import OrderSummary from './OrderSummary';
import OrderDialog from './OrderDialog';
import DealSuggestion from '@components/Promo/DealSuggestion';
import type { FeaturedDeal } from '@lib/data';
import AddOnChecklist from './AddOnChecklist';

export default function TemplateOrder({
  template,
  sale,
  suggestion,
  whatsappHref,
  onClose,
}: {
  template: WebsiteTemplate;
  /** A running sale on this template: taken off automatically. */
  sale: FeaturedDeal | null;
  /** A public code to offer when none is applied. */
  suggestion: FeaturedDeal | null;
  whatsappHref: string;
  onClose: () => void;
}) {
  const [showExtras, setShowExtras] = useState(false);
  const [featureIds, setFeatureIds] = useState<string[]>([]);
  const [cmsTabIds, setCmsTabIds] = useState<string[] | null>(null);
  const [languages, setLanguages] = useState<string[]>([]);
  const carePlan = WEBSITE_ESTIMATOR.carePlan;
  const store = isStoreTemplate(template.category);
  const careTier = careTierForTemplate(template);
  const careLabel = careName(carePlan, careTier);
  const [billing, setBilling] = useState<CareBilling>('monthly');

  const siteTypeEntry = SITE_TYPES.find(
    (type) => type.id === template.category
  );
  const siteType = siteTypeEntry?.id ?? null;
  const categoryLabel = templateCategoryLabel(template.category);
  const saving =
    template.compare_price != null && template.compare_price > template.price
      ? template.compare_price - template.price
      : 0;

  const includedFeatures = ADD_ONS.filter(
    (addOn) => siteType !== null && addOn.includedIn?.includes(siteType)
  );
  const includedIds = includedFeatures.map((addOn) => addOn.id);
  // A store already takes payments and has its dashboard, so it offers its own add-ons.
  const optionalFeatures = store
    ? [...STORE_TEMPLATE_ADMIN_ADD_ONS, ...STORE_TEMPLATE_ADD_ONS]
    : ADD_ONS.filter(
        (addOn) =>
          offeredFor(addOn, siteType) && !includedIds.includes(addOn.id)
      );
  const typedOptional = optionalFeatures.filter((addOn) => addOn.siteTypes);
  const everyOptional = optionalFeatures.filter((addOn) => !addOn.siteTypes);
  const chosen = optionalFeatures.filter((addOn) =>
    featureIds.includes(addOn.id)
  );
  const fixedChosen = chosen.filter((addOn) => !addOn.priceTo);
  const quotedChosen = chosen.filter((addOn) => addOn.priceTo);
  const quoted = quotedChosen.length > 0;
  const quotedFrom = quotedChosen.reduce((sum, addOn) => sum + addOn.price, 0);
  const quotedTo = quotedChosen.reduce(
    (sum, addOn) => sum + (addOn.priceTo ?? addOn.price),
    0
  );
  const rangeOf = (addOn: (typeof ADD_ONS)[number]) =>
    formatRMRange(addOn.price, addOn.priceTo ?? addOn.price);
  const cmsTotal = cmsPrice(WEBSITE_CMS, cmsTabIds);

  const lines = [
    { label: `${template.name} template`, price: template.price },
    ...fixedChosen.map((addOn) => ({ label: addOn.name, price: addOn.price })),
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
  const extrasCount = lines.length - 1 + quotedChosen.length;
  const { promo } = usePromo();
  const thisTemplateTarget = {
    id: templatePromoTarget(template.slug),
    name: template.name,
    label: `${template.name} template`,
  };
  const promoTargetIds = [TEMPLATE_PROMO_TARGET.id, thisTemplateTarget.id];
  const saleAmount = sale
    ? template.price - discountedPrice(template.price, sale)
    : 0;
  const afterSale = total - saleAmount;
  const eligiblePromo =
    promo && !quoted && promoAppliesTo(promo, promoTargetIds) ? promo : null;
  const afterPromo = eligiblePromo
    ? discountedPrice(afterSale, eligiblePromo)
    : afterSale;
  const careWithDatabase = cmsTabIds !== null;
  const careText = carePrice(carePlan, careWithDatabase, billing, careTier);
  const firstCare = careFirstPayment(
    carePlan,
    careWithDatabase,
    billing,
    careTier
  );
  const grandTotal = quoted
    ? formatRMRange(
        afterSale + quotedFrom + firstCare.amount,
        afterSale + quotedTo + firstCare.amount
      )
    : formatRM(afterPromo + firstCare.amount);

  const href = (() => {
    const url = new URL(whatsappHref);
    url.searchParams.set(
      'text',
      [
        quoted
          ? `Hi Haziq, I'd like a quote for the ${template.name} template with ${quotedChosen.map((addOn) => addOn.name.toLowerCase()).join(' and ')}.`
          : `Hi Haziq, I'd like the ${template.name} template.`,
        ...lines.map((line) => `• ${line.label}: ${formatRM(line.price)}`),
        ...quotedChosen.map(
          (addOn) => `• ${addOn.name}: ${rangeOf(addOn)} (to be quoted)`
        ),
        `• ${careLabel}: ${careText} (first ${firstCare.period} included)`,
        ...(sale && saleAmount
          ? [`• Deal (${sale.title || sale.code}): −${formatRM(saleAmount)}`]
          : []),
        ...(eligiblePromo && afterPromo < afterSale
          ? [
              `• Promo ${eligiblePromo.code}: −${formatRM(afterSale - afterPromo)}`,
            ]
          : []),
        `${quoted ? 'Estimated total' : 'Total'}: ${grandTotal}`,
        quoted
          ? 'Please confirm the final quote and what you need from me.'
          : 'Please let me know what you need from me to get started.',
      ].join('\n')
    );
    return url.toString();
  })();

  const toggle = (id: string) =>
    setFeatureIds((ids) => toggleAddOn(ids, id, includedIds));

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
                loading="eager"
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
              ...(store
                ? template.features
                : includedFeatures.map((feature) => feature.name)),
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
          {store && (
            <p className="mt-3 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
              {GATEWAY_RUNNING_COST}. You sign up with the gateway in your
              business name, and we connect it.
            </p>
          )}

          <div className="mt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              aria-expanded={showExtras}
              aria-controls="template-extras"
              onClick={() => setShowExtras((value) => !value)}
              className="flex w-full items-center justify-between gap-3 py-4 text-left text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/40"
            >
              <span>
                Add-ons{' '}
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
              <div id="template-extras" className="pb-4">
                <AddOnChecklist
                  idPrefix="template"
                  groups={
                    store
                      ? [
                          {
                            label: 'Add to the Admin portal',
                            addOns: STORE_TEMPLATE_ADMIN_ADD_ONS,
                          },
                          {
                            label: 'Other add-ons',
                            addOns: STORE_TEMPLATE_ADD_ONS,
                          },
                        ]
                      : [
                          ...(typedOptional.length
                            ? [
                                {
                                  label:
                                    siteTypeEntry?.heading ?? categoryLabel,
                                  addOns: typedOptional,
                                },
                              ]
                            : []),
                          { label: 'Other add-ons', addOns: everyOptional },
                        ]
                  }
                  selected={featureIds}
                  onToggle={toggle}
                  languages={languages}
                  onLanguagesChange={setLanguages}
                  cms={store ? undefined : WEBSITE_CMS}
                  cmsSelection={cmsTabIds}
                  onCmsChange={setCmsTabIds}
                  siteType={siteType}
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
              ...quotedChosen.map((addOn) => ({
                label: `${addOn.name} (quoted)`,
                value: rangeOf(addOn),
              })),
              {
                label: careLabel,
                value: careText,
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
            discount={[
              ...(sale && saleAmount
                ? [
                    {
                      label: `Deal: ${sale.title || 'Sale'}`,
                      amount: saleAmount,
                    },
                  ]
                : []),
              ...(eligiblePromo && afterPromo < afterSale
                ? [
                    {
                      label: `Promo ${eligiblePromo.code}`,
                      amount: afterSale - afterPromo,
                    },
                  ]
                : []),
            ]}
            totalLabel={quoted ? 'Estimated total' : 'Total'}
            total={grandTotal}
            note={`Includes ${formatRM(firstCare.amount)} for the first ${firstCare.period}, then ${careText}`}
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
              <PromoPerks target={promoTargetIds} quoted={false} />
            </ul>
            <DealSuggestion deal={suggestion} />
            <PromoField
              targets={[TEMPLATE_PROMO_TARGET, thisTemplateTarget]}
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
