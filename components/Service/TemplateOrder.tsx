'use client';

import { ArrowUpRight, Check, LayoutTemplate } from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import type { WebsiteTemplate } from '@lib/supabase';
import {
  CARE_PLAN,
  careForTemplate,
  carePrice,
  countLabel,
  GATEWAY_FEES,
  isStoreTemplate,
  pageCount,
  PAYMENT_TERMS,
  templateCategoryLabel,
  TEMPLATE_INCLUDES,
  TEMPLATE_PROMO_TARGET,
  templatePromoTarget,
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
  const careText = `${carePrice(care)} after launch`;
  const pages = pageCount(template.pages);
  const saving =
    template.compare_price != null && template.compare_price > template.price
      ? template.compare_price - template.price
      : 0;

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

  const href = (() => {
    const url = new URL(whatsappHref);
    url.searchParams.set(
      'text',
      [
        `Hi Haziq, I'd like the ${template.name} template.`,
        `• ${template.name} template: ${formatRM(template.price)}`,
        ...(sale && saleAmount
          ? [`• Deal (${sale.title || sale.code}): −${formatRM(saleAmount)}`]
          : []),
        ...(eligiblePromo && promoAmount
          ? [`• Promo ${eligiblePromo.code}: −${formatRM(promoAmount)}`]
          : []),
        `• ${careLabel}: ${careText}`,
        `Total: ${formatRM(total)}`,
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
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-green-600 px-5 text-sm font-semibold text-white shadow-lg shadow-green-600/20 transition-colors hover:bg-green-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-500/30 ${className}`}
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
            {[...template.features, ...TEMPLATE_INCLUDES].map((item) => (
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
          <p className="mt-4 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
            {store &&
              `${GATEWAY_FEES}. You sign up with the gateway in your business name, and it is connected for you. `}
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
            { label: careLabel, value: careText },
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
          total={formatRM(total)}
          note={PAYMENT_TERMS}
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
      }
      bar={
        <>
          <div className="min-w-0">
            <p className="truncate text-xl font-black tracking-tight">
              {formatRM(total)}
            </p>
            <p className="truncate text-xs text-gray-500 dark:text-gray-400">
              then {carePrice(care)}
            </p>
          </div>
          {orderButton('shrink-0')}
        </>
      }
    />
  );
}
