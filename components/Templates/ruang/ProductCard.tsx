'use client';

import Link from 'next/link';
import { ArrowUpRight, Check, ShoppingBag } from 'lucide-react';
import Photo from '@components/Templates/Photo';
import { rm } from '@components/Templates/Bag';
import { BASE_PATH, lineKey, MAKERS, variantsOf, type Product } from './data';
import { availableFrom, useHydrated, useStore } from './store';
import { HeartButton, percentOff } from './ui';

const LOW_STOCK = 5;

/** Units left across every variant, once the browser's stock is loaded. */
export function useProductStock(product: Product) {
  const hydrated = useHydrated();
  const sold = useStore((state) => state.sold);
  if (!hydrated) return null;
  return variantsOf(product).reduce(
    (sum, values) => sum + availableFrom(sold, lineKey(product.slug, values)),
    0
  );
}

export function Price({
  price,
  compareAt,
  className = '',
}: {
  price: number;
  compareAt?: number;
  className?: string;
}) {
  return (
    <span className={`flex items-baseline gap-2 tabular-nums ${className}`}>
      <span className="font-semibold">{rm(price)}</span>
      {compareAt && (
        <s className="text-sm text-tpl-muted">
          <span className="sr-only">Was </span>
          {rm(compareAt)}
        </s>
      )}
    </span>
  );
}

export function Badge({ product }: { product: Product }) {
  const off = percentOff(product.price, product.compareAt);
  if (off)
    return (
      <span className="rounded-full bg-tpl-accent px-2.5 py-1 text-[11px] font-semibold text-tpl-on-accent">
        -{off}%
      </span>
    );
  if (!product.tag) return null;
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
        product.tag === 'New'
          ? 'bg-tpl-ink text-tpl-surface'
          : 'bg-tpl-surface text-tpl-ink'
      }`}
    >
      {product.tag}
    </span>
  );
}

export default function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  const stock = useProductStock(product);
  const addToCart = useStore((state) => state.addToCart);
  const justAdded = useStore(
    (state) => state.added?.slug === product.slug && !product.options.length
  );
  const href = `${BASE_PATH}/product/${product.slug}`;
  const swatches = product.options.find((option) =>
    option.values.some((value) => value.swatch)
  );
  const choices = product.options.reduce(
    (sum, option) => sum * option.values.length,
    1
  );
  const soldOut = stock === 0;

  return (
    <article className="group relative flex h-full flex-col rounded-[22px] bg-tpl-surface p-2 transition-shadow duration-300 hover:shadow-[0_18px_40px_-24px_rgba(0,0,0,0.35)]">
      <div className="relative">
        <Link
          href={href}
          className="relative block aspect-[4/5] overflow-hidden rounded-[16px] bg-tpl-tint"
        >
          <Photo
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 22vw, 50vw"
            loading={priority ? 'eager' : undefined}
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
          {product.images[1] && (
            <Photo
              src={product.images[1]}
              alt=""
              fill
              sizes="(min-width: 1024px) 22vw, 50vw"
              className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
          )}
          {stock !== null && stock <= LOW_STOCK && (
            <span
              className={`absolute bottom-2.5 left-2.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                soldOut
                  ? 'bg-tpl-ink text-tpl-surface'
                  : 'bg-orange-500 text-white'
              }`}
            >
              {soldOut ? 'Sold out' : `Only ${stock} left`}
            </span>
          )}
        </Link>
        <span className="absolute left-2.5 top-2.5 flex gap-1.5">
          <Badge product={product} />
          {product.model && (
            <span className="rounded-full bg-tpl-surface px-2.5 py-1 text-[11px] font-semibold text-tpl-ink">
              3D
            </span>
          )}
        </span>
        <HeartButton
          slug={product.slug}
          name={product.name}
          className="absolute right-2.5 top-2.5"
        />
      </div>

      <div className="flex flex-1 flex-col px-2 pb-1.5 pt-3">
        <h3 className="truncate text-[15px] font-medium leading-snug">
          <Link href={href} className="hover:underline">
            {product.name}
          </Link>
        </h3>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-tpl-muted">
          <span className="flex shrink-0 items-center gap-0.5">
            <span className="text-amber-500">★</span>
            {product.rating} ({product.reviews})
          </span>
          <span aria-hidden="true">|</span>
          <span className="truncate">{MAKERS[product.category]}</span>
        </p>
        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <div className="min-w-0">
            {swatches ? (
              <span className="mb-1.5 flex items-center gap-1">
                {swatches.values.map((value) => (
                  <span
                    key={value.label}
                    title={value.label}
                    style={{ background: value.swatch }}
                    className="h-3.5 w-3.5 rounded-full ring-1 ring-inset ring-black/10"
                  />
                ))}
              </span>
            ) : (
              choices > 1 && (
                <span className="mb-1 block text-xs text-tpl-muted">
                  {choices} options
                </span>
              )
            )}
            <Price
              price={product.price}
              compareAt={product.compareAt}
              className="flex-wrap gap-x-1.5 gap-y-0 text-[15px]"
            />
          </div>
          {product.options.length ? (
            <Link
              href={href}
              aria-label={`Choose options for ${product.name}`}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-tpl-accent text-tpl-on-accent transition-transform hover:scale-105"
            >
              <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
          ) : (
            <button
              type="button"
              disabled={soldOut || stock === null}
              onClick={() => addToCart(product.slug, [])}
              aria-label={`Add ${product.name} to bag`}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-tpl-accent text-tpl-on-accent transition-transform hover:scale-105 disabled:opacity-40"
            >
              {justAdded ? (
                <Check size={17} aria-hidden="true" />
              ) : (
                <ShoppingBag size={16} aria-hidden="true" />
              )}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
