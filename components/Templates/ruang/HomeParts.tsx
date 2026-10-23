'use client';

import {
  useEffect,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Check,
  CreditCard,
  PackageCheck,
  RotateCcw,
  ShoppingBag,
  Truck,
} from 'lucide-react';
import { RUANG as P } from '@components/Templates/photos';
import Photo from '@components/Templates/Photo';
import { rm } from '@components/Templates/Bag';
import {
  BASE_PATH,
  CATEGORIES,
  DISCOUNT,
  FREE_DELIVERY_AT,
  productBySlug,
  PRODUCTS,
  REVIEWS,
  type CategoryId,
  type Product,
} from './data';
import { useStore } from './store';
import ProductCard, { useProductStock } from './ProductCard';
import {
  BUTTON_ACCENT,
  BUTTON_DARK,
  CONTAINER,
  percentOff,
  SectionHeader,
  Stars,
} from './ui';

const SLIDES = [
  {
    image: P.lampCeramic,
    alt: 'A ceramic lamp, a candle on books and a small vase on a sideboard',
    label: 'New in living',
    slug: 'arch-ceramic-lamp',
    position: '30% 70%',
  },
  {
    image: P.hero,
    alt: 'A long dining table laid with stoneware plates and glasses',
    label: 'Best for dining',
    slug: 'rim-dinner-plate',
    position: '50% 60%',
  },
  {
    image: P.bedroom,
    alt: 'A made bed with a breakfast tray beside a nightstand',
    label: 'Slow mornings',
    slug: 'linen-duvet-cover',
    position: '50% 45%',
  },
];

const SLIDE_MS = 6000;

function HeroChip({ product }: { product: Product }) {
  const addToCart = useStore((state) => state.addToCart);
  const stock = useProductStock(product);
  const href = `${BASE_PATH}/product/${product.slug}`;

  return (
    <div className="flex w-[17.5rem] items-center gap-3 rounded-[20px] bg-white/85 p-2 pr-2.5 text-[#141414] shadow-[0_20px_40px_-20px_rgba(0,0,0,0.5)] backdrop-blur-xl">
      <Link
        href={href}
        className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[14px] bg-black/5"
      >
        <Photo
          src={product.images[0]}
          alt=""
          fill
          sizes="56px"
          className="object-cover"
        />
      </Link>
      <div className="min-w-0 flex-1">
        <Link
          href={href}
          className="block truncate text-sm font-medium hover:underline"
        >
          {product.name}
        </Link>
        <p className="text-sm font-semibold tabular-nums">
          {product.options.length ? 'From ' : ''}
          {rm(product.price)}
        </p>
      </div>
      {product.options.length ? (
        <Link
          href={href}
          aria-label={`Choose options for ${product.name}`}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-tpl-accent text-tpl-on-accent"
        >
          <ArrowUpRight size={18} aria-hidden="true" />
        </Link>
      ) : (
        <button
          type="button"
          disabled={stock === 0}
          onClick={() => addToCart(product.slug, [])}
          aria-label={`Add ${product.name} to bag`}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-tpl-accent text-tpl-on-accent disabled:opacity-40"
        >
          <ShoppingBag size={17} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

export function Hero() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const slide = SLIDES[index];
  const product = productBySlug(slide.slug);
  const go = (step: number) =>
    setIndex((value) => (value + step + SLIDES.length) % SLIDES.length);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(
      () => setIndex((value) => (value + 1) % SLIDES.length),
      SLIDE_MS
    );
    return () => clearInterval(timer);
  }, [paused]);

  return (
    <section className={`${CONTAINER} pt-3`}>
      <div className="grid gap-3 lg:h-[clamp(34rem,72vh,42rem)] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="relative flex flex-col overflow-hidden rounded-[28px] bg-tpl-ink p-7 text-tpl-bg md:p-10">
          <svg
            aria-hidden="true"
            viewBox="0 0 200 220"
            className="pointer-events-none absolute -bottom-16 -right-16 h-80 w-80 text-tpl-accent opacity-15"
          >
            <path
              d="M20 220V100a80 80 0 0 1 160 0v120"
              fill="none"
              stroke="currentColor"
              strokeWidth="34"
            />
          </svg>
          <div className="flex items-center gap-3 text-sm">
            <span className="flex -space-x-2">
              {['#E9C9A8', '#B9D3C2', '#C9C3E6'].map((colour, i) => (
                <span
                  key={colour}
                  style={{ background: colour }}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-[#141414] ring-2 ring-tpl-ink"
                >
                  {['N', 'D', 'P'][i]}
                </span>
              ))}
            </span>
            <span>
              <Stars rating={4.9} size={12} />
              <span className="mt-0.5 block text-xs opacity-70">
                4.9 from 2,400+ reviews
              </span>
            </span>
          </div>
          <h1 className="relative mt-8 text-[clamp(2.5rem,4.6vw,4.3rem)] font-semibold leading-[1.02] tracking-[-0.035em]">
            Handmade Homeware for Everyday Living
          </h1>
          <p className="relative mt-5 max-w-md text-[15px] leading-relaxed opacity-75">
            Stoneware, glass and linen made in small batches in Malaysia, packed
            for fragile and delivered anywhere in the country.
          </p>
          <div className="relative mt-8 flex flex-wrap gap-3">
            <Link href={`${BASE_PATH}/shop`} className={BUTTON_ACCENT}>
              Shop now
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link
              href={`${BASE_PATH}/shop?sale=1`}
              className="inline-flex h-12 items-center rounded-full border border-tpl-bg/25 px-6 text-sm font-medium transition-colors hover:bg-white/10"
            >
              View the sale
            </Link>
          </div>
          <dl className="relative mt-auto grid grid-cols-3 gap-4 border-t border-tpl-bg/15 pt-6">
            {[
              ['120+', 'Handmade pieces'],
              ['4,000+', 'Happy homes'],
              ['2-5 days', 'Delivery'],
            ].map(([value, label]) => (
              <div key={label}>
                <dt className="sr-only">{label}</dt>
                <dd className="text-xl font-semibold tracking-[-0.02em] md:text-2xl">
                  {value}
                </dd>
                <dd className="mt-1 text-xs opacity-65">{label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div
          className="relative min-h-[26rem] overflow-hidden rounded-[28px] bg-tpl-tint"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          aria-roledescription="carousel"
          aria-label="Featured rooms"
        >
          {SLIDES.map((item, i) => (
            <div
              key={item.image}
              aria-hidden={i !== index}
              className={`absolute inset-0 transition-opacity duration-700 ${
                i === index ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <Photo
                src={item.image}
                alt={item.alt}
                fill
                loading={i === 0 ? 'eager' : undefined}
                sizes="(min-width: 1024px) 58vw, 100vw"
                style={{ objectPosition: item.position }}
                className={`object-cover transition-transform ease-linear [transition-duration:6000ms] ${
                  i === index ? 'scale-105' : 'scale-100'
                }`}
              />
            </div>
          ))}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/45 to-transparent"
          />
          <div className="absolute inset-x-4 top-4 flex items-center justify-between">
            <span className="rounded-full bg-white/80 px-3.5 py-1.5 text-xs font-medium text-[#141414] backdrop-blur">
              {slide.label}
            </span>
            <span className="rounded-full bg-black/35 px-3 py-1.5 text-xs font-medium tabular-nums text-white backdrop-blur">
              0{index + 1} / 0{SLIDES.length}
            </span>
          </div>
          <div className="absolute inset-x-4 bottom-4 flex flex-wrap items-end justify-between gap-3">
            {product && (
              <div
                key={product.slug}
                className="animate-[tpl-rise_500ms_ease-out]"
              >
                <HeroChip product={product} />
              </div>
            )}
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5" aria-hidden="true">
                {SLIDES.map((item, i) => (
                  <span
                    key={item.image}
                    className={`h-1.5 rounded-full bg-white transition-all ${
                      i === index ? 'w-6' : 'w-1.5 opacity-50'
                    }`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous slide"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/85 text-[#141414] backdrop-blur transition-colors hover:bg-white"
              >
                <ArrowLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next slide"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/85 text-[#141414] backdrop-blur transition-colors hover:bg-white"
              >
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function TrustStrip() {
  return (
    <section className={`${CONTAINER} mt-3`}>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-5 rounded-[28px] bg-tpl-surface p-5 md:grid-cols-4 md:p-6">
        {[
          {
            icon: Truck,
            title: 'Free delivery',
            text: `On orders above RM${FREE_DELIVERY_AT}`,
          },
          {
            icon: PackageCheck,
            title: 'Packed for fragile',
            text: 'Breakages replaced',
          },
          {
            icon: RotateCcw,
            title: '30-day returns',
            text: 'On unused pieces',
          },
          {
            icon: CreditCard,
            title: 'Secure checkout',
            text: 'FPX, card, DuitNow or cash',
          },
        ].map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-tpl-tint">
              <Icon size={19} aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold">{title}</span>
              <span className="block text-xs text-tpl-muted">{text}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

const CATEGORY_IMAGES: Record<CategoryId, string> = {
  tableware: P.tableSet,
  glassware: P.tumblers,
  linen: P.duvetWhite,
  scent: P.candleAmber,
  decor: P.lampCeramic,
};

export function CategoryBento() {
  return (
    <section className={`${CONTAINER} mt-20 md:mt-28`}>
      <SectionHeader
        title="Shop by Category"
        text="Everything for the table, the bedroom and the corners in between."
        href={`${BASE_PATH}/shop`}
        action="All products"
      />
      <ul className="mt-8 grid grid-cols-2 gap-3 lg:h-[34rem] lg:grid-cols-4 lg:grid-rows-2">
        {CATEGORIES.map((category, index) => {
          const count = PRODUCTS.filter(
            (product) => product.category === category.id
          ).length;
          return (
            <li
              key={category.id}
              className={
                index === 0
                  ? 'col-span-2 aspect-[16/11] lg:row-span-2 lg:aspect-auto'
                  : 'aspect-square lg:aspect-auto'
              }
            >
              <Link
                href={`${BASE_PATH}/shop?category=${category.id}`}
                className="group relative block h-full overflow-hidden rounded-[24px] bg-tpl-tint"
              >
                <Photo
                  src={CATEGORY_IMAGES[category.id]}
                  alt=""
                  fill
                  sizes={
                    index === 0
                      ? '(min-width: 1024px) 44vw, 100vw'
                      : '(min-width: 1024px) 22vw, 50vw'
                  }
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <span className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-white py-1.5 pl-4 pr-1.5 text-sm font-medium text-[#141414] shadow-sm">
                  {category.label}
                  <span className="rounded-full bg-black/5 px-2 py-0.5 text-xs">
                    {count}
                  </span>
                </span>
                <span className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#141414] opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                  <ArrowUpRight size={18} aria-hidden="true" />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

const TICK_MS = 1000;
const subscribeTick = (onTick: () => void) => {
  const timer = setInterval(onTick, TICK_MS);
  return () => clearInterval(timer);
};
const secondsToMidnight = () => {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return Math.floor((midnight.getTime() - now.getTime()) / 1000);
};

function Countdown() {
  const left = useSyncExternalStore(
    subscribeTick,
    secondsToMidnight,
    () => null
  );
  const parts =
    left === null
      ? ['--', '--', '--']
      : [left / 3600, (left % 3600) / 60, left % 60].map((value) =>
          String(Math.floor(value)).padStart(2, '0')
        );
  return (
    <div className="mt-6 flex gap-2" aria-label="Time left in the sale">
      {parts.map((value, index) => (
        <span
          key={index}
          className="flex w-16 flex-col items-center rounded-2xl bg-tpl-on-accent/10 py-2.5"
        >
          <span className="text-2xl font-semibold tabular-nums">{value}</span>
          <span className="text-[11px] opacity-70">
            {['Hours', 'Mins', 'Secs'][index]}
          </span>
        </span>
      ))}
    </div>
  );
}

export function FlashSale() {
  const deals = PRODUCTS.filter((product) => product.compareAt)
    .toSorted(
      (a, b) =>
        percentOff(b.price, b.compareAt) - percentOff(a.price, a.compareAt)
    )
    .slice(0, 3);
  const best = Math.max(
    ...deals.map((product) => percentOff(product.price, product.compareAt))
  );

  return (
    <section className={`${CONTAINER} mt-20 md:mt-28`}>
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,3fr)]">
        <div className="flex flex-col rounded-[28px] bg-tpl-accent p-7 text-tpl-on-accent">
          <p className="w-fit rounded-full bg-tpl-on-accent px-3 py-1 text-xs font-semibold text-tpl-accent">
            Flash sale
          </p>
          <h2 className="mt-5 text-4xl font-semibold leading-[1.02] tracking-[-0.035em]">
            Up to {best}% Off Selected Pieces
          </h2>
          <p className="mt-3 text-sm opacity-80">Ends at midnight tonight.</p>
          <Countdown />
          <Link
            href={`${BASE_PATH}/shop?sale=1`}
            className={`${BUTTON_DARK} mt-auto w-full`}
          >
            Shop the sale
          </Link>
        </div>
        <ul className="relative -mx-4 flex min-w-0 snap-x gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden">
          {deals.map((product) => (
            <li
              key={product.slug}
              className="w-[72%] shrink-0 snap-start md:w-auto"
            >
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Popular() {
  const [category, setCategory] = useState<CategoryId | null>(null);
  const products = PRODUCTS.filter(
    (product) => !category || product.category === category
  )
    .toSorted((a, b) => b.reviews - a.reviews)
    .slice(0, 8);

  return (
    <section className={`${CONTAINER} mt-20 md:mt-28`}>
      <SectionHeader
        title="Most Popular"
        href={`${BASE_PATH}/shop`}
        action="View all"
      />
      <div
        role="group"
        aria-label="Category"
        className="-mx-4 mt-6 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {[{ id: null, label: 'All' }, ...CATEGORIES].map((item) => {
          const active = category === item.id;
          return (
            <button
              key={item.label}
              type="button"
              aria-pressed={active}
              onClick={() => setCategory(item.id)}
              className={`h-10 shrink-0 rounded-full px-5 text-sm font-medium transition-colors ${
                active
                  ? 'bg-tpl-ink text-tpl-surface'
                  : 'bg-tpl-surface hover:bg-tpl-tint'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      <ul className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {products.map((product) => (
          <li key={product.slug}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </section>
  );
}

const AVATAR_COLOURS = ['#E9C9A8', '#B9D3C2', '#C9C3E6', '#F2D27A'];

export function Reviews() {
  return (
    <section className={`${CONTAINER} mt-20 md:mt-28`}>
      <SectionHeader title="What Our Customers Say" />
      <div className="mt-8 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,3fr)]">
        <div className="rounded-[28px] bg-tpl-ink p-7 text-tpl-bg">
          <p className="text-6xl font-semibold tracking-[-0.04em]">4.9</p>
          <Stars rating={4.9} size={16} className="mt-2" />
          <p className="mt-2 text-sm opacity-70">From 2,400+ reviews</p>
          <ul className="mt-6 space-y-2 text-xs">
            {[
              [5, 88],
              [4, 9],
              [3, 2],
              [2, 1],
              [1, 0],
            ].map(([stars, share]) => (
              <li key={stars} className="flex items-center gap-2">
                <span className="w-3 tabular-nums">{stars}</span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-tpl-bg/15">
                  <span
                    style={{ width: `${share}%` }}
                    className="block h-full rounded-full bg-tpl-accent"
                  />
                </span>
                <span className="w-8 text-right tabular-nums opacity-70">
                  {share}%
                </span>
              </li>
            ))}
          </ul>
        </div>
        <ul className="relative -mx-4 flex min-w-0 snap-x gap-3 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 xl:grid-cols-4 [&::-webkit-scrollbar]:hidden">
          {REVIEWS.map((review, index) => (
            <li
              key={review.name}
              className="flex w-[80%] shrink-0 snap-start flex-col rounded-[24px] bg-tpl-surface p-6 md:w-auto"
            >
              <Stars rating={review.rating} />
              <p className="mt-4 flex-1 leading-relaxed">{review.text}</p>
              <div className="mt-6 flex items-center gap-3">
                <span
                  style={{ background: AVATAR_COLOURS[index % 4] }}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-[#141414]"
                >
                  {review.name[0]}
                </span>
                <span className="text-sm">
                  <span className="flex items-center gap-1 font-medium">
                    {review.name}
                    <BadgeCheck
                      size={14}
                      aria-label="Verified buyer"
                      className="text-emerald-600"
                    />
                  </span>
                  <span className="text-tpl-muted">{review.city}</span>
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function AboutBento() {
  return (
    <section className={`${CONTAINER} mt-20 md:mt-28`}>
      <SectionHeader title="Made by Hand, Close to Home" />
      <div className="mt-8 grid gap-3 md:grid-cols-4 md:grid-rows-2 lg:h-[30rem]">
        <div className="relative min-h-[18rem] overflow-hidden rounded-[28px] bg-tpl-tint md:col-span-2 md:row-span-2">
          <Photo
            src={P.maker}
            alt="Hands shaping a stoneware jug on a potter's wheel"
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <p className="absolute bottom-6 left-6 right-6 text-2xl font-semibold leading-tight tracking-[-0.02em] text-white md:text-3xl">
            Thrown, trimmed and glazed by hand in Hulu Langat
          </p>
        </div>
        <div className="flex flex-col justify-between rounded-[28px] bg-tpl-surface p-6 md:col-span-2">
          <p className="leading-relaxed text-tpl-muted">
            Ruang started as one potter and a kiln in Selangor. Today we work
            with 18 makers across Malaysia, and every piece is still finished by
            hand, so the glaze and edges vary a little on each one.
          </p>
          <Link
            href={`${BASE_PATH}/shop?category=tableware`}
            className="mt-6 inline-flex w-fit items-center gap-1.5 text-sm font-semibold underline underline-offset-4"
          >
            Shop the tableware
            <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        </div>
        <div className="flex flex-col justify-end rounded-[28px] bg-tpl-accent p-6 text-tpl-on-accent">
          <p className="text-4xl font-semibold tracking-[-0.03em]">18</p>
          <p className="mt-1 text-sm opacity-80">Malaysian makers</p>
        </div>
        <div className="flex flex-col justify-end rounded-[28px] bg-tpl-ink p-6 text-tpl-bg">
          <p className="text-4xl font-semibold tracking-[-0.03em]">1,240°C</p>
          <p className="mt-1 text-sm opacity-70">
            Kiln firing, dishwasher safe
          </p>
        </div>
      </div>
    </section>
  );
}

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [joined, setJoined] = useState(false);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (/^\S+@\S+\.\S+$/.test(email.trim())) setJoined(true);
  };

  return (
    <section className={`${CONTAINER} mt-20 md:mt-28`}>
      <div className="relative overflow-hidden rounded-[28px] bg-[#141414] px-6 py-16 text-center text-white md:py-24">
        <Photo
          src={P.alfresco}
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-45"
        />
        <div className="relative mx-auto max-w-xl">
          <h2 className="text-[clamp(1.9rem,4vw,3rem)] font-semibold leading-tight tracking-[-0.03em]">
            Get RM{DISCOUNT.amount} Off Your First Order
          </h2>
          <p className="mt-3 text-white/80">
            New pieces, restocks and the occasional flash sale, once a week.
          </p>
          {joined ? (
            <p
              role="status"
              className="mx-auto mt-8 flex w-fit items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-medium text-[#141414]"
            >
              <Check size={16} aria-hidden="true" />
              You are on the list. Use {DISCOUNT.code} at checkout.
            </p>
          ) : (
            <form
              onSubmit={submit}
              className="mx-auto mt-8 flex max-w-md gap-2 rounded-full bg-white p-1.5"
            >
              <label htmlFor="ruang-newsletter" className="sr-only">
                Email address
              </label>
              <input
                id="ruang-newsletter"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Your email address"
                className="min-w-0 flex-1 bg-transparent px-4 text-sm text-[#141414] outline-none placeholder:text-black/45"
              />
              <button type="submit" className={`${BUTTON_ACCENT} h-11`}>
                Subscribe
              </button>
            </form>
          )}
          <p className="mt-4 text-xs text-white/55">
            Demo store: nothing is sent or stored.
          </p>
        </div>
      </div>
    </section>
  );
}
