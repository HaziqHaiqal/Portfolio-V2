'use client';

import { useState } from 'react';
import { ArrowUpRight, Check, LayoutTemplate, Minus, Plus } from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import type { WebsiteTemplate } from '@lib/supabase';
import {
  BUG_FIX_INCLUDE,
  BUSINESS_MAX_PAGES,
  CARE_PLAN,
  careForTemplate,
  CARE_YEARLY_SAVING,
  carePrice,
  countLabel,
  DEFAULT_LANGUAGE,
  languageAddOn,
  templateIncludesOf,
  GATEWAY_FEES,
  isStoreTemplate,
  packageOfTemplate,
  pageCount,
  PAYMENT_TERMS,
  templateCategoryLabel,
  TEMPLATE_PROMO_TARGET,
  TEMPLATE_SETUP,
  templatePromoTarget,
  templateAddOnsOf,
  type TemplateAddOn,
} from '@constants/services';
import { formatRM } from '@lib/format';
import UniversalImage from '@components/Media/UniversalImage';
import PromoField from '@components/Promo/PromoField';
import { PromoPerks } from '@components/Promo/PromoParts';
import { usePromo } from '@components/Promo/PromoProvider';
import DealSuggestion from '@components/Promo/DealSuggestion';
import { discountedPrice, promoAppliesTo } from '@lib/promo';
import type { FeaturedDeal } from '@lib/data';
import OrderSummary from './OrderSummary';
import OrderDialog from './OrderDialog';
import { ExtraLanguages, MainLanguage, nextLanguage } from './Languages';
import { CarePrices, careChoice, trackWhatsApp } from './PriceParts';

function AddOnText({
  item,
  each = false,
}: {
  item: TemplateAddOn;
  each?: boolean;
}) {
  return (
    <span className="min-w-0 flex-1">
      <span className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {item.name}
        </span>
        <span className="shrink-0 text-sm font-semibold tabular-nums text-green-700 dark:text-green-400">
          +{formatRM(item.price)}
          {each && ' each'}
        </span>
      </span>
      <span className="mt-0.5 block text-xs leading-relaxed text-gray-500 dark:text-gray-400">
        {item.description}
      </span>
    </span>
  );
}

const STEP =
  'flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/40 disabled:opacity-40 dark:border-gray-600 dark:text-gray-300';

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
  const { promo } = usePromo();
  const store = isStoreTemplate(template.category);
  const care = careForTemplate(template);
  const careLabel = CARE_PLAN;
  const pages = pageCount(template.pages);
  const { tab, bundle } = packageOfTemplate(template);
  const saving = Math.max(0, bundle.price - template.price);
  const packageIncludes = store
    ? [BUG_FIX_INCLUDE]
    : templateIncludesOf(tab, bundle);

  const maxExtraPages = Math.max(0, BUSINESS_MAX_PAGES - (pages ?? 1));
  const addOns = templateAddOnsOf(template).filter(
    (item) => !item.perPage || maxExtraPages > 0
  );
  const [counts, setCounts] = useState<Record<string, number>>({});
  const setCount = (id: string, qty: number) =>
    setCounts((current) => ({ ...current, [id]: qty }));
  const [mainLanguage, setMainLanguage] = useState(DEFAULT_LANGUAGE);
  const [languages, setLanguages] = useState<string[]>([]);
  const pickMain = (value: string) => {
    setMainLanguage(value);
    setLanguages((current) => current.filter((item) => item !== value));
  };
  const qtyOf = (item: TemplateAddOn) =>
    item.perLanguage ? languages.length : (counts[item.id] ?? 0);
  const chosen = addOns.flatMap((item) => {
    const qty = qtyOf(item);
    if (!qty) return [];
    if (!item.perLanguage) return [{ ...item, qty, amount: item.price * qty }];
    const line = languageAddOn(item, languages);
    return [{ ...line, qty: 1, amount: line.price }];
  });
  const addOnLabel = (item: (typeof chosen)[number]) =>
    item.qty > 1 ? `${item.name} × ${item.qty}` : item.name;

  const thisTemplateTarget = {
    id: templatePromoTarget(template.slug),
    name: template.name,
    label: `${template.name} template`,
  };
  const promoTargetIds = [TEMPLATE_PROMO_TARGET.id, thisTemplateTarget.id];
  const saleAmount = sale
    ? template.price - discountedPrice(template.price, sale)
    : 0;
  const afterSale = template.price - saleAmount;
  const eligiblePromo =
    promo && promoAppliesTo(promo, promoTargetIds) ? promo : null;
  const total = eligiblePromo
    ? discountedPrice(afterSale, eligiblePromo)
    : afterSale;
  const promoAmount = afterSale - total;
  const grandTotal = total + chosen.reduce((sum, item) => sum + item.amount, 0);

  const href = (() => {
    const url = new URL(whatsappHref);
    url.searchParams.set(
      'text',
      [
        `Hi Haziq, I'd like the ${template.name} template.`,
        `• ${template.name} template: ${formatRM(template.price)}`,
        `• Main language: ${mainLanguage}`,
        ...chosen.map(
          (item) => `• ${addOnLabel(item)}: ${formatRM(item.amount)}`
        ),
        ...(sale && saleAmount
          ? [`• Deal (${sale.title || sale.code}): −${formatRM(saleAmount)}`]
          : []),
        ...(eligiblePromo && promoAmount
          ? [`• Promo ${eligiblePromo.code}: −${formatRM(promoAmount)}`]
          : []),
        `• ${careLabel} after launch: ${careChoice(care)}`,
        `Total: ${formatRM(grandTotal)}`,
        'Please let me know what you need from me to get started.',
      ].join('\n')
    );
    return url.toString();
  })();

  const orderButton = (className = '') => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() =>
        trackWhatsApp({
          tab: 'templates',
          package: template.slug,
          features: chosen.length,
        })
      }
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-green-600 text-sm font-semibold text-white shadow-lg shadow-green-600/20 transition-colors hover:bg-green-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-500/30 ${className}`}
    >
      <SiWhatsapp size={16} aria-hidden="true" />
      Order on WhatsApp
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
              {templateCategoryLabel(template.category)}
              {pages !== null && ` · ${countLabel(pages, 'page')}`}
              {` · ${bundle.name} package`}
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
            {[TEMPLATE_SETUP, ...template.features].map((item) => (
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
          {!store && (
            <h4 className="mt-6 text-sm font-semibold">
              Everything in the {bundle.name} package
            </h4>
          )}
          <ul className="mt-3 space-y-2">
            {packageIncludes.map((item) => (
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
          {addOns.length > 0 && (
            <>
              <h4 className="mt-6 text-sm font-semibold">Add if you need</h4>
              <ul className="mt-1 divide-y divide-gray-200 dark:divide-gray-700">
                <li className="py-3 pl-8">
                  <MainLanguage
                    value={mainLanguage}
                    onChange={pickMain}
                    className="justify-between"
                  />
                </li>
                {addOns.map((item) => {
                  const qty = qtyOf(item);
                  return (
                    <li key={item.id} className="py-3">
                      {item.perPage ? (
                        <div className="pl-8">
                          <AddOnText item={item} each />
                          <div className="mt-2 flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => setCount(item.id, qty - 1)}
                              disabled={qty === 0}
                              aria-label="One page fewer"
                              className={STEP}
                            >
                              <Minus size={14} aria-hidden="true" />
                            </button>
                            <span
                              aria-live="polite"
                              className="min-w-[4.5rem] text-center text-sm tabular-nums"
                            >
                              {qty} {qty === 1 ? 'page' : 'pages'}
                            </span>
                            <button
                              type="button"
                              onClick={() => setCount(item.id, qty + 1)}
                              disabled={qty >= maxExtraPages}
                              aria-label="One more page"
                              className={STEP}
                            >
                              <Plus size={14} aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="relative flex cursor-pointer items-start gap-3 rounded-lg has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-green-500/40">
                          <input
                            type="checkbox"
                            checked={qty > 0}
                            onChange={(event) => {
                              const on = event.target.checked;
                              if (item.perLanguage) {
                                const first = nextLanguage([mainLanguage]);
                                setLanguages(on && first ? [first] : []);
                              } else {
                                setCount(item.id, on ? 1 : 0);
                              }
                            }}
                            className="sr-only"
                          />
                          <span
                            aria-hidden="true"
                            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                              qty
                                ? 'border-green-600 bg-green-600 text-white'
                                : 'border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-900'
                            }`}
                          >
                            {qty ? (
                              <Check size={12} strokeWidth={3} />
                            ) : (
                              <Plus
                                size={12}
                                strokeWidth={3}
                                className="text-gray-400"
                              />
                            )}
                          </span>
                          <AddOnText item={item} each={item.perLanguage} />
                        </label>
                      )}
                      {item.perLanguage && languages.length > 0 && (
                        <div className="pl-8">
                          <ExtraLanguages
                            main={mainLanguage}
                            languages={languages}
                            onChange={setLanguages}
                          />
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </>
          )}
          <p className="mt-4 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
            {store &&
              `${GATEWAY_FEES}. You sign up with the gateway in your business name, and it is connected for you. `}
            {addOns.some((item) => item.ai) &&
              'AI add-ons have usage fees, paid by you to the AI provider. '}
            Anything not listed is quoted on WhatsApp before any work starts.
          </p>
        </>
      }
      order={
        <OrderSummary
          id="template-order-summary"
          plain
          lines={[
            {
              label: `${template.name} template`,
              value: formatRM(template.price),
            },
            ...chosen.map((item) => ({
              label: `+ ${addOnLabel(item)}`,
              value: formatRM(item.amount),
            })),
            {
              label: `${careLabel} after launch`,
              value: carePrice(care),
              detail: (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  or {carePrice(care, 'yearly')} (save {CARE_YEARLY_SAVING}%).
                  Choose on WhatsApp.
                </p>
              ),
            },
          ]}
          discount={[
            ...(sale && saleAmount
              ? [{ label: `Deal: ${sale.title || 'Sale'}`, amount: saleAmount }]
              : []),
            ...(eligiblePromo && promoAmount
              ? [{ label: `Promo ${eligiblePromo.code}`, amount: promoAmount }]
              : []),
          ]}
          totalLabel="Total"
          total={formatRM(grandTotal)}
          note={PAYMENT_TERMS}
          action={orderButton('hidden w-full px-5 md:inline-flex')}
          footnote={
            saving > 0 && (
              <p className="mt-3 text-xs font-medium text-green-700 dark:text-green-400 md:text-center">
                {formatRM(saving)} less than the {bundle.name} package at{' '}
                {formatRM(bundle.price)}
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
      }
      bar={
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <p className="shrink-0 text-lg font-black tracking-tight min-[380px]:text-xl">
              {formatRM(grandTotal)}
            </p>
            {orderButton('shrink-0 whitespace-nowrap px-4')}
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
            <CarePrices tier={care} />
          </p>
        </div>
      }
    />
  );
}
