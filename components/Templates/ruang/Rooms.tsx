'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Plus, ShoppingBag } from 'lucide-react';
import Photo from '@components/Templates/Photo';
import { rm } from '@components/Templates/Bag';
import {
  BASE_PATH,
  hasPriceOptions,
  productBySlug,
  ROOMS,
  type Product,
} from './data';
import { useStore } from './store';
import { useProductStock } from './ProductCard';
import { CONTAINER, SectionHeader } from './ui';

type RoomId = (typeof ROOMS)[number]['id'];

function PieceAction({
  product,
  compact = false,
}: {
  product: Product;
  compact?: boolean;
}) {
  const addToCart = useStore((state) => state.addToCart);
  const stock = useProductStock(product);
  const href = `${BASE_PATH}/product/${product.slug}`;
  const icon =
    'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-tpl-accent text-tpl-on-accent transition-transform hover:scale-105 disabled:opacity-40';

  if (product.options.length)
    return compact ? (
      <Link
        href={href}
        aria-label={`Choose options for ${product.name}`}
        className={icon}
      >
        <ArrowUpRight size={17} aria-hidden="true" />
      </Link>
    ) : (
      <Link
        href={href}
        className="flex h-10 shrink-0 items-center rounded-full border border-tpl-ink/15 px-4 text-sm font-medium transition-colors hover:border-tpl-ink"
      >
        Choose
      </Link>
    );
  return compact ? (
    <button
      type="button"
      disabled={stock === 0}
      onClick={() => addToCart(product.slug, [])}
      aria-label={`Add ${product.name} to bag`}
      className={icon}
    >
      <ShoppingBag size={16} aria-hidden="true" />
    </button>
  ) : (
    <button
      type="button"
      disabled={stock === 0}
      onClick={() => addToCart(product.slug, [])}
      className="flex h-10 shrink-0 items-center rounded-full bg-tpl-accent px-5 text-sm font-medium text-tpl-on-accent transition-opacity hover:opacity-90 disabled:opacity-40"
    >
      {stock === 0 ? 'Sold out' : 'Add'}
    </button>
  );
}

function Piece({
  product,
  active,
  onHover,
}: {
  product: Product;
  active: boolean;
  onHover?: () => void;
}) {
  return (
    <div
      onMouseEnter={onHover}
      className={`flex items-center gap-3 rounded-[20px] bg-tpl-surface p-2 pr-3 transition-shadow ${
        active ? 'shadow-[0_0_0_2px_rgb(var(--tpl-ink))]' : ''
      }`}
    >
      <Link
        href={`${BASE_PATH}/product/${product.slug}`}
        className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[14px] bg-tpl-tint"
      >
        <Photo
          src={product.images[0]}
          alt=""
          fill
          sizes="64px"
          className="object-cover"
        />
      </Link>
      <div className="min-w-0 flex-1">
        <Link
          href={`${BASE_PATH}/product/${product.slug}`}
          className="line-clamp-2 text-sm font-medium leading-snug hover:underline"
        >
          {product.name}
        </Link>
        <p className="mt-0.5 text-sm font-semibold tabular-nums">
          {hasPriceOptions(product) ? 'From ' : ''}
          {rm(product.price)}
        </p>
      </div>
      <PieceAction product={product} />
    </div>
  );
}

// The total card fills whatever is left of the last row of three.
const TOTAL_SPAN = {
  1: 'lg:col-span-1',
  2: 'lg:col-span-2',
  3: 'lg:col-span-3',
} as const;

function PieceTile({
  product,
  active,
  onHover,
}: {
  product: Product;
  active: boolean;
  onHover: () => void;
}) {
  const href = `${BASE_PATH}/product/${product.slug}`;
  return (
    <div
      onMouseEnter={onHover}
      className={`flex h-full flex-col rounded-[22px] bg-tpl-surface p-2 transition-shadow ${
        active ? 'shadow-[0_0_0_2px_rgb(var(--tpl-ink))]' : ''
      }`}
    >
      <Link
        href={href}
        className="relative block aspect-[5/4] overflow-hidden rounded-[16px] bg-tpl-tint"
      >
        <Photo
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 18vw, 45vw"
          className="object-cover"
        />
      </Link>
      <div className="flex flex-1 flex-col px-1.5 pb-1 pt-3">
        <Link
          href={href}
          className="line-clamp-1 text-sm font-medium hover:underline"
        >
          {product.name}
        </Link>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <p className="text-sm font-semibold tabular-nums">
            {hasPriceOptions(product) ? 'From ' : ''}
            {rm(product.price)}
          </p>
          <PieceAction product={product} compact />
        </div>
      </div>
    </div>
  );
}

export default function Rooms() {
  const [roomId, setRoomId] = useState<RoomId>('dining');
  const [active, setActive] = useState<number | null>(null);
  const room = ROOMS.find((item) => item.id === roomId) ?? ROOMS[0];
  const spots = room.spots.flatMap((spot) => {
    const product = productBySlug(spot.slug);
    return product ? [{ ...spot, product }] : [];
  });
  const open = active === null ? null : spots[active];
  const total = spots.reduce((sum, spot) => sum + spot.product.price, 0);

  return (
    <section className={`${CONTAINER} mt-20 md:mt-28`}>
      <SectionHeader
        title="Shop the Room"
        text="Tap the dots to see each piece. Everything in these rooms is in stock."
      >
        <div
          role="tablist"
          aria-label="Rooms"
          className="flex gap-1 rounded-full bg-tpl-surface p-1"
        >
          {ROOMS.map((item) => {
            const selected = item.id === roomId;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => {
                  setRoomId(item.id);
                  setActive(null);
                }}
                className={`h-10 rounded-full px-5 text-sm font-medium transition-colors ${
                  selected ? 'bg-tpl-ink text-tpl-surface' : 'hover:bg-tpl-tint'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </SectionHeader>

      <div className="mt-8 grid gap-3 md:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
        <div
          role="tabpanel"
          aria-label={`${room.label} room`}
          className="relative aspect-[2/3] overflow-hidden rounded-[28px] bg-tpl-tint"
        >
          <Photo
            key={room.image}
            src={room.image}
            alt={room.alt}
            fill
            sizes="(min-width: 1024px) 28rem, (min-width: 768px) 24rem, 100vw"
            className="pointer-events-none animate-[tpl-rise_600ms_ease-out] object-cover"
          />
          {spots.map((spot, index) => {
            const selected = active === index;
            return (
              <button
                key={`${spot.slug}-${index}`}
                type="button"
                aria-pressed={selected}
                aria-label={`${spot.product.name}, ${rm(spot.product.price)}`}
                onClick={() => setActive(selected ? null : index)}
                style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                className="absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center"
              >
                {!selected && (
                  <span className="absolute h-8 w-8 animate-ping rounded-full bg-white/60 motion-reduce:animate-none" />
                )}
                <span
                  className={`relative flex h-8 w-8 items-center justify-center rounded-full shadow-lg transition-colors ${
                    selected
                      ? 'bg-tpl-accent text-tpl-on-accent'
                      : 'bg-white text-[#141414]'
                  }`}
                >
                  <Plus
                    size={16}
                    strokeWidth={2.25}
                    className={`transition-transform duration-300 ${selected ? 'rotate-45' : ''}`}
                  />
                </span>
              </button>
            );
          })}
          {open && (
            <div className="absolute inset-x-3 bottom-3 animate-[tpl-rise_300ms_ease-out] sm:left-auto sm:w-[22rem]">
              <Piece product={open.product} active />
            </div>
          )}
        </div>

        <ul className="grid auto-rows-fr grid-cols-2 gap-3 self-start lg:grid-cols-3">
          {spots.map((spot, index) => (
            <li key={`${spot.slug}-${index}`}>
              <PieceTile
                product={spot.product}
                active={active === index}
                onHover={() => setActive(index)}
              />
            </li>
          ))}
          <li
            className={`flex flex-col justify-end rounded-[22px] bg-tpl-ink p-5 text-tpl-bg ${
              TOTAL_SPAN[(6 - spots.length) as keyof typeof TOTAL_SPAN] ?? ''
            }`}
          >
            <span className="mb-auto flex -space-x-3 pb-6">
              {spots.map((spot, index) => (
                <span
                  key={`${spot.slug}-${index}`}
                  className="relative h-12 w-12 overflow-hidden rounded-full bg-tpl-tint ring-2 ring-tpl-ink"
                >
                  <Photo
                    src={spot.product.images[0]}
                    alt=""
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </span>
              ))}
            </span>
            <p className="text-sm opacity-70">
              Everything in the {room.label.toLowerCase()} room
            </p>
            <p className="mt-1 text-3xl font-semibold tabular-nums tracking-[-0.02em]">
              From {rm(total)}
            </p>
            <p className="mt-1 text-xs opacity-60">
              {spots.length} pieces, delivered together
            </p>
          </li>
        </ul>
      </div>
    </section>
  );
}
