'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, ArrowUpRight, LayoutTemplate } from 'lucide-react';
import type { WebsiteTemplate } from '@lib/supabase';
import type { FeaturedDeal } from '@lib/data';
import { formatRM } from '@lib/format';
import { discountedPrice, isTemplateSale, promoAppliesTo } from '@lib/promo';
import {
  SITE_TYPES,
  TEMPLATE_PROMO_TARGET,
  templatePromoTarget,
} from '@constants/services';
import { HANDOFF, takeHandoff } from '@lib/handoff';
import UniversalImage from '@components/Media/UniversalImage';
import { PromoPrice } from '@components/Promo/PromoParts';
import TemplateOrder from './TemplateOrder';

const ALL = 'all';
// A handful of templates reads better without filters.
const FILTER_FROM = 6;
/** The biggest saving on this template, from sales or from codes. */
function bestOffer(
  deals: FeaturedDeal[],
  template: WebsiteTemplate,
  sales: boolean
) {
  const targets = [
    TEMPLATE_PROMO_TARGET.id,
    templatePromoTarget(template.slug),
  ];
  return deals.reduce<{ deal: FeaturedDeal; saving: number } | null>(
    (best, deal) => {
      if (isTemplateSale(deal) !== sales || !promoAppliesTo(deal, targets))
        return best;
      const saving = template.price - discountedPrice(template.price, deal);
      return saving > (best?.saving ?? 0) ? { deal, saving } : best;
    },
    null
  );
}

export default function TemplateGallery({
  templates,
  whatsappHref,
  deals = [],
}: {
  templates: WebsiteTemplate[];
  whatsappHref: string;
  /** Running deals; the best one for each template gets a badge. */
  deals?: FeaturedDeal[];
}) {
  const [category, setCategory] = useState(ALL);
  const [ordering, setOrdering] = useState<WebsiteTemplate | null>(null);
  // "Use this template" on a demo hands its slug over to open the order.
  useEffect(() => {
    const slug = takeHandoff(HANDOFF.templateOrder);
    const template = templates.find((item) => item.slug === slug);
    if (!template) return;
    const frame = requestAnimationFrame(() => setOrdering(template));
    return () => cancelAnimationFrame(frame);
  }, [templates]);

  const categories = SITE_TYPES.filter((c) =>
    templates.some((t) => t.category === c.id)
  );
  const visible =
    category === ALL
      ? templates
      : templates.filter((t) => t.category === category);

  return (
    <div>
      {templates.length > FILTER_FROM && categories.length > 1 && (
        <div
          role="group"
          aria-label="Filter templates by category"
          className="mb-10 flex flex-wrap justify-center gap-2"
        >
          {[{ id: ALL, label: 'All' }, ...categories].map((item) => {
            const active = category === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={active}
                onClick={() => setCategory(item.id)}
                className={`min-h-10 rounded-full border px-4 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-500/20 ${
                  active
                    ? 'border-gray-900 bg-gray-900 text-white dark:border-white dark:bg-white dark:text-gray-900'
                    : 'border-gray-300 bg-white/60 text-gray-700 hover:border-gray-400 dark:border-gray-600 dark:bg-gray-800/60 dark:text-gray-300'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      )}

      <ul className="grid gap-x-8 gap-y-10 md:grid-cols-2 md:gap-y-12">
        {visible.map((template, index) => {
          const offer = bestOffer(deals, template, true);
          const categoryLabel =
            SITE_TYPES.find((c) => c.id === template.category)?.label ??
            'Template';

          return (
            <li key={template.id}>
              <a
                href={template.demo_url ?? undefined}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open the ${template.name} live demo`}
                className="group relative block aspect-[16/10] overflow-hidden rounded-2xl bg-gray-100 ring-1 ring-gray-900/5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-500/40 dark:bg-gray-900 dark:ring-white/10"
              >
                {offer && (
                  <span className="absolute left-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-2.5 py-1 text-xs text-white shadow-lg">
                    <span className="font-bold uppercase tracking-wider">
                      Deal
                    </span>
                    {formatRM(offer.saving)} off
                  </span>
                )}
                {template.preview_image_url ? (
                  <UniversalImage
                    src={template.preview_image_url}
                    alt={`${template.name} template preview`}
                    width={0}
                    height={0}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    loading={index < 2 ? 'eager' : undefined}
                  />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <LayoutTemplate size={28} aria-hidden="true" />
                  </span>
                )}
                <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-gray-950/70 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 [@media(hover:hover)]:translate-y-1 [@media(hover:hover)]:opacity-0">
                  Live demo
                  <ArrowUpRight size={13} aria-hidden="true" />
                </span>
              </a>

              <div className="mt-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 md:text-lg">
                    {template.name}
                  </h3>
                  <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                    {categoryLabel}
                    {template.pages && ` · ${template.pages}`}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end">
                  <p className="flex flex-wrap items-baseline justify-end gap-x-1.5 font-semibold text-gray-900 dark:text-gray-100 md:text-lg">
                    <PromoPrice
                      target={[
                        TEMPLATE_PROMO_TARGET.id,
                        templatePromoTarget(template.slug),
                      ]}
                      price={template.price}
                      salePrice={
                        offer ? template.price - offer.saving : undefined
                      }
                    />
                  </p>
                  <button
                    type="button"
                    onClick={() => setOrdering(template)}
                    className="group/use mt-0.5 inline-flex items-center gap-1 rounded text-sm font-medium text-green-700 transition-colors hover:text-green-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/40 dark:text-green-400 dark:hover:text-green-300"
                  >
                    Use template
                    <ArrowRight
                      size={14}
                      aria-hidden="true"
                      className="transition-transform group-hover/use:translate-x-0.5"
                    />
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {ordering && (
        <TemplateOrder
          key={ordering.id}
          template={ordering}
          sale={bestOffer(deals, ordering, true)?.deal ?? null}
          suggestion={bestOffer(deals, ordering, false)?.deal ?? null}
          whatsappHref={whatsappHref}
          onClose={() => setOrdering(null)}
        />
      )}
    </div>
  );
}
