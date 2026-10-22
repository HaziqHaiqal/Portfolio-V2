'use client';

import { useRef, useState } from 'react';
import {
  AnimatePresence,
  m,
  useMotionValueEvent,
  useScroll,
} from 'framer-motion';
import { ArrowRight, Check, Plus } from 'lucide-react';
import Photo from '@components/Templates/Photo';
import { rm, useBag } from '@components/Templates/Bag';
import { Rating } from './Shop';
import { GLOW_SET, INGREDIENTS, ROUTINE, product } from './data';

export function HeroProductCard() {
  const { add } = useBag();
  const serum = product('glow-serum');

  return (
    <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 rounded-2xl bg-tpl-bg/95 p-3 shadow-2xl backdrop-blur sm:left-auto sm:right-5 sm:w-80">
      <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-xl bg-tpl-tint">
        <Photo
          src={serum.image}
          alt=""
          fill
          sizes="56px"
          className="object-cover"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{serum.name}</p>
        <div className="mt-0.5 flex items-center gap-2">
          <span className="text-sm font-semibold">{rm(serum.price)}</span>
          <Rating rating={serum.rating} />
        </div>
      </div>
      <button
        type="button"
        onClick={() => add(serum)}
        aria-label={`Add ${serum.name} to bag`}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-tpl-accent text-tpl-on-accent transition-transform hover:scale-105"
      >
        <Plus size={18} aria-hidden="true" />
      </button>
    </div>
  );
}

export function RoutineSet() {
  const { add } = useBag();
  const items = ROUTINE.map((step) => ({ ...step, product: product(step.id) }));
  const separately = items.reduce((sum, item) => sum + item.product.price, 0);

  return (
    <div className="flex flex-col justify-center">
      <span className="w-fit rounded-full bg-tpl-tint px-3 py-1 text-xs font-semibold text-tpl-accent">
        Save {rm(separately - GLOW_SET.price)}
      </span>
      <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
        The Glow Routine
      </h2>
      <p className="mt-3 max-w-md text-lg text-tpl-muted">
        Three steps, under two minutes. Everything your skin needs for a hot
        day.
      </p>
      <ol className="mt-8 border-t border-tpl-line">
        {items.map((item, index) => (
          <li
            key={item.id}
            className="flex items-center gap-4 border-b border-tpl-line py-4"
          >
            <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded-xl bg-tpl-tint">
              <Photo
                src={item.product.image}
                alt=""
                fill
                sizes="48px"
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-tpl-accent">
                Step {index + 1}, {item.step.toLowerCase()}
              </p>
              <p className="font-semibold">{item.product.name}</p>
            </div>
            <p className="pr-2 text-sm tabular-nums text-tpl-muted">
              {rm(item.product.price)}
            </p>
          </li>
        ))}
      </ol>
      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
        <p className="text-3xl font-semibold">
          {rm(GLOW_SET.price)}
          <s className="ml-2 text-lg font-normal text-tpl-muted">
            {rm(separately)}
          </s>
        </p>
        <button
          type="button"
          onClick={() => add(GLOW_SET)}
          className="inline-flex h-12 items-center gap-2 rounded-full bg-tpl-accent px-6 text-sm font-semibold text-tpl-on-accent transition-opacity hover:opacity-90"
        >
          Add the set to bag
          <ArrowRight size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

export function Newsletter() {
  const [joined, setJoined] = useState(false);

  if (joined) {
    return (
      <p className="flex h-12 items-center gap-2 text-sm font-semibold">
        <Check size={18} aria-hidden="true" className="text-tpl-accent" />
        You are on the list. Check your inbox for 10% off.
      </p>
    );
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setJoined(true);
      }}
      className="flex w-full max-w-md gap-2"
    >
      <label htmlFor="sg-email" className="sr-only">
        Email address
      </label>
      <input
        id="sg-email"
        type="email"
        required
        placeholder="Your email"
        className="border-current/25 h-12 min-w-0 flex-1 rounded-full border bg-transparent px-5 text-sm outline-none transition-colors placeholder:text-current placeholder:opacity-50 focus:border-current"
      />
      <button
        type="submit"
        className="h-12 shrink-0 rounded-full bg-tpl-accent px-6 text-sm font-semibold text-tpl-on-accent"
      >
        Join
      </button>
    </form>
  );
}

/** Pinned photo that changes as each ingredient scrolls past. */
export function IngredientStory() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start center', 'end center'],
  });
  useMotionValueEvent(scrollYProgress, 'change', (value) =>
    setActive(
      Math.min(INGREDIENTS.length - 1, Math.floor(value * INGREDIENTS.length))
    )
  );

  return (
    <div ref={ref} className="grid gap-10 md:grid-cols-2 md:gap-16">
      <div className="relative hidden md:block">
        <div className="sticky top-24 aspect-[4/5] overflow-hidden rounded-[2rem]">
          <AnimatePresence initial={false}>
            <m.div
              key={active}
              initial={{ opacity: 0, scale: 1.06 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              <Photo
                src={INGREDIENTS[active].image}
                alt=""
                fill
                sizes="50vw"
                className="object-cover"
              />
            </m.div>
          </AnimatePresence>
        </div>
      </div>
      <ol>
        {INGREDIENTS.map((item, index) => (
          <li
            key={item.name}
            className="flex min-h-[60vh] flex-col justify-center border-t border-tpl-line py-12 first:border-0 md:min-h-[80vh]"
          >
            <div className="relative mb-6 aspect-[4/3] overflow-hidden rounded-3xl md:hidden">
              <Photo
                src={item.image}
                alt=""
                fill
                sizes="100vw"
                className="object-cover"
              />
            </div>
            <p
              className={`text-[22vw] font-semibold leading-none tracking-[-0.06em] transition-colors duration-500 md:text-[9rem] ${
                active === index ? 'text-tpl-accent' : 'text-tpl-line'
              }`}
            >
              {item.figure}
            </p>
            <p className="mt-4 text-3xl font-semibold tracking-tight">
              {item.name}
            </p>
            <p className="mt-3 max-w-sm text-lg leading-relaxed text-tpl-muted">
              {item.text}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
