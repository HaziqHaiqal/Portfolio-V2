'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, ArrowUpRight, Check, LayoutTemplate } from 'lucide-react';
import type { WebsiteTemplate } from '@lib/supabase';
import type { FeaturedDeal } from '@lib/data';
import { formatRM } from '@lib/format';
import { discountedPrice, isTemplateSale, promoAppliesTo } from '@lib/promo';
import {
  TEMPLATE_CATEGORIES,
  templateCategoryLabel,
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
// Two rows on desktop; the page often opens scrolled to the gallery.
const EAGER_PREVIEWS = 4;
// The standout features shown on each card; the order window lists them all.
const HIGHLIGHTS = 3;
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

  const categories = TEMPLATE_CATEGORIES.filter((c) =>
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

      <ul className="grid gap-6 md:grid-cols-2">
        {visible.map((template, index) => {
          const offer = bestOffer(deals, template, true);
          const categoryLabel = templateCategoryLabel(template.category);
          const highlights = template.features.slice(0, HIGHLIGHTS);

          return (
            <li
              key={template.id}
              className="flex flex-col rounded-3xl border border-gray-200 bg-white/70 p-3 shadow-sm backdrop-blur-sm transition-shadow duration-300 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800/70"
            >
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
                <span className="absolute right-3 top-3 z-10 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-gray-900 shadow-sm backdrop-blur">
                  {categoryLabel}
                  {template.pages && (
                    <span className="font-normal text-gray-500">
                      {' '}
                      · {template.pages}
                    </span>
                  )}
                </span>
                {template.preview_image_url ? (
                  <UniversalImage
                    src={template.preview_image_url}
                    alt={`${template.name} template preview`}
                    width={0}
                    height={0}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    loading={index < EAGER_PREVIEWS ? 'eager' : undefined}
                  />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <LayoutTemplate size={28} aria-hidden="true" />
                  </span>
                )}
              </a>

              <div className="flex flex-1 flex-col px-3 pb-3 pt-5">
                <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                  {template.name}
                </h3>
                {template.description && (
                  <p className="mt-1.5 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    {template.description}
                  </p>
                )}
                {highlights.length > 0 && (
                  <ul className="mt-4 space-y-2">
                    {highlights.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300"
                      >
                        <Check
                          size={16}
                          aria-hidden="true"
                          className="mt-0.5 shrink-0 text-green-600 dark:text-green-400"
                        />
                        <span className="line-clamp-2">{item}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-auto pt-5">
                  <div className="flex items-end justify-between gap-4 border-t border-gray-200 pt-4 dark:border-gray-700">
                    <div>
                      <p className="flex flex-wrap items-baseline gap-x-2 text-2xl font-black tracking-tight text-gray-900 dark:text-white">
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
                      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                        One-time price
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <a
                      href={template.demo_url ?? undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-gray-300 px-3 text-sm font-semibold text-gray-800 transition-colors hover:border-gray-400 hover:bg-gray-900/5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-500/20 dark:border-gray-600 dark:text-gray-200 dark:hover:border-gray-500 dark:hover:bg-white/5"
                    >
                      Live demo
                      <ArrowUpRight size={15} aria-hidden="true" />
                    </a>
                    <button
                      type="button"
                      onClick={() => setOrdering(template)}
                      className="group/use inline-flex min-h-11 items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-green-600 px-3 text-sm font-semibold text-white shadow-lg shadow-green-600/20 transition-colors hover:bg-green-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-500/30"
                    >
                      Use template
                      <ArrowRight
                        size={15}
                        aria-hidden="true"
                        className="hidden transition-transform group-hover/use:translate-x-0.5 min-[400px]:block"
                      />
                    </button>
                  </div>
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
