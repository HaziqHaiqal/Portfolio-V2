'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { RotateCcw, Truck } from 'lucide-react';
import {
  BASE_PATH,
  colourway,
  COLOURWAYS,
  FREE_DELIVERY_AT,
  PRODUCTS,
  rm,
  type Product,
} from './data';
import { useStore } from './store';
import { ColourPicker, SizeGrid } from './Pickers';
import { Badge, HeartButton } from './ProductCard';
import { BUTTON_ACCENT, CONTAINER, DISPLAY, Stars } from './ui';

const ProductViewer = dynamic(() => import('./ProductViewer'), {
  ssr: false,
  loading: () => null,
});

export default function ProductDetail({ product }: { product: Product }) {
  const addToCart = useStore((state) => state.addToCart);
  const [colour, setColour] = useState<string>(COLOURWAYS[0].id);
  const [size, setSize] = useState<string | null>(null);

  // "?colour=" from a card opens the page on that colourway.
  useEffect(() => {
    const wanted = new URLSearchParams(window.location.search).get('colour');
    if (!wanted || !COLOURWAYS.some((item) => item.id === wanted)) return;
    const frame = requestAnimationFrame(() => setColour(wanted));
    return () => cancelAnimationFrame(frame);
  }, []);

  const others = PRODUCTS.filter((item) => item.slug !== product.slug);
  const chosen = colourway(colour);

  return (
    <div className={`${CONTAINER} pb-24 pt-6`}>
      <nav aria-label="Breadcrumb" className="text-sm text-tpl-muted">
        <Link href={BASE_PATH} className="hover:text-tpl-ink">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href={`${BASE_PATH}/shop`} className="hover:text-tpl-ink">
          Shop
        </Link>
        <span className="mx-2">/</span>
        <span className="text-tpl-ink">{product.name}</span>
      </nav>

      <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-10">
        <div className="self-start lg:sticky lg:top-[calc(var(--demo-bar)+5rem)]">
          <div
            className="relative aspect-square overflow-hidden rounded-[36px] transition-colors duration-500"
            style={{
              backgroundImage: `radial-gradient(circle at 50% 58%, color-mix(in srgb, ${chosen.swatch} 30%, rgb(var(--tpl-tint))) 0%, rgb(var(--tpl-surface)) 72%)`,
            }}
          >
            <Image
              src={chosen.image}
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-contain opacity-0"
            />
            <div className="absolute inset-0">
              <ProductViewer
                colourway={colour}
                label={`${product.name} in ${chosen.name}`}
              />
            </div>
            <span className="absolute left-5 top-5">
              <Badge product={product} />
            </span>
            <HeartButton
              slug={product.slug}
              name={product.name}
              className="absolute right-5 top-5"
            />
            <p className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-3 py-1.5 text-xs font-semibold text-white">
              Drag to turn
            </p>
          </div>
        </div>

        <div>
          <h1
            className={`${DISPLAY} text-[clamp(2.8rem,6vw,5rem)] leading-[0.9]`}
          >
            {product.name}
          </h1>
          <p className="mt-2 text-tpl-muted">{product.tagline}</p>
          <div className="mt-3 flex items-center gap-2 text-sm">
            <Stars rating={product.rating} />
            <span className="text-tpl-muted">
              {product.rating} · {product.reviews.toLocaleString('en-MY')}{' '}
              reviews
            </span>
          </div>
          <p className="mt-5 flex items-baseline gap-2 text-3xl font-extrabold tabular-nums">
            {rm(product.price)}
            {product.compareAt && (
              <s className="text-base font-semibold text-tpl-muted">
                {rm(product.compareAt)}
              </s>
            )}
          </p>
          <p className="mt-4 max-w-md leading-relaxed text-tpl-muted">
            {product.blurb}
          </p>

          <div className="mt-7">
            <p className="text-sm font-bold">
              Colour{' '}
              <span className="font-normal text-tpl-muted">
                {chosen.name}, {chosen.note.toLowerCase()}
              </span>
            </p>
            <div className="mt-3">
              <ColourPicker value={colour} onChange={setColour} />
            </div>
          </div>

          <div className="mt-7">
            <SizeGrid
              slug={product.slug}
              colour={colour}
              value={size}
              onChange={setSize}
            />
          </div>

          <button
            type="button"
            disabled={!size}
            onClick={() => size && addToCart(product.slug, colour, size)}
            className={`${BUTTON_ACCENT} mt-6 h-14 w-full text-base`}
          >
            {size ? `Add to bag · ${rm(product.price)}` : 'Choose a size'}
          </button>

          <ul className="mt-5 space-y-2 text-sm text-tpl-muted">
            <li className="flex items-center gap-2">
              <Truck size={16} aria-hidden="true" className="text-tpl-accent" />
              Free delivery over {rm(FREE_DELIVERY_AT)}, 2 to 4 working days
            </li>
            <li className="flex items-center gap-2">
              <RotateCcw
                size={16}
                aria-hidden="true"
                className="text-tpl-accent"
              />
              30-day returns on unworn pairs, in the box
            </li>
          </ul>

          <dl className="mt-8 divide-y divide-tpl-line border-y border-tpl-line text-sm">
            {product.specs.map(([term, detail]) => (
              <div key={term} className="flex justify-between gap-4 py-3">
                <dt className="text-tpl-muted">{term}</dt>
                <dd className="font-semibold">{detail}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-10">
            <p className="text-sm font-bold">Also in the range</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {others.map((item) => (
                <Link
                  key={item.slug}
                  href={`${BASE_PATH}/product/${item.slug}?colour=${colour}`}
                  className="flex items-center gap-3 rounded-[20px] bg-tpl-surface p-3 transition-colors hover:bg-tpl-tint"
                >
                  <span className="relative h-14 w-16 shrink-0 overflow-hidden rounded-[14px] bg-white">
                    <Image
                      src={chosen.image}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-contain"
                    />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold">{item.name}</span>
                    <span className="block text-xs text-tpl-muted">
                      {item.tagline} · {rm(item.price)}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
