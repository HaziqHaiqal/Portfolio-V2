'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, RotateCcw, ShieldCheck, Store, Truck } from 'lucide-react';
import Photo from '@components/Templates/Photo';
import { QtyStepper, rm } from '@components/Templates/Bag';
import {
  arrivalDate,
  BASE_PATH,
  CATEGORIES,
  FREE_DELIVERY_AT,
  lineKey,
  MAKERS,
  PRODUCTS,
  REVIEWS,
  STUDIO,
  unitPrice,
  variantsOf,
  type Product,
} from './data';
import { availableFrom, useHydrated, useStore, useToday } from './store';
import ProductCard, { Badge } from './ProductCard';
import {
  BUTTON_ACCENT,
  BUTTON_DARK,
  CONTAINER,
  HeartButton,
  SectionHeader,
  Stars,
} from './ui';

const LOW_STOCK = 5;

function Fold({
  title,
  open = false,
  children,
}: {
  title: string;
  open?: boolean;
  children: ReactNode;
}) {
  return (
    <details
      open={open}
      className="group border-b border-tpl-line last:border-0"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-sm font-semibold [&::-webkit-details-marker]:hidden">
        {title}
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-tpl-tint transition-transform duration-300 group-open:rotate-45">
          <Plus size={15} aria-hidden="true" />
        </span>
      </summary>
      <div className="pb-5 text-sm leading-relaxed text-tpl-muted">
        {children}
      </div>
    </details>
  );
}

export default function ProductDetail({ product }: { product: Product }) {
  const router = useRouter();
  const hydrated = useHydrated();
  const today = useToday();
  const sold = useStore((state) => state.sold);
  const addToCart = useStore((state) => state.addToCart);
  const variants = variantsOf(product);
  const stockOf = (values: string[]) =>
    availableFrom(sold, lineKey(product.slug, values));

  const [values, setValues] = useState<string[]>(
    () => variants.find((combo) => stockOf(combo) > 0) ?? variants[0]
  );
  const [imageIndex, setImageIndex] = useState(0);
  const [qty, setQty] = useState(1);

  const stock = hydrated ? stockOf(values) : null;
  const unit = unitPrice(product, values);
  const compareAt = product.compareAt
    ? product.compareAt + (unit - product.price)
    : undefined;
  const soldOut = stock === 0;
  const lowStock = stock !== null && stock > 0 && stock <= LOW_STOCK;
  const category = CATEGORIES.find((item) => item.id === product.category);
  const related = [
    ...PRODUCTS.filter(
      (item) => item.category === product.category && item.slug !== product.slug
    ),
    ...PRODUCTS.filter((item) => item.category !== product.category),
  ].slice(0, 4);
  // The chosen glaze or linen tints the panel behind the photo.
  const stage = product.options
    .flatMap((option, index) =>
      option.values.filter((value) => value.label === values[index])
    )
    .find((value) => value.swatch)?.swatch;

  const pick = (index: number, label: string) => {
    setValues(values.map((value, i) => (i === index ? label : value)));
    setQty(1);
    const image = product.options[index].values.find(
      (value) => value.label === label
    )?.image;
    if (image !== undefined) setImageIndex(image);
  };

  const inStockWith = (index: number, label: string) =>
    stockOf(values.map((value, i) => (i === index ? label : value))) > 0;

  const add = () => addToCart(product.slug, values, qty);

  return (
    <div className="pb-28 md:pb-0">
      <div className={`${CONTAINER} pt-6`}>
        <nav aria-label="Breadcrumb" className="text-sm text-tpl-muted">
          <Link href={BASE_PATH} className="hover:text-tpl-ink">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link
            href={`${BASE_PATH}/shop?category=${product.category}`}
            className="hover:text-tpl-ink"
          >
            {category?.label}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-tpl-ink">{product.name}</span>
        </nav>

        <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <div
            style={
              stage
                ? { backgroundColor: `color-mix(in srgb, ${stage} 45%, white)` }
                : undefined
            }
            className="self-start rounded-[28px] bg-tpl-surface p-3 transition-colors duration-700 lg:sticky lg:top-36"
          >
            <div className="relative aspect-square overflow-hidden rounded-[22px] bg-tpl-tint">
              <Photo
                key={product.images[imageIndex]}
                src={product.images[imageIndex]}
                alt={product.name}
                fill
                loading="eager"
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="animate-[tpl-rise_500ms_ease-out] object-cover"
              />
              <span className="absolute left-3 top-3">
                <Badge product={product} />
              </span>
              <HeartButton
                slug={product.slug}
                name={product.name}
                className="absolute right-3 top-3 h-11 w-11"
              />
            </div>
            {product.images.length > 1 && (
              <div className="mt-3 flex gap-3">
                {product.images.map((image, index) => (
                  <button
                    key={image}
                    type="button"
                    onClick={() => setImageIndex(index)}
                    aria-label={`Photo ${index + 1}`}
                    aria-pressed={imageIndex === index}
                    className={`relative h-20 w-20 overflow-hidden rounded-[16px] bg-tpl-tint transition-opacity ${
                      imageIndex === index
                        ? 'ring-2 ring-tpl-ink'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Photo
                      src={image}
                      alt=""
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-[28px] bg-tpl-surface p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
              <span className="rounded-full bg-tpl-tint px-3 py-1.5">
                {category?.label}
              </span>
              <span className="rounded-full bg-tpl-tint px-3 py-1.5">
                By {MAKERS[product.category]}
              </span>
            </div>
            <h1 className="mt-4 text-[clamp(2rem,3.6vw,3rem)] font-semibold leading-[1.05] tracking-[-0.035em]">
              {product.name}
            </h1>
            <div className="mt-3 flex items-center gap-2 text-sm">
              <Stars rating={product.rating} size={15} />
              <span className="font-medium">{product.rating}</span>
              <span className="text-tpl-muted">
                ({product.reviews} reviews)
              </span>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="text-3xl font-semibold tabular-nums tracking-[-0.02em]">
                {rm(unit)}
              </span>
              {compareAt && (
                <>
                  <s className="text-lg text-tpl-muted">{rm(compareAt)}</s>
                  <span className="rounded-full bg-tpl-accent px-3 py-1 text-xs font-semibold text-tpl-on-accent">
                    Save {rm(compareAt - unit)}
                  </span>
                </>
              )}
            </div>
            <p className="mt-5 leading-relaxed text-tpl-muted">
              {product.blurb}
            </p>

            {product.options.map((option, index) => (
              <fieldset key={option.name} className="mt-7">
                <legend className="text-sm font-semibold">
                  {option.name}
                  <span className="font-normal text-tpl-muted">
                    : {values[index]}
                  </span>
                </legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  {option.values.map((value) => {
                    const selected = values[index] === value.label;
                    const available =
                      !hydrated || inStockWith(index, value.label);
                    return value.swatch ? (
                      <button
                        key={value.label}
                        type="button"
                        onClick={() => pick(index, value.label)}
                        aria-pressed={selected}
                        aria-label={`${value.label}${available ? '' : ', sold out'}`}
                        className={`relative flex h-12 items-center gap-2 rounded-full border pl-1.5 pr-4 text-sm transition-colors ${
                          selected
                            ? 'border-tpl-ink bg-tpl-ink text-tpl-surface'
                            : 'border-tpl-line hover:border-tpl-ink/40'
                        } ${available ? '' : 'opacity-45'}`}
                      >
                        <span
                          style={{ background: value.swatch }}
                          className="h-9 w-9 rounded-full ring-1 ring-inset ring-black/10"
                        />
                        <span className={available ? '' : 'line-through'}>
                          {value.label}
                        </span>
                      </button>
                    ) : (
                      <button
                        key={value.label}
                        type="button"
                        onClick={() => pick(index, value.label)}
                        aria-pressed={selected}
                        className={`h-12 rounded-full border px-5 text-sm transition-colors ${
                          selected
                            ? 'border-tpl-ink bg-tpl-ink text-tpl-surface'
                            : 'border-tpl-line hover:border-tpl-ink/40'
                        } ${available ? '' : 'line-through opacity-45'}`}
                      >
                        {value.label}
                        {value.delta ? (
                          <span className="ml-1.5 opacity-60">
                            +{rm(value.delta)}
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ))}

            <p
              className={`mt-7 flex items-center gap-2 text-sm font-medium ${
                lowStock
                  ? 'text-orange-700'
                  : soldOut
                    ? 'text-tpl-muted'
                    : 'text-emerald-700'
              }`}
            >
              <span
                aria-hidden="true"
                className={`h-2 w-2 rounded-full ${
                  soldOut
                    ? 'bg-tpl-muted'
                    : lowStock
                      ? 'bg-orange-500'
                      : 'bg-emerald-500'
                }`}
              />
              {stock === null
                ? 'Checking stock'
                : soldOut
                  ? 'Sold out in this option'
                  : lowStock
                    ? `Only ${stock} left, order soon`
                    : 'In stock, ships within 2 working days'}
            </p>

            <div className="mt-4 hidden items-center gap-3 md:flex">
              <QtyStepper
                qty={qty}
                name={product.name}
                min={1}
                max={stock ?? undefined}
                onChange={(delta) => setQty((value) => value + delta)}
              />
              <button
                type="button"
                onClick={add}
                disabled={soldOut || stock === null}
                className={`${BUTTON_DARK} flex-1`}
              >
                Add to bag, {rm(unit * qty)}
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                add();
                router.push(`${BASE_PATH}/checkout`);
              }}
              disabled={soldOut || stock === null}
              className={`${BUTTON_ACCENT} mt-3 hidden w-full md:flex`}
            >
              Buy now
            </button>

            <ul className="mt-6 grid gap-3 rounded-[20px] bg-tpl-tint p-4 text-sm sm:grid-cols-2">
              {[
                {
                  icon: Truck,
                  title: today
                    ? `Arrives by ${arrivalDate('standard', today)}`
                    : 'Delivery in 2 to 5 days',
                  text: `Free above ${rm(FREE_DELIVERY_AT)}`,
                },
                { icon: Store, title: 'Pickup today', text: STUDIO },
                {
                  icon: ShieldCheck,
                  title: 'Packed for fragile',
                  text: 'Breakages replaced',
                },
                {
                  icon: RotateCcw,
                  title: '30-day returns',
                  text: 'On unused pieces',
                },
              ].map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-tpl-surface">
                    <Icon size={16} aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-medium">{title}</span>
                    <span className="block truncate text-xs text-tpl-muted">
                      {text}
                    </span>
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-4">
              <Fold title="Details" open>
                <dl className="space-y-2">
                  {product.specs.map(([label, value]) => (
                    <div
                      key={label}
                      className="grid grid-cols-[7rem_1fr] gap-4"
                    >
                      <dt>{label}</dt>
                      <dd className="text-tpl-ink">{value}</dd>
                    </div>
                  ))}
                </dl>
              </Fold>
              <Fold title="Care">{product.care}</Fold>
              <Fold title="Delivery and returns">
                Free standard delivery above {rm(FREE_DELIVERY_AT)}. Every piece
                is packed for fragile; if anything arrives broken, send us a
                photo within 7 days and we replace it. Unused pieces can be
                returned within 30 days.
              </Fold>
            </div>
          </div>
        </div>
      </div>

      <section className={`${CONTAINER} mt-20`}>
        <SectionHeader title="Customer Reviews" />
        <div className="mt-6 grid gap-3 md:grid-cols-[16rem_minmax(0,1fr)]">
          <div className="rounded-[24px] bg-tpl-surface p-6">
            <p className="text-5xl font-semibold tracking-[-0.04em]">
              {product.rating}
            </p>
            <Stars rating={product.rating} size={16} className="mt-2" />
            <p className="mt-2 text-sm text-tpl-muted">
              From {product.reviews} reviews
            </p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-3">
            {REVIEWS.slice(0, 3).map((review) => (
              <li
                key={review.name}
                className="rounded-[24px] bg-tpl-surface p-6"
              >
                <Stars rating={review.rating} />
                <p className="mt-3 text-sm leading-relaxed">{review.text}</p>
                <p className="mt-4 text-sm font-medium">
                  {review.name}{' '}
                  <span className="font-normal text-tpl-muted">
                    {review.city}
                  </span>
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={`${CONTAINER} mt-20`}>
        <SectionHeader
          title="You May Also Like"
          href={`${BASE_PATH}/shop?category=${product.category}`}
          action={`More ${category?.label.toLowerCase()}`}
        />
        <ul className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {related.map((item) => (
            <li key={item.slug}>
              <ProductCard product={item} />
            </li>
          ))}
        </ul>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-tpl-line bg-tpl-surface/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl md:hidden">
        <div className="flex items-center gap-3">
          <QtyStepper
            qty={qty}
            name={product.name}
            min={1}
            max={stock ?? undefined}
            onChange={(delta) => setQty((value) => value + delta)}
          />
          <button
            type="button"
            onClick={add}
            disabled={soldOut || stock === null}
            className={`${BUTTON_DARK} flex-1`}
          >
            {soldOut ? 'Sold out' : `Add to bag, ${rm(unit * qty)}`}
          </button>
        </div>
        {values.length > 0 && (
          <p className="mt-2 truncate text-center text-xs text-tpl-muted">
            {values.join(', ')}
          </p>
        )}
      </div>
    </div>
  );
}
