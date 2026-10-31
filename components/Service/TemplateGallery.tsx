'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import * as Select from '@radix-ui/react-select';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  LayoutGrid,
  LayoutTemplate,
  List,
} from 'lucide-react';
import type { WebsiteTemplate } from '@lib/supabase';
import type { FeaturedDeal } from '@lib/data';
import { formatRM } from '@lib/format';
import { discountedPrice, isTemplateSale, promoAppliesTo } from '@lib/promo';
import {
  countLabel,
  packageOfTemplate,
  pageCount,
  TEMPLATE_CATEGORIES,
  templateCategoryLabel,
  TEMPLATE_PROMO_TARGET,
  templatePromoTarget,
} from '@constants/services';
import { HANDOFF, takeHandoff } from '@lib/handoff';
import UniversalImage from '@components/Media/UniversalImage';
import { PromoPrice } from '@components/Promo/PromoParts';
import TemplateOrder from './TemplateOrder';
import CardCarousel from './CardCarousel';

const ALL = 'all';
// Two rows on desktop; the page often opens scrolled to the gallery.
const EAGER_PREVIEWS = 4;
// The standout features shown on each card; the order window lists them all.
const HIGHLIGHTS = 3;
const PAGE_SIZE = 12;
const LAYOUT_KEY = 'demo-layout';

type Layout = 'grid' | 'list';

const CARD =
  'flex h-full flex-col rounded-3xl border border-gray-200 bg-white/70 p-3 shadow-sm backdrop-blur-sm transition-shadow duration-300 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800/70';
const PHOTO =
  'group relative block aspect-[16/10] overflow-hidden rounded-2xl bg-gray-100 ring-1 ring-gray-900/5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-500/40 dark:bg-gray-900 dark:ring-white/10';
const SECONDARY =
  'inline-flex min-h-11 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-gray-300 px-3 text-sm font-semibold text-gray-800 transition-colors hover:border-gray-400 hover:bg-gray-900/5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-500/20 dark:border-gray-600 dark:text-gray-200 dark:hover:border-gray-500 dark:hover:bg-white/5';
const PRIMARY =
  'group/use inline-flex min-h-11 items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-green-600 px-3 text-sm font-semibold text-white shadow-lg shadow-green-600/20 transition-colors hover:bg-green-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-500/30';

function Meta({ template }: { template: WebsiteTemplate }) {
  const count = pageCount(template.pages);
  return (
    <>
      {templateCategoryLabel(template.category)}
      {count !== null && (
        <span className="font-medium text-gray-400 dark:text-gray-500">
          {' '}
          · {countLabel(count, 'page')}
        </span>
      )}
    </>
  );
}

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

function CardBody({
  layout,
  eyebrow,
  name,
  description,
  highlights,
  price,
  priceNote,
  actions,
}: {
  layout: Layout;
  eyebrow: ReactNode;
  name: string;
  description?: string | null;
  highlights: string[];
  price: ReactNode;
  priceNote: string;
  actions: ReactNode;
}) {
  const list = layout === 'list';
  return (
    <div
      className={`flex flex-1 flex-col px-3 pb-3 ${list ? 'pt-5 sm:pt-3' : 'pt-4'}`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        {eyebrow}
      </p>
      <h3 className="mt-1.5 text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
        {name}
      </h3>
      {list && description && (
        <p className="mt-1.5 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          {description}
        </p>
      )}
      {list && highlights.length > 0 && (
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
      <div
        className={`mt-auto ${
          list
            ? 'flex flex-col gap-4 border-t border-gray-200 pt-4 dark:border-gray-700 sm:flex-row sm:items-end sm:justify-between'
            : 'pt-3'
        }`}
      >
        <div>
          <p className="flex flex-wrap items-baseline gap-x-2 text-2xl font-black tracking-tight text-gray-900 dark:text-white">
            {price}
          </p>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            {priceNote}
          </p>
        </div>
        <div
          className={
            list
              ? 'grid grid-cols-2 gap-2 sm:flex sm:[&>*]:px-5'
              : 'mt-4 grid grid-cols-2 gap-2'
          }
        >
          {actions}
        </div>
      </div>
    </div>
  );
}

function PrimaryLabel({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <ArrowRight
        size={15}
        aria-hidden="true"
        className="hidden transition-transform group-hover/use:translate-x-0.5 min-[400px]:block"
      />
    </>
  );
}

export default function TemplateGallery({
  templates,
  whatsappHref,
  deals = [],
  limit,
  seeAllHref,
}: {
  templates: WebsiteTemplate[];
  whatsappHref: string;
  /** Running deals; the best one for each template gets a badge. */
  deals?: FeaturedDeal[];
  limit?: number;
  seeAllHref?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const [category, setCategory] = useState(ALL);
  const [shown, setShown] = useState(PAGE_SIZE);
  const [layout, setLayout] = useState<Layout>('grid');

  // Remember grid or list for this visitor.
  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = window.localStorage.getItem(LAYOUT_KEY);
    } catch {}
    if (saved !== 'list') return;
    const frame = requestAnimationFrame(() => setLayout('list'));
    return () => cancelAnimationFrame(frame);
  }, []);
  const chooseLayout = (next: Layout) => {
    setLayout(next);
    try {
      window.localStorage.setItem(LAYOUT_KEY, next);
    } catch {}
  };
  const [ordering, setOrdering] = useState<WebsiteTemplate | null>(null);

  // "Use this template" on a demo hands its slug over to open the order.
  useEffect(() => {
    const slug = takeHandoff(HANDOFF.templateOrder);
    const template = templates.find((item) => item.slug === slug);
    if (!template) return;
    const frame = requestAnimationFrame(() => {
      root.current?.scrollIntoView({ block: 'start' });
      setOrdering(template);
    });
    return () => cancelAnimationFrame(frame);
  }, [templates]);

  const items = templates;
  const categories = TEMPLATE_CATEGORIES.filter((c) =>
    items.some((item) => item.category === c.id)
  );
  const countOf = (id: string) =>
    id === ALL
      ? items.length
      : items.filter((item) => item.category === id).length;
  const matching =
    category === ALL
      ? items
      : items.filter((item) => item.category === category);
  // One per category leads "All", in the admin's sort order.
  const firsts = categories
    .map((c) => items.find((item) => item.category === c.id))
    .filter((item): item is WebsiteTemplate => Boolean(item))
    .sort((a, b) => items.indexOf(a) - items.indexOf(b));
  const featured =
    category === ALL
      ? [...firsts, ...items.filter((item) => !firsts.includes(item))]
      : matching;
  const visible = limit ? featured.slice(0, limit) : matching.slice(0, shown);
  const hidden = (limit ? items.length : matching.length) - visible.length;

  const filters = [{ id: ALL, label: 'All' }, ...categories];

  const pickCategory = (id: string) => {
    setCategory(id);
    setShown(PAGE_SIZE);
  };

  const cards = visible.map((template, index) => {
    const offer = bestOffer(deals, template, true);
    const pkg = packageOfTemplate(template);
    return (
      <div
        key={template.id}
        className={`${CARD} ${layout === 'list' ? 'sm:flex-row sm:gap-2' : ''}`}
      >
        <a
          href={template.demo_url ?? undefined}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open the ${template.name} live demo`}
          className={`${PHOTO} ${layout === 'list' ? 'sm:w-72 sm:shrink-0 sm:self-start lg:w-80' : ''}`}
        >
          {offer && (
            <span className="absolute left-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-2.5 py-1 text-xs text-white shadow-lg">
              <span className="font-bold uppercase tracking-wider">Deal</span>
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
              loading={index < EAGER_PREVIEWS ? 'eager' : undefined}
            />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center text-gray-400">
              <LayoutTemplate size={28} aria-hidden="true" />
            </span>
          )}
        </a>
        <CardBody
          layout={layout}
          eyebrow={<Meta template={template} />}
          name={template.name}
          description={template.description}
          highlights={template.features.slice(0, HIGHLIGHTS)}
          price={
            <>
              <PromoPrice
                target={[
                  TEMPLATE_PROMO_TARGET.id,
                  templatePromoTarget(template.slug),
                ]}
                price={template.price}
                salePrice={offer ? template.price - offer.saving : undefined}
              />
              {pkg.bundle.price > template.price && (
                <span className="text-sm font-medium tracking-normal text-gray-500 dark:text-gray-400">
                  <span className="sr-only">
                    {pkg.bundle.name} package price:{' '}
                  </span>
                  <s>{formatRM(pkg.bundle.price)}</s>
                </span>
              )}
            </>
          }
          priceNote={`${pkg.bundle.name} package, ready-made design`}
          actions={
            <>
              <a
                href={template.demo_url ?? undefined}
                target="_blank"
                rel="noopener noreferrer"
                className={SECONDARY}
              >
                Try it
                <ArrowUpRight size={15} aria-hidden="true" />
              </a>
              <button
                type="button"
                onClick={() => setOrdering(template)}
                className={PRIMARY}
              >
                <PrimaryLabel>Use template</PrimaryLabel>
              </button>
            </>
          }
        />
      </div>
    );
  });

  // The Services page shows a preview, which swipes on phones.
  const carousel = Boolean(limit) && layout === 'grid';

  return (
    <div ref={root} className="scroll-mt-28">
      <div className="mb-8 flex items-center gap-3">
        {categories.length > 1 && (
          <Select.Root value={category} onValueChange={pickCategory}>
            <Select.Trigger
              aria-label="Filter demos by category"
              className="inline-flex min-h-10 min-w-0 items-center gap-2 rounded-full border border-gray-900 bg-gray-900 px-4 text-sm font-medium text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-500/20 dark:border-white dark:bg-white dark:text-gray-900 lg:hidden"
            >
              <Select.Value>
                <span className="truncate">
                  {category === ALL
                    ? 'All demos'
                    : templateCategoryLabel(category)}
                </span>
              </Select.Value>
              <span className="tabular-nums opacity-60">
                {countOf(category)}
              </span>
              <Select.Icon>
                <ChevronDown size={16} aria-hidden="true" />
              </Select.Icon>
            </Select.Trigger>
            <Select.Portal>
              <Select.Content
                position="popper"
                sideOffset={8}
                className="z-50 min-w-56 overflow-hidden rounded-2xl border border-gray-200 bg-white p-1.5 shadow-2xl dark:border-gray-700 dark:bg-gray-800"
              >
                <Select.Viewport>
                  {filters.map((item) => (
                    <Select.Item
                      key={item.id}
                      value={item.id}
                      className="relative flex min-h-11 cursor-pointer select-none items-center gap-3 rounded-xl pl-9 pr-3 text-sm text-gray-700 outline-none data-[highlighted]:bg-gray-100 data-[state=checked]:font-semibold data-[state=checked]:text-gray-900 dark:text-gray-300 dark:data-[highlighted]:bg-gray-700/60 dark:data-[state=checked]:text-white"
                    >
                      <Select.ItemIndicator className="absolute left-3 text-green-600 dark:text-green-400">
                        <Check size={15} aria-hidden="true" />
                      </Select.ItemIndicator>
                      <Select.ItemText>{item.label}</Select.ItemText>
                      <span className="ml-auto pl-4 tabular-nums text-gray-400 dark:text-gray-500">
                        {countOf(item.id)}
                      </span>
                    </Select.Item>
                  ))}
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        )}

        {categories.length > 1 && (
          <div
            role="group"
            aria-label="Filter demos by category"
            className="hidden flex-wrap gap-2 lg:flex"
          >
            {filters.map((item) => {
              const active = category === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => pickCategory(item.id)}
                  className={`min-h-10 rounded-full border px-4 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-500/20 ${
                    active
                      ? 'border-gray-900 bg-gray-900 text-white dark:border-white dark:bg-white dark:text-gray-900'
                      : 'border-gray-300 bg-white/60 text-gray-700 hover:border-gray-400 dark:border-gray-600 dark:bg-gray-800/60 dark:text-gray-300'
                  }`}
                >
                  {item.label}{' '}
                  <span
                    className={`ml-0.5 tabular-nums ${active ? 'opacity-60' : 'text-gray-400 dark:text-gray-500'}`}
                  >
                    {countOf(item.id)}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <div
          role="group"
          aria-label="Show as"
          className="ml-auto flex shrink-0 rounded-full border border-gray-300 bg-white/60 p-1 dark:border-gray-600 dark:bg-gray-800/60"
        >
          {(
            [
              { id: 'grid', label: 'Grid', icon: LayoutGrid },
              { id: 'list', label: 'List', icon: List },
            ] as const
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              aria-pressed={layout === id}
              onClick={() => chooseLayout(id)}
              className={`inline-flex min-h-9 items-center gap-1.5 rounded-full px-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-500/20 sm:px-3.5 ${
                layout === id
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              <Icon size={15} aria-hidden="true" />
              <span className="sr-only sm:not-sr-only">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {carousel ? (
        <CardCarousel
          label="Live demos"
          className="-mx-6 flex snap-x snap-mandatory scroll-px-6 gap-4 overflow-x-auto px-6 pb-4 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:p-0 lg:grid-cols-3"
          itemClassName="w-[85%] shrink-0 snap-start sm:w-auto"
          dotsClassName="sm:hidden"
        >
          {cards}
        </CardCarousel>
      ) : (
        <ul
          className={
            layout === 'grid'
              ? 'grid gap-5 sm:grid-cols-2 lg:grid-cols-3'
              : 'space-y-4'
          }
        >
          {cards.map((card) => (
            <li key={card.key}>{card}</li>
          ))}
        </ul>
      )}

      {hidden > 0 && (
        <div className="mt-10 flex justify-center">
          {limit && seeAllHref ? (
            <Link href={seeAllHref} className={`${SECONDARY} px-6`}>
              See all {items.length} demos
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setShown((count) => count + PAGE_SIZE)}
              className={`${SECONDARY} px-6`}
            >
              Load more
              <span className="text-gray-400">({hidden})</span>
            </button>
          )}
        </div>
      )}

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
