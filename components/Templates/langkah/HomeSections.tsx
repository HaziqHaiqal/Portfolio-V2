'use client';

import { useState, type FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  RotateCcw,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import {
  BASE_PATH,
  COLOURWAYS,
  FREE_DELIVERY_AT,
  PRODUCTS,
  REVIEWS,
  rm,
} from './data';
import ProductCard from './ProductCard';
import { BUTTON_ACCENT, CONTAINER, DISPLAY, Stars } from './ui';

export function TierGrid() {
  return (
    <section className={`${CONTAINER} pt-16 md:pt-24`}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2
          className={`${DISPLAY} text-[clamp(2rem,4.5vw,3.5rem)] leading-none`}
        >
          Shop the range
        </h2>
        <Link
          href={`${BASE_PATH}/shop`}
          className="inline-flex items-center gap-1.5 text-sm font-bold underline-offset-4 hover:underline"
        >
          All colours
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PRODUCTS.map((product, index) => (
          <ProductCard
            key={product.slug}
            product={product}
            startColour={COLOURWAYS[index % COLOURWAYS.length].id}
          />
        ))}
      </div>
    </section>
  );
}

const DETAILS = '/templates/langkah/details';

/** Why it is comfortable, told with close-ups of the shoe itself. */
export function Details() {
  return (
    <section className={`${CONTAINER} pt-16 md:pt-24`}>
      <h2 className={`${DISPLAY} text-[clamp(2rem,4.5vw,3.5rem)] leading-none`}>
        Made for heat and rain
      </h2>
      <div className="mt-8 grid gap-4 md:grid-cols-3 md:grid-rows-[repeat(2,minmax(15rem,auto))]">
        <article className="relative flex min-h-[18rem] flex-col justify-between overflow-hidden rounded-[28px] bg-tpl-surface p-6 md:col-span-2 md:p-8">
          <div className="absolute inset-x-0 bottom-0 top-[42%] md:left-[40%] md:top-0">
            <Image
              src={`${DETAILS}/knit.webp`}
              alt="Close-up of the yellow knit upper"
              fill
              sizes="(min-width: 768px) 40vw, 100vw"
              className="object-cover object-[60%_45%]"
            />
          </div>
          <div className="relative max-w-[15rem]">
            <h3 className="text-xl font-extrabold tracking-tight">
              Knit that breathes
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-tpl-muted">
              Air moves through the recycled knit, so your feet stay cooler on a
              33° afternoon.
            </p>
          </div>
        </article>

        <article className="relative flex min-h-[22rem] flex-col overflow-hidden rounded-[28px] bg-tpl-surface p-6 md:row-span-2 md:p-8">
          <h3 className="relative text-xl font-extrabold tracking-tight">
            32 mm of springy foam
          </h3>
          <p className="relative mt-2 max-w-[16rem] text-sm leading-relaxed text-tpl-muted">
            Soft on tiled floors, long LRT platforms and a full day on your
            feet.
          </p>
          <Image
            src={`${DETAILS}/foam.webp`}
            alt="Close-up of the gum foam midsole"
            fill
            sizes="(min-width: 768px) 30vw, 100vw"
            className="!top-auto !h-[65%] object-cover object-[20%_50%]"
          />
        </article>

        <article className="relative flex min-h-[18rem] flex-col justify-end overflow-hidden rounded-[28px] bg-tpl-ink p-6 text-tpl-bg md:p-8">
          <Image
            src={`${DETAILS}/sole.webp`}
            alt="The ribbed rubber outsole"
            fill
            sizes="(min-width: 768px) 30vw, 100vw"
            className="!bottom-auto !h-[70%] object-cover object-[40%_60%]"
          />
          <h3 className="relative text-xl font-extrabold tracking-tight">
            Grips wet floors
          </h3>
          <p className="relative mt-2 text-sm leading-relaxed opacity-70">
            Ribbed rubber that holds on rainy tarmac and mall tiles.
          </p>
        </article>

        <article className="flex flex-col justify-between gap-6 rounded-[28px] bg-tpl-accent p-6 text-tpl-on-accent md:p-8">
          <ul className="space-y-3 text-sm font-bold">
            {TRUST.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-2.5">
                <Icon size={18} aria-hidden="true" />
                {text}
              </li>
            ))}
          </ul>
          <Link
            href={`${BASE_PATH}/shop`}
            className="inline-flex h-12 w-fit items-center gap-2 rounded-full bg-black px-6 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
          >
            Shop all colours
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </article>
      </div>
    </section>
  );
}

export function Reviews() {
  const [featured, ...rest] = REVIEWS;
  const total = 2313;

  return (
    <section className="bg-tpl-surface">
      <div
        className={`${CONTAINER} grid gap-10 py-20 md:grid-cols-[0.8fr_1.2fr] md:py-24`}
      >
        <div>
          <h2
            className={`${DISPLAY} text-[clamp(2rem,4.5vw,3.5rem)] leading-none`}
          >
            Rated 4.8 out of 5
          </h2>
          <div className="mt-3 flex items-center gap-2">
            <Stars rating={4.8} size={18} />
            <span className="text-sm text-tpl-muted">
              {total.toLocaleString('en-MY')} reviews
            </span>
          </div>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-tpl-muted">
            From people across Malaysia, most of them on their second pair.
          </p>
        </div>
        <div className="space-y-4">
          <figure className="rounded-[28px] bg-tpl-bg p-6 md:p-8">
            <Stars rating={featured.rating} />
            <blockquote className="mt-4 text-xl font-semibold leading-snug md:text-2xl">
              &ldquo;{featured.text}&rdquo;
            </blockquote>
            <figcaption className="mt-4 text-sm text-tpl-muted">
              {featured.name}, {featured.city} · {featured.product}
            </figcaption>
          </figure>
          <div className="grid gap-4 sm:grid-cols-2">
            {rest.map((review) => (
              <figure
                key={review.name}
                className="rounded-[24px] bg-tpl-bg p-5"
              >
                <Stars rating={review.rating} size={13} />
                <blockquote className="mt-3 text-sm leading-relaxed">
                  &ldquo;{review.text}&rdquo;
                </blockquote>
                <figcaption className="mt-3 text-xs text-tpl-muted">
                  {review.name}, {review.city} · {review.product}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const TRUST = [
  { icon: Truck, text: `Free delivery over ${rm(FREE_DELIVERY_AT)}` },
  { icon: RotateCcw, text: '30-day returns, unworn' },
  { icon: ShieldCheck, text: '1-year warranty on soles and stitching' },
  { icon: BadgeCheck, text: 'FPX, card or e-wallet' },
];

export function Newsletter() {
  const [done, setDone] = useState(false);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    setDone(true);
  };

  return (
    <section className={`${CONTAINER} py-20 md:py-24`}>
      <div className="rounded-[36px] bg-tpl-accent p-8 text-tpl-on-accent md:flex md:items-center md:justify-between md:gap-10 md:p-12">
        <h2
          className={`${DISPLAY} text-[clamp(2.2rem,5vw,4rem)] leading-[0.9]`}
        >
          Drops sell out.
          <br />
          Hear first.
        </h2>
        {done ? (
          <p className="mt-6 text-lg font-bold md:mt-0">
            You&apos;re on the list. See you at the next drop.
          </p>
        ) : (
          <form
            onSubmit={submit}
            className="mt-6 flex w-full max-w-md gap-2 md:mt-0"
          >
            <label htmlFor="langkah-email" className="sr-only">
              Email
            </label>
            <input
              id="langkah-email"
              type="email"
              required
              placeholder="you@email.com"
              className="h-12 min-w-0 flex-1 rounded-full bg-white/90 px-5 text-sm text-black outline-none placeholder:text-black/40 focus:ring-4 focus:ring-black/20"
            />
            <button
              type="submit"
              className="h-12 shrink-0 rounded-full bg-black px-6 text-sm font-bold text-white"
            >
              Join
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
