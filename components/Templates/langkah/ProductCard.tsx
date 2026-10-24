'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Heart } from 'lucide-react';
import { BASE_PATH, colourway, COLOURWAYS, rm, type Product } from './data';
import { useHydrated, useStore } from './store';
import { swatchFill } from './Pickers';
import { Stars } from './ui';

export function Badge({ product }: { product: Product }) {
  const off = product.compareAt
    ? Math.round((1 - product.price / product.compareAt) * 100)
    : 0;
  if (off)
    return (
      <span className="rounded-full bg-tpl-accent px-2.5 py-1 text-[11px] font-bold text-tpl-on-accent">
        -{off}%
      </span>
    );
  if (!product.tag) return null;
  return (
    <span className="rounded-full bg-black px-2.5 py-1 text-[11px] font-bold text-white">
      {product.tag}
    </span>
  );
}

export function HeartButton({
  slug,
  name,
  className = '',
}: {
  slug: string;
  name: string;
  className?: string;
}) {
  const hydrated = useHydrated();
  const saved = useStore((state) => hydrated && state.saved.includes(slug));
  const toggle = useStore((state) => state.toggleSaved);
  return (
    <button
      type="button"
      onClick={() => toggle(slug)}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${name} from saved` : `Save ${name}`}
      className={`flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-black shadow-sm transition-transform active:scale-90 ${className}`}
    >
      <Heart
        size={17}
        aria-hidden="true"
        className={saved ? 'fill-red-500 text-red-500' : ''}
      />
    </button>
  );
}

/** A white product tile with a heart, badge, colour dots and a cart button. */
export default function ProductCard({
  product,
  startColour,
}: {
  product: Product;
  startColour?: string;
}) {
  const [colour, setColour] = useState(startColour ?? COLOURWAYS[0].id);
  const href = `${BASE_PATH}/product/${product.slug}?colour=${colour}`;

  return (
    <article className="group relative flex flex-col rounded-[28px] bg-white p-3 text-black shadow-sm transition-shadow hover:shadow-xl">
      <Link
        href={href}
        className="relative block aspect-[4/3] overflow-hidden rounded-[22px] bg-[#F2F2EF]"
      >
        <Image
          src={colourway(colour).image}
          alt={`${product.name}, ${colourway(colour).name}`}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-contain transition-transform duration-500 ease-out group-hover:scale-105"
        />
      </Link>
      <span className="absolute left-6 top-6">
        <Badge product={product} />
      </span>
      <HeartButton
        slug={product.slug}
        name={product.name}
        className="absolute right-6 top-6"
      />
      <div className="flex flex-1 flex-col px-2 pb-1 pt-4">
        <div className="flex items-baseline justify-between gap-3">
          <Link href={href} className="text-lg font-extrabold leading-tight">
            {product.name}
          </Link>
          <p className="flex items-baseline gap-1.5 font-extrabold tabular-nums">
            {product.compareAt && (
              <s className="text-xs font-semibold text-black/40">
                {rm(product.compareAt)}
              </s>
            )}
            {rm(product.price)}
          </p>
        </div>
        <p className="mt-0.5 text-sm text-black/55">{product.tagline}</p>
        <div className="mt-3 flex items-center gap-2 text-xs text-black/60">
          <Stars rating={product.rating} size={12} />
          <span className="tabular-nums">
            {product.rating} ({product.reviews.toLocaleString('en-MY')})
          </span>
        </div>
        <div className="mt-auto flex items-center justify-between pt-4">
          <div role="group" aria-label="Colourway" className="flex gap-1.5">
            {COLOURWAYS.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={colour === item.id}
                aria-label={item.name}
                title={item.name}
                onClick={() => setColour(item.id)}
                style={{ backgroundImage: swatchFill(item) }}
                className={`h-6 w-6 rounded-full ring-offset-2 transition-transform hover:scale-110 ${
                  colour === item.id
                    ? 'ring-2 ring-black'
                    : 'ring-1 ring-black/15'
                }`}
              />
            ))}
          </div>
          <Link
            href={href}
            aria-label={`Choose a size for ${product.name}`}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-tpl-accent text-tpl-on-accent transition-transform group-hover:rotate-45"
          >
            <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
