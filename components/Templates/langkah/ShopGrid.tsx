'use client';

import { useEffect, useState } from 'react';
import { COLOURWAYS, PRODUCTS } from './data';
import ProductCard from './ProductCard';
import { useHydrated, useStore } from './store';
import { swatchFill } from './Pickers';
import { CONTAINER, DISPLAY } from './ui';

const SORTS = [
  { id: 'popular', label: 'Most popular' },
  { id: 'low', label: 'Price: low to high' },
  { id: 'high', label: 'Price: high to low' },
] as const;

export default function ShopGrid() {
  const hydrated = useHydrated();
  const saved = useStore((state) => state.saved);
  const [colour, setColour] = useState<string>('all');
  const [sort, setSort] = useState<(typeof SORTS)[number]['id']>('popular');
  const [savedOnly, setSavedOnly] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const frame = requestAnimationFrame(() => {
      setSavedOnly(params.get('saved') === '1');
      const wanted = params.get('colour');
      if (wanted && COLOURWAYS.some((item) => item.id === wanted))
        setColour(wanted);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const products = [...PRODUCTS]
    .filter(
      (product) => !savedOnly || (hydrated && saved.includes(product.slug))
    )
    .sort((a, b) =>
      sort === 'low'
        ? a.price - b.price
        : sort === 'high'
          ? b.price - a.price
          : b.reviews - a.reviews
    );
  const colours =
    colour === 'all'
      ? COLOURWAYS
      : COLOURWAYS.filter((item) => item.id === colour);
  // Each row mixes the colours, so no row is the same shoe three times.
  const cards = colours.flatMap((_, round) =>
    products.map((product, index) => ({
      product,
      colour: colours[(round + index) % colours.length].id,
    }))
  );

  const chip = (active: boolean) =>
    `min-h-10 rounded-full px-4 text-sm font-semibold transition-colors ${
      active
        ? 'bg-tpl-ink text-tpl-bg'
        : 'bg-tpl-surface text-tpl-muted hover:text-tpl-ink'
    }`;

  return (
    <div className={`${CONTAINER} pb-24 pt-10`}>
      <h1 className={`${DISPLAY} text-[clamp(2.8rem,8vw,6rem)] leading-[0.9]`}>
        {savedOnly ? 'Saved' : 'Shop'}
      </h1>
      <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div
          role="group"
          aria-label="Colourway"
          className="flex flex-wrap gap-2"
        >
          <button
            type="button"
            aria-pressed={colour === 'all'}
            onClick={() => setColour('all')}
            className={chip(colour === 'all')}
          >
            All colours
          </button>
          {COLOURWAYS.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={colour === item.id}
              onClick={() => setColour(item.id)}
              className={`${chip(colour === item.id)} inline-flex items-center gap-2`}
            >
              <span
                aria-hidden="true"
                className="h-3.5 w-3.5 rounded-full ring-1 ring-black/10"
                style={{ backgroundImage: swatchFill(item) }}
              />
              {item.name}
            </button>
          ))}
          <button
            type="button"
            aria-pressed={savedOnly}
            onClick={() => setSavedOnly(!savedOnly)}
            className={chip(savedOnly)}
          >
            Saved
          </button>
        </div>
        <label className="flex items-center gap-2 text-sm text-tpl-muted">
          Sort
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as typeof sort)}
            className="h-10 rounded-full border border-tpl-line bg-tpl-surface px-4 text-sm font-semibold text-tpl-ink"
          >
            {SORTS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {cards.length === 0 ? (
        <p className="mt-16 text-center text-tpl-muted">
          Nothing saved yet. Tap the heart on a shoe to keep it here.
        </p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map(({ product, colour: start }) => (
            <ProductCard
              key={`${product.slug}-${start}`}
              product={product}
              startColour={start}
            />
          ))}
        </div>
      )}
    </div>
  );
}
