'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { Reveal } from '@components/Templates/motion';
import { HARVEST, PRODUCTS } from './data';
import { useOrder } from './Order';
import ProductCard from './ProductCard';
import { CONTAINER, DISPLAY, HEADING, SectionIcon, TEXT } from './ui';

const TABS = [
  { id: 'all', name: 'All' },
  ...HARVEST.map((group) => ({ id: group.id, name: group.name })),
  { id: 'saved', name: 'Saved' },
];

export default function Shop() {
  const { saved } = useOrder();
  const [tab, setTab] = useState('all');
  const [query, setQuery] = useState('');

  useEffect(() => {
    const onPick = (event: Event) =>
      setTab((event as CustomEvent<string>).detail);
    window.addEventListener('petik:category', onPick);
    return () => window.removeEventListener('petik:category', onPick);
  }, []);

  const q = query.trim().toLowerCase();
  const shown = (
    tab === 'all'
      ? PRODUCTS
      : tab === 'saved'
        ? PRODUCTS.filter((product) => saved.includes(product.id))
        : (HARVEST.find((group) => group.id === tab)?.products ?? [])
  ).filter(
    (product) =>
      !q || `${product.name} ${product.farm}`.toLowerCase().includes(q)
  );

  return (
    <section id="shop" className="scroll-mt-28 bg-tpl-surface py-20 md:py-28">
      <div className={CONTAINER}>
        <Reveal className="text-center">
          <SectionIcon name="mangosteen" className="mx-auto" />
          <h2 className={`${HEADING} mt-4`}>Our Categories</h2>
          <p className={`${TEXT} mx-auto mt-4 max-w-[52ch]`}>
            Everything on today&apos;s list, with the farm it came from. Order
            by 10 pm for delivery the next day.
          </p>
        </Reveal>

        <div className="mt-10 flex flex-col items-center gap-6">
          <div
            role="tablist"
            aria-label="Categories"
            className="flex max-w-full gap-6 overflow-x-auto border-b border-neutral-200 px-2 [scrollbar-width:none] sm:gap-10"
          >
            {TABS.map((item) => {
              const on = item.id === tab;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => setTab(item.id)}
                  className={`${DISPLAY} relative shrink-0 pb-4 text-[14px] font-medium uppercase tracking-[0.5px] transition-colors ${
                    on
                      ? 'text-tpl-accent'
                      : 'text-tpl-ink hover:text-tpl-accent'
                  }`}
                >
                  {item.name}
                  {item.id === 'saved' &&
                    saved.length > 0 &&
                    ` (${saved.length})`}
                  <span
                    className={`absolute inset-x-0 -bottom-px h-0.5 bg-tpl-accent transition-transform duration-300 ${
                      on ? 'scale-x-100' : 'scale-x-0'
                    }`}
                  />
                </button>
              );
            })}
          </div>
          <label className="flex h-12 w-full max-w-sm items-center gap-3 rounded-full bg-white px-5 shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
            <Search size={18} aria-hidden="true" className="text-tpl-muted" />
            <span className="sr-only">Search the shop</span>
            <input
              id="petik-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search fruit, vegetables, farms"
              className="h-full min-w-0 flex-1 bg-transparent text-[14px] text-tpl-ink outline-none placeholder:text-tpl-muted"
            />
          </label>
        </div>

        {shown.length ? (
          <ul className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {shown.map((product) => (
              <li key={product.id} className="petik-pop">
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        ) : (
          <p className={`${TEXT} mt-12 text-center`}>
            {tab === 'saved' && !q
              ? 'Tap the heart on a product to save it here.'
              : 'Nothing matches that search today.'}
          </p>
        )}
      </div>
    </section>
  );
}
