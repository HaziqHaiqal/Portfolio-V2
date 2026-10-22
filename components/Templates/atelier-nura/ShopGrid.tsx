'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import ProductCard from './ProductCard';
import { CATEGORIES, PRODUCTS, type Category } from './data';

const SORTS = {
  featured: 'Featured',
  new: 'Newest',
  low: 'Price, low to high',
  high: 'Price, high to low',
} as const;
type Sort = keyof typeof SORTS;

export default function ShopGrid({
  initialCategory,
}: {
  initialCategory?: Category;
}) {
  const [category, setCategory] = useState<Category | null>(
    initialCategory ?? null
  );
  const [sort, setSort] = useState<Sort>('featured');

  const filtered = category
    ? PRODUCTS.filter((product) => product.category === category)
    : PRODUCTS;
  const visible = [...filtered].sort((a, b) => {
    if (sort === 'low') return a.price - b.price;
    if (sort === 'high') return b.price - a.price;
    if (sort === 'new')
      return Number(Boolean(b.isNew)) - Number(Boolean(a.isNew));
    return 0;
  });

  return (
    <>
      <div className="flex flex-col gap-4 border-b border-tpl-line pb-4 md:flex-row md:items-center md:justify-between">
        <div
          role="group"
          aria-label="Filter by category"
          className="-mx-4 flex gap-6 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:px-0"
        >
          {[null, ...CATEGORIES].map((item) => {
            const count = item
              ? PRODUCTS.filter((product) => product.category === item).length
              : PRODUCTS.length;
            const selected = category === item;
            return (
              <button
                key={item ?? 'all'}
                type="button"
                aria-pressed={selected}
                onClick={() => setCategory(item)}
                className={`shrink-0 border-b-2 pb-1 text-sm transition-colors ${
                  selected
                    ? 'border-tpl-ink font-medium'
                    : 'border-transparent text-tpl-muted hover:text-tpl-ink'
                }`}
              >
                {item ?? 'All'}
                <span className="ml-1 text-xs text-tpl-muted">{count}</span>
              </button>
            );
          })}
        </div>
        <label className="relative flex items-center gap-2 text-sm text-tpl-muted">
          Sort
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as Sort)}
            className="h-10 appearance-none border border-tpl-line bg-tpl-bg pl-3 pr-9 text-sm text-tpl-ink outline-none focus:border-tpl-ink"
          >
            {Object.entries(SORTS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            aria-hidden="true"
            className="pointer-events-none absolute right-3"
          />
        </label>
      </div>
      <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-10 md:gap-x-5 lg:grid-cols-4">
        {visible.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            priority={index < 4}
          />
        ))}
      </div>
    </>
  );
}
