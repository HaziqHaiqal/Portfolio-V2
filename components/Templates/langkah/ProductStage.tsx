'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  BASE_PATH,
  colourway as colourwayOf,
  COLOURWAYS,
  FREE_DELIVERY_AT,
  PRODUCTS,
  rm,
} from './data';
import { SizeGrid, swatchFill } from './Pickers';
import { useStore } from './store';
import { DISPLAY, Stars } from './ui';

// three.js loads after the words, so the price and buttons paint first.
const StageScene = dynamic(() => import('./StageScene'), { ssr: false });

const NOTES = [
  { title: 'Recycled knit', text: 'Breathes in 33° heat', side: 'right' },
  { title: '32 mm foam', text: 'Soft, springy steps', side: 'left' },
  { title: 'Wet-floor rubber', text: 'Grips rainy tiles', side: 'right' },
] as const;

/**
 * The home page's first screen is a buy box: the shoe in 3D in the middle,
 * what it is and costs on the left, colour, size and Add to bag on the right.
 * Picking a colour floods the stage and turns the shoe once.
 */
export default function ProductStage() {
  const stage = useRef<HTMLDivElement>(null);
  const labels = useRef<(HTMLElement | null)[]>([]);
  const [slug, setSlug] = useState(PRODUCTS[0].slug);
  const [colour, setColour] = useState<string>(COLOURWAYS[0].id);
  const [size, setSize] = useState<string | null>(null);
  const [note, setNote] = useState(0);
  const [active, setActive] = useState(true);
  const [still, setStill] = useState(false);
  const [wide, setWide] = useState(true);
  const addToCart = useStore((state) => state.addToCart);
  const product = PRODUCTS.find((item) => item.slug === slug) ?? PRODUCTS[0];
  const chosen = colourwayOf(colour);

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const desktop = window.matchMedia('(min-width: 768px)');
    const read = () => {
      setStill(motion.matches);
      setWide(desktop.matches);
    };
    const frame = requestAnimationFrame(read);
    desktop.addEventListener('change', read);
    const element = stage.current;
    const observer = new IntersectionObserver(([entry]) =>
      setActive(entry.isIntersecting)
    );
    if (element) observer.observe(element);
    return () => {
      cancelAnimationFrame(frame);
      desktop.removeEventListener('change', read);
      observer.disconnect();
    };
  }, []);

  const href = `${BASE_PATH}/product/${product.slug}?colour=${colour}`;
  const badge = product.compareAt
    ? `-${Math.round((1 - product.price / product.compareAt) * 100)}%`
    : product.tag;

  return (
    <section className="px-3 pt-3 sm:px-4 md:pt-4">
      <div
        ref={stage}
        className="relative overflow-hidden rounded-[32px] transition-colors duration-500 md:rounded-[40px]"
        style={{ backgroundColor: chosen.stage, color: chosen.ink }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 hidden items-center justify-center overflow-hidden md:flex"
        >
          <span
            className={`${DISPLAY} select-none whitespace-nowrap text-[clamp(6rem,24vw,22rem)] leading-none opacity-[0.07]`}
          >
            {product.name.split(' ').at(-1)}
          </span>
        </div>

        <div className="relative grid grid-cols-1 gap-5 p-5 md:min-h-[clamp(30rem,calc(100svh-var(--demo-bar)-6.5rem),35rem)] md:grid-cols-[16rem_minmax(0,1fr)_19rem] md:gap-6 md:p-10 lg:grid-cols-[18rem_minmax(0,1fr)_21rem]">
          <div className="md:self-center">
            {badge && (
              <span
                className="inline-block rounded-full px-2.5 py-1 text-[11px] font-bold"
                style={{ backgroundColor: chosen.ink, color: chosen.stage }}
              >
                {badge}
              </span>
            )}
            <div className="mt-3 flex items-end justify-between gap-3 md:block">
              <div>
                <h1
                  className={`${DISPLAY} text-[clamp(2.4rem,6vw,4.5rem)] leading-[0.92]`}
                >
                  {product.name}
                </h1>
                <p className="mt-1.5 text-sm" style={{ color: chosen.muted }}>
                  {product.tagline}
                </p>
              </div>
              <p className="text-2xl font-extrabold tabular-nums md:mt-5 md:text-4xl">
                {rm(product.price)}
                {product.compareAt && (
                  <s
                    className="ml-2 text-base font-semibold"
                    style={{ color: chosen.muted }}
                  >
                    {rm(product.compareAt)}
                  </s>
                )}
              </p>
            </div>
            <p className="mt-2 flex items-center gap-2 text-sm md:mt-3">
              <Stars
                rating={product.rating}
                tone={
                  chosen.stage === '#FFB800' ? 'text-black' : 'text-amber-400'
                }
              />
              <span style={{ color: chosen.muted }}>
                {product.rating} · {product.reviews.toLocaleString('en-MY')}{' '}
                reviews
              </span>
            </p>
            <p
              className="mt-5 hidden max-w-xs text-sm leading-relaxed md:block"
              style={{ color: chosen.muted }}
            >
              {product.blurb}
            </p>
          </div>

          <div className="relative -mx-5 md:mx-0">
            <div className="relative h-[270px] md:absolute md:-inset-x-12 md:bottom-10 md:top-0 md:h-auto">
              <StageScene
                colourway={colour}
                label={`${product.name} in ${chosen.name}`}
                labels={labels}
                fill={wide ? 0.82 : 0.86}
                active={active}
                still={still}
              />
              <div className="pointer-events-none absolute inset-0">
                {NOTES.map((item, index) => (
                  <div
                    key={item.title}
                    ref={(node) => {
                      labels.current[index] = node;
                    }}
                    className="invisible absolute left-0 top-0 h-0 w-0 opacity-0 will-change-transform"
                  >
                    <button
                      type="button"
                      onClick={() => setNote(index)}
                      aria-label={`${item.title}: ${item.text}`}
                      className="pointer-events-auto absolute -left-3 -top-3 flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold shadow md:pointer-events-none"
                      style={{
                        backgroundColor: chosen.cta,
                        color: chosen.ctaInk,
                      }}
                    >
                      {index + 1}
                    </button>
                    <span
                      className={`absolute top-[-1.15rem] hidden w-max rounded-2xl bg-white/95 px-3 py-1.5 text-black shadow-lg md:block ${
                        item.side === 'left' ? 'right-5 text-right' : 'left-5'
                      }`}
                    >
                      <span className="block text-xs font-bold">
                        {item.title}
                      </span>
                      <span className="block text-[11px] text-black/55">
                        {item.text}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <p
              className="-mt-2 px-5 text-center text-xs md:hidden"
              style={{ color: chosen.muted }}
              aria-live="polite"
            >
              <span className="font-bold" style={{ color: chosen.ink }}>
                {note + 1}. {NOTES[note].title}:
              </span>{' '}
              {NOTES[note].text.toLowerCase()}. Tap a number, drag to turn.
            </p>
            <div
              role="group"
              aria-label="Model"
              className="relative mt-3 flex gap-2 overflow-x-auto px-5 [scrollbar-width:none] md:absolute md:bottom-0 md:left-1/2 md:mt-0 md:w-max md:-translate-x-1/2 md:overflow-visible md:px-0"
            >
              {PRODUCTS.map((item) => {
                const picked = item.slug === slug;
                return (
                  <button
                    key={item.slug}
                    type="button"
                    aria-pressed={picked}
                    onClick={() => setSlug(item.slug)}
                    className="flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-bold transition-colors"
                    style={
                      picked
                        ? { backgroundColor: chosen.ink, color: chosen.stage }
                        : {
                            boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${chosen.ink} 25%, transparent)`,
                          }
                    }
                  >
                    {item.name}
                    <span className="font-semibold opacity-70">
                      {rm(item.price)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="md:self-center">
            <p className="text-sm font-bold">
              Colour{' '}
              <span className="font-normal" style={{ color: chosen.muted }}>
                {chosen.name}, {chosen.note.toLowerCase()}
              </span>
            </p>
            <div role="group" aria-label="Colour" className="mt-3 flex gap-2.5">
              {COLOURWAYS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={colour === item.id}
                  aria-label={`${item.name}, ${item.note}`}
                  title={item.name}
                  onClick={() => setColour(item.id)}
                  className="h-11 w-11 rounded-full p-[3px] transition-transform hover:scale-105"
                  style={{
                    boxShadow:
                      colour === item.id
                        ? `0 0 0 2px ${chosen.ink}`
                        : `0 0 0 1px color-mix(in srgb, ${chosen.ink} 22%, transparent)`,
                  }}
                >
                  <span
                    className="block h-full w-full rounded-full"
                    style={{ backgroundImage: swatchFill(item) }}
                  />
                </button>
              ))}
            </div>

            <div className="mt-5 [&_legend_span]:opacity-60">
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
              className="mt-4 inline-flex h-14 w-full items-center justify-center rounded-full text-base font-bold transition-transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-50"
              style={{ backgroundColor: chosen.cta, color: chosen.ctaInk }}
            >
              {size ? `Add to bag · ${rm(product.price)}` : 'Choose a size'}
            </button>
            <p
              className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs"
              style={{ color: chosen.muted }}
            >
              <span>
                Free delivery over {rm(FREE_DELIVERY_AT)}. 30-day returns,
                unworn.
              </span>
              <Link
                href={href}
                className="font-semibold underline underline-offset-4"
                style={{ color: chosen.ink }}
              >
                Full details
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
