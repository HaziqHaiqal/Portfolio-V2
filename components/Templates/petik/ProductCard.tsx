'use client';

import Image from 'next/image';
import { Heart, Minus, Plus } from 'lucide-react';
import { PICTURES, rm, type Product } from './data';
import { useOrder } from './Order';
import Pic from './Pic';
import { DISPLAY } from './ui';

export function AddButton({ product }: { product: Product }) {
  const { qty, change } = useOrder();
  const count = qty[product.id] ?? 0;
  if (!count)
    return (
      <button
        type="button"
        onClick={() => change(product.id, 1)}
        className={`${DISPLAY} inline-flex h-10 items-center gap-1.5 rounded-full bg-tpl-accent px-5 text-[13px] font-medium uppercase tracking-[1px] text-tpl-on-accent transition-[filter,transform] hover:brightness-95 active:scale-95`}
      >
        <Plus size={15} aria-hidden="true" />
        Add
        <span className="sr-only"> {product.name}</span>
      </button>
    );
  return (
    <div className="inline-flex h-10 items-center rounded-full bg-tpl-accent text-tpl-on-accent">
      <button
        type="button"
        onClick={() => change(product.id, -1)}
        aria-label={`One less ${product.name}`}
        className="flex h-10 w-10 items-center justify-center rounded-full active:scale-90"
      >
        <Minus size={15} aria-hidden="true" />
      </button>
      <span
        aria-live="polite"
        className="w-6 text-center text-[14px] font-semibold tabular-nums"
      >
        {count}
      </span>
      <button
        type="button"
        onClick={() => change(product.id, 1)}
        aria-label={`One more ${product.name}`}
        className="flex h-10 w-10 items-center justify-center rounded-full active:scale-90"
      >
        <Plus size={15} aria-hidden="true" />
      </button>
    </div>
  );
}

export function SaveButton({ product }: { product: Product }) {
  const { saved, toggleSaved } = useOrder();
  const on = saved.includes(product.id);
  return (
    <button
      type="button"
      onClick={() => toggleSaved(product.id)}
      aria-pressed={on}
      aria-label={
        on ? `Remove ${product.name} from saved` : `Save ${product.name}`
      }
      className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-tpl-ink shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-transform active:scale-90"
    >
      <Heart
        size={16}
        aria-hidden="true"
        className={on ? 'fill-[#EF8829] text-[#EF8829]' : ''}
      />
    </button>
  );
}

export const priceLabel = (product: Product) =>
  `${rm(product.price)} / ${product.unit}`;

/** The shop card: the produce cut out on a pale tile, its name, price and Add. */
export default function ProductCard({ product }: { product: Product }) {
  const off = product.was
    ? Math.round((1 - product.price / product.was) * 100)
    : 0;
  return (
    <article className="group flex h-full flex-col rounded-[10px] bg-tpl-surface p-4 text-center transition-shadow duration-300 hover:shadow-[0_0_10px_rgba(0,0,0,0.12)] sm:p-5">
      <div className="relative">
        {off > 0 && (
          <span className="absolute left-0 top-0 z-10 rounded-full bg-[#EF8829] px-2.5 py-0.5 text-[12px] font-semibold text-white">
            -{off}%
          </span>
        )}
        <span className="absolute right-0 top-0 z-10">
          <SaveButton product={product} />
        </span>
        <div className="relative mx-auto h-36 w-full sm:h-44">
          {product.cut ? (
            <Image
              src={product.cut}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 240px, 45vw"
              className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <Pic
              picture={PICTURES[product.picture]}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 240px, 45vw"
              className="rounded-lg object-cover"
            />
          )}
        </div>
      </div>
      <h3
        className={`${DISPLAY} mt-4 text-[15px] font-medium uppercase tracking-[0.5px] text-tpl-ink sm:text-[16px]`}
      >
        {product.name}
      </h3>
      <p className="mt-1 text-[13px] text-tpl-muted">{product.farm}</p>
      <p className="mt-2 text-[14px] tabular-nums text-tpl-ink">
        {product.was && (
          <s className="mr-1.5 text-tpl-muted">{rm(product.was)}</s>
        )}
        <span className="font-semibold">{rm(product.price)}</span>
        <span className="text-tpl-muted"> / {product.unit}</span>
      </p>
      <div className="mt-auto pt-4">
        <AddButton product={product} />
      </div>
    </article>
  );
}
