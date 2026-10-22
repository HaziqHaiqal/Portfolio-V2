'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Plus, Star, X } from 'lucide-react';
import Photo from '@components/Templates/Photo';
import { QtyStepper, rm, useBag } from '@components/Templates/Bag';
import { FILTERS, PRODUCTS, type Filter, type Product } from './data';

export function Rating({
  rating,
  reviews,
  size = 13,
}: {
  rating: number;
  reviews?: number;
  size?: number;
}) {
  return (
    <span className="flex items-center gap-1 text-xs text-tpl-muted">
      <Star
        size={size}
        aria-hidden="true"
        className="fill-tpl-accent text-tpl-accent"
      />
      <span className="font-semibold text-tpl-ink">{rating}</span>
      {reviews !== undefined && <span>({reviews})</span>}
    </span>
  );
}

function QuickView({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const { add } = useBag();
  const [qty, setQty] = useState(1);

  useEffect(() => {
    ref.current?.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(event) => event.target === ref.current && ref.current.close()}
      aria-labelledby="sg-quick-title"
      data-lenis-prevent
      className="m-0 mt-auto max-h-[92dvh] w-full max-w-none animate-[tpl-rise_300ms_ease-out] overflow-y-auto rounded-t-[2rem] bg-tpl-bg p-0 text-tpl-ink backdrop:bg-black/50 backdrop:backdrop-blur-sm md:m-auto md:max-w-4xl md:rounded-[2rem]"
    >
      <div className="grid md:grid-cols-2">
        <div className="relative aspect-square bg-tpl-tint md:aspect-auto">
          <Photo
            src={product.image}
            alt={product.name}
            fill
            sizes="(min-width: 768px) 448px, 100vw"
            className="object-cover"
          />
        </div>
        <div className="flex flex-col p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              {product.badge && (
                <span className="mb-3 inline-block rounded-full bg-tpl-tint px-2.5 py-1 text-xs font-semibold text-tpl-accent">
                  {product.badge}
                </span>
              )}
              <h3
                id="sg-quick-title"
                className="text-2xl font-semibold tracking-tight"
              >
                {product.name}
              </h3>
              <div className="mt-2">
                <Rating rating={product.rating} reviews={product.reviews} />
              </div>
            </div>
            <button
              type="button"
              onClick={() => ref.current?.close()}
              aria-label="Close"
              className="-mr-2 -mt-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-tpl-tint"
            >
              <X size={20} />
            </button>
          </div>

          <p className="mt-5 text-2xl font-semibold">
            {rm(product.price)}
            <span className="ml-2 text-sm font-normal text-tpl-muted">
              {product.size}
            </span>
          </p>
          <p className="mt-4 leading-relaxed text-tpl-muted">
            {product.description}
          </p>

          <p className="mt-6 text-sm font-semibold">Key ingredients</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {product.ingredients.map((item) => (
              <li
                key={item}
                className="rounded-full border border-tpl-line px-3 py-1.5 text-xs font-medium"
              >
                {item}
              </li>
            ))}
          </ul>

          <details className="group mt-6 border-y border-tpl-line">
            <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between text-sm font-semibold [&::-webkit-details-marker]:hidden">
              How to use
              <ChevronDown
                size={18}
                aria-hidden="true"
                className="transition-transform group-open:rotate-180"
              />
            </summary>
            <p className="pb-4 text-sm leading-relaxed text-tpl-muted">
              {product.howTo}
            </p>
          </details>

          <div className="mt-auto flex gap-3 pt-6">
            <QtyStepper
              qty={qty}
              min={1}
              name={product.name}
              onChange={(delta) =>
                setQty((value) => Math.max(1, value + delta))
              }
            />
            <button
              type="button"
              onClick={() => {
                add(product, undefined, qty);
                ref.current?.close();
              }}
              className="h-10 flex-1 rounded-full bg-tpl-accent text-sm font-semibold text-tpl-on-accent transition-opacity hover:opacity-90"
            >
              Add to bag, {rm(product.price * qty)}
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}

export default function Shop() {
  const { add } = useBag();
  const [filter, setFilter] = useState<Filter | null>(null);
  const [viewing, setViewing] = useState<Product | null>(null);
  const visible = filter
    ? PRODUCTS.filter((product) => product.tags.includes(filter))
    : PRODUCTS;

  return (
    <>
      <div
        role="group"
        aria-label="Filter products"
        className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] md:mx-0 md:px-0"
      >
        {[null, ...FILTERS].map((item) => {
          const selected = filter === item;
          return (
            <button
              key={item ?? 'all'}
              type="button"
              aria-pressed={selected}
              onClick={() => setFilter(item)}
              className={`h-10 shrink-0 rounded-full px-4 text-sm font-medium transition-colors ${
                selected
                  ? 'bg-tpl-ink text-tpl-bg'
                  : 'bg-tpl-tint text-tpl-ink hover:bg-tpl-line'
              }`}
            >
              {item ?? 'All'}
            </button>
          );
        })}
      </div>

      <ul className="mt-8 grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 lg:grid-cols-3">
        {visible.map((product) => (
          <li key={product.id} className="group">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-tpl-tint">
              <button
                type="button"
                onClick={() => setViewing(product)}
                aria-label={`Quick view ${product.name}`}
                className="absolute inset-0"
              >
                <Photo
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(min-width: 1024px) 400px, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
              </button>
              {product.badge && (
                <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-tpl-bg/90 px-2.5 py-1 text-xs font-semibold backdrop-blur">
                  {product.badge}
                </span>
              )}
              <button
                type="button"
                onClick={() => add(product)}
                aria-label={`Add ${product.name} to bag`}
                className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-tpl-bg text-tpl-ink shadow-lg transition-all hover:scale-105 md:bottom-4 md:left-4 md:right-4 md:h-11 md:w-auto md:translate-y-3 md:gap-2 md:opacity-0 md:focus-visible:translate-y-0 md:focus-visible:opacity-100 md:group-hover:translate-y-0 md:group-hover:opacity-100"
              >
                <Plus size={18} aria-hidden="true" />
                <span className="hidden text-sm font-semibold md:inline">
                  Quick add
                </span>
              </button>
            </div>
            <div className="mt-3 px-1">
              <Rating rating={product.rating} reviews={product.reviews} />
              <div className="mt-1.5 flex items-start justify-between gap-3">
                <h3 className="font-semibold leading-snug">{product.name}</h3>
                <p className="font-semibold tabular-nums">
                  {rm(product.price)}
                </p>
              </div>
              <p className="mt-1 text-sm leading-snug text-tpl-muted">
                {product.benefit}
              </p>
            </div>
          </li>
        ))}
      </ul>

      {viewing && (
        <QuickView
          key={viewing.id}
          product={viewing}
          onClose={() => setViewing(null)}
        />
      )}
    </>
  );
}
