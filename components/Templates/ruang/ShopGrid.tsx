'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { ChevronDown, Heart, SlidersHorizontal, X } from 'lucide-react';
import {
  BASE_PATH,
  CATEGORIES,
  lineKey,
  PRODUCTS,
  variantsOf,
  type CategoryId,
  type Product,
} from './data';
import { availableFrom, useHydrated, useStore } from './store';
import ProductCard from './ProductCard';
import { BUTTON_DARK, CONTAINER } from './ui';

const SORTS = [
  { id: 'popular', label: 'Most popular' },
  { id: 'rating', label: 'Top rated' },
  { id: 'price-asc', label: 'Price, low to high' },
  { id: 'price-desc', label: 'Price, high to low' },
] as const;

const PRICES = [
  { id: 'all', label: 'Any price', test: () => true },
  { id: 'under-60', label: 'Under RM60', test: (p: number) => p < 60 },
  {
    id: '60-150',
    label: 'RM60 to RM150',
    test: (p: number) => p >= 60 && p <= 150,
  },
  { id: 'over-150', label: 'Over RM150', test: (p: number) => p > 150 },
] as const;

type SortId = (typeof SORTS)[number]['id'];
type PriceId = (typeof PRICES)[number]['id'];

export interface ShopFilters {
  category: CategoryId | null;
  query: string;
  saleOnly: boolean;
  savedOnly: boolean;
}

function Toggle({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  children: ReactNode;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 py-1.5 text-sm">
      {children}
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className="relative h-6 w-10 shrink-0 rounded-full bg-tpl-line transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:bg-tpl-ink peer-checked:after:translate-x-4 peer-focus-visible:ring-4 peer-focus-visible:ring-tpl-ink/15"
      />
    </label>
  );
}

export default function ShopGrid({ initial }: { initial: ShopFilters }) {
  const hydrated = useHydrated();
  const sold = useStore((state) => state.sold);
  const saved = useStore((state) => state.saved);
  const [filters, setFilters] = useState(initial);
  const [price, setPrice] = useState<PriceId>('all');
  const [inStock, setInStock] = useState(false);
  const [sort, setSort] = useState<SortId>('popular');
  const [panelOpen, setPanelOpen] = useState(false);

  const update = (patch: Partial<ShopFilters>) => {
    const next = { ...filters, ...patch };
    setFilters(next);
    const params = new URLSearchParams();
    if (next.category) params.set('category', next.category);
    if (next.query) params.set('q', next.query);
    if (next.saleOnly) params.set('sale', '1');
    if (next.savedOnly) params.set('saved', '1');
    const search = params.toString();
    window.history.replaceState(
      window.history.state,
      '',
      `${BASE_PATH}/shop${search ? `?${search}` : ''}`
    );
  };

  const stockOf = (product: Product) =>
    variantsOf(product).reduce(
      (sum, values) => sum + availableFrom(sold, lineKey(product.slug, values)),
      0
    );
  const priceTest =
    PRICES.find((item) => item.id === price)?.test ?? (() => true);
  const query = filters.query.trim().toLowerCase();

  const matches = (product: Product, ignoreCategory = false) =>
    (ignoreCategory ||
      !filters.category ||
      product.category === filters.category) &&
    (!query ||
      `${product.name} ${product.blurb} ${product.category}`
        .toLowerCase()
        .includes(query)) &&
    (!filters.saleOnly || Boolean(product.compareAt)) &&
    (!filters.savedOnly || (hydrated && saved.includes(product.slug))) &&
    priceTest(product.price) &&
    (!inStock || !hydrated || stockOf(product) > 0);

  const products = PRODUCTS.filter((product) => matches(product)).toSorted(
    (a, b) =>
      sort === 'price-asc'
        ? a.price - b.price
        : sort === 'price-desc'
          ? b.price - a.price
          : sort === 'rating'
            ? b.rating - a.rating
            : b.reviews - a.reviews
  );

  const categoryLabel = CATEGORIES.find(
    (item) => item.id === filters.category
  )?.label;
  const title = filters.savedOnly
    ? 'Your Wishlist'
    : query
      ? `Results for "${filters.query.trim()}"`
      : filters.saleOnly
        ? 'Sale'
        : (categoryLabel ?? 'Shop All');

  const chips = [
    ...(categoryLabel
      ? [{ label: categoryLabel, clear: () => update({ category: null }) }]
      : []),
    ...(query
      ? [
          {
            label: `"${filters.query.trim()}"`,
            clear: () => update({ query: '' }),
          },
        ]
      : []),
    ...(filters.saleOnly
      ? [{ label: 'On sale', clear: () => update({ saleOnly: false }) }]
      : []),
    ...(filters.savedOnly
      ? [{ label: 'Saved', clear: () => update({ savedOnly: false }) }]
      : []),
    ...(price !== 'all'
      ? [
          {
            label: PRICES.find((item) => item.id === price)!.label,
            clear: () => setPrice('all'),
          },
        ]
      : []),
    ...(inStock ? [{ label: 'In stock', clear: () => setInStock(false) }] : []),
  ];

  const clearAll = () => {
    update({ category: null, query: '', saleOnly: false, savedOnly: false });
    setPrice('all');
    setInStock(false);
  };

  const panel = (
    <div className="space-y-7">
      <div>
        <p className="text-sm font-semibold">Category</p>
        <ul className="mt-3 space-y-1">
          {[{ id: null, label: 'All products' }, ...CATEGORIES].map((item) => {
            const active = filters.category === item.id;
            const count = PRODUCTS.filter(
              (product) =>
                (!item.id || product.category === item.id) &&
                matches(product, true)
            ).length;
            return (
              <li key={item.label}>
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => update({ category: item.id })}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-colors ${
                    active ? 'bg-tpl-ink text-tpl-surface' : 'hover:bg-tpl-tint'
                  }`}
                >
                  {item.label}
                  <span className={active ? 'opacity-70' : 'text-tpl-muted'}>
                    {count}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      <fieldset>
        <legend className="text-sm font-semibold">Price</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {PRICES.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={price === item.id}
              onClick={() => setPrice(item.id)}
              className={`h-9 rounded-full border px-3.5 text-sm transition-colors ${
                price === item.id
                  ? 'border-tpl-ink bg-tpl-ink text-tpl-surface'
                  : 'border-tpl-line hover:border-tpl-ink/40'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </fieldset>
      <div>
        <p className="text-sm font-semibold">Show</p>
        <div className="mt-2">
          <Toggle
            checked={filters.saleOnly}
            onChange={(value) => update({ saleOnly: value })}
          >
            On sale only
          </Toggle>
          <Toggle checked={inStock} onChange={setInStock}>
            In stock only
          </Toggle>
          <Toggle
            checked={filters.savedOnly}
            onChange={(value) => update({ savedOnly: value })}
          >
            Saved to wishlist
          </Toggle>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`${CONTAINER} pt-6`}>
      <nav aria-label="Breadcrumb" className="text-sm text-tpl-muted">
        <Link href={BASE_PATH} className="hover:text-tpl-ink">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-tpl-ink">Shop</span>
      </nav>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-[clamp(2rem,4vw,3.2rem)] font-semibold tracking-[-0.035em]">
          {title}
        </h1>
        <p className="text-sm text-tpl-muted">
          {products.length} {products.length === 1 ? 'product' : 'products'}
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[16.5rem_minmax(0,1fr)]">
        <aside className="hidden self-start rounded-[24px] bg-tpl-surface p-5 lg:sticky lg:top-36 lg:block">
          {panel}
        </aside>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setPanelOpen((value) => !value)}
              aria-expanded={panelOpen}
              className="flex h-10 items-center gap-2 rounded-full bg-tpl-surface px-4 text-sm font-medium lg:hidden"
            >
              <SlidersHorizontal size={16} aria-hidden="true" />
              Filters
            </button>
            {chips.map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={chip.clear}
                aria-label={`Remove filter ${chip.label}`}
                className="flex h-10 items-center gap-1.5 rounded-full bg-tpl-ink px-4 text-sm text-tpl-surface"
              >
                {chip.label}
                <X size={14} aria-hidden="true" />
              </button>
            ))}
            {chips.length > 1 && (
              <button
                type="button"
                onClick={clearAll}
                className="h-10 px-2 text-sm font-medium underline underline-offset-4"
              >
                Clear all
              </button>
            )}
            <label className="relative ml-auto flex items-center">
              <span className="sr-only">Sort by</span>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value as SortId)}
                className="h-10 appearance-none rounded-full bg-tpl-surface pl-4 pr-10 text-sm font-medium outline-none"
              >
                {SORTS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={15}
                aria-hidden="true"
                className="pointer-events-none absolute right-4"
              />
            </label>
          </div>

          {panelOpen && (
            <div className="mt-3 rounded-[24px] bg-tpl-surface p-5 lg:hidden">
              {panel}
            </div>
          )}

          {products.length ? (
            <ul className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3">
              {products.map((product, index) => (
                <li key={product.slug}>
                  <ProductCard product={product} priority={index < 3} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-5 flex flex-col items-center gap-4 rounded-[24px] bg-tpl-surface px-6 py-20 text-center">
              {filters.savedOnly ? (
                <>
                  <Heart size={30} aria-hidden="true" />
                  <p className="max-w-sm text-tpl-muted">
                    Nothing saved yet. Tap the heart on any product to keep it
                    here.
                  </p>
                </>
              ) : (
                <p className="max-w-sm text-tpl-muted">
                  No products match these filters.
                </p>
              )}
              <button type="button" onClick={clearAll} className={BUTTON_DARK}>
                Show all products
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
