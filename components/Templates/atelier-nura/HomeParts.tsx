'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import Photo from '@components/Templates/Photo';
import { HoverPreview } from '@components/Templates/motion';
import ProductCard from './ProductCard';
import { BASE_PATH, CATEGORY_TILES, PRODUCTS } from './data';

export function CategoryList() {
  const items = CATEGORY_TILES.map((tile) => ({
    key: tile.category,
    ...tile,
    count: PRODUCTS.filter((product) => product.category === tile.category)
      .length,
  }));

  return (
    <HoverPreview
      items={items}
      imageClassName="h-80 w-60"
      className="border-b border-tpl-line"
      renderRow={(item) => (
        <Link
          href={`${BASE_PATH}/shop?category=${item.category}`}
          className="group flex items-center gap-5 border-t border-tpl-line py-6 md:py-8"
        >
          <span className="relative h-20 w-16 shrink-0 overflow-hidden md:hidden">
            <Photo
              src={item.image}
              alt=""
              fill
              sizes="64px"
              className="object-cover"
            />
          </span>
          <span className="flex-1">
            <span className="block text-4xl font-medium tracking-[-0.04em] transition-transform duration-500 md:text-8xl md:group-hover:translate-x-6">
              {item.category}
              <sup className="ml-2 align-super text-sm font-normal tracking-normal text-tpl-muted md:text-lg">
                {item.count}
              </sup>
            </span>
            <span className="mt-1 block text-sm text-tpl-muted md:hidden">
              {item.note}
            </span>
          </span>
          <span className="hidden text-sm text-tpl-muted md:block">
            {item.note}
          </span>
          <ArrowUpRight
            aria-hidden="true"
            className="h-6 w-6 shrink-0 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 md:h-10 md:w-10"
          />
        </Link>
      )}
    />
  );
}

export function NewInRow() {
  const rowRef = useRef<HTMLDivElement>(null);
  const arrivals = PRODUCTS.filter((product) => product.isNew);
  const scroll = (direction: number) =>
    rowRef.current?.scrollBy({
      left: direction * rowRef.current.clientWidth * 0.8,
      behavior: 'smooth',
    });

  return (
    <div>
      <div className="mx-auto flex max-w-[90rem] items-end justify-between gap-4 px-4 md:px-8">
        <h2 className="text-4xl font-medium tracking-[-0.04em] md:text-6xl">
          New in
        </h2>
        <div className="flex items-center gap-2">
          <Link
            href={`${BASE_PATH}/shop`}
            className="mr-3 text-sm underline underline-offset-4"
          >
            Shop all
          </Link>
          {[-1, 1].map((direction) => (
            <button
              key={direction}
              type="button"
              onClick={() => scroll(direction)}
              aria-label={direction < 0 ? 'Previous pieces' : 'Next pieces'}
              className="hidden h-11 w-11 items-center justify-center rounded-full border border-tpl-line transition-colors hover:border-tpl-ink md:flex"
            >
              {direction < 0 ? (
                <ArrowLeft size={18} />
              ) : (
                <ArrowRight size={18} />
              )}
            </button>
          ))}
        </div>
      </div>
      <div
        ref={rowRef}
        className="mt-8 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] md:scroll-px-8 md:gap-5 md:px-8"
      >
        {[
          ...arrivals,
          ...PRODUCTS.filter((product) => !product.isNew).slice(0, 3),
        ].map((product) => (
          <div
            key={product.id}
            className="w-[68vw] shrink-0 snap-start sm:w-[40vw] lg:w-[24vw]"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}
