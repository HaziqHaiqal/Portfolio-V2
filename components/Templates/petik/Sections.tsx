'use client';

import { useRef, useState, type FormEvent } from 'react';
import Image from 'next/image';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Clock,
  HandCoins,
  Leaf,
  ShieldCheck,
  Star,
} from 'lucide-react';
import { Reveal } from '@components/Templates/motion';
import { FEATURES, PRODUCTS, REASONS } from './data';
import ProductCard from './ProductCard';
import { BTN, CONTAINER, DISPLAY, HEADING, SectionIcon, SUB, TEXT } from './ui';

const CUT = '/templates/petik/cut';

/** A heap of the week's produce, the way a market basket looks from the side. */
function Basket({
  items,
}: {
  items: { src: string; w: number; h: number; className: string }[];
}) {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[460px]">
      <div className="absolute inset-[8%] rounded-full bg-tpl-tint/70" />
      {items.map((item) => (
        <Image
          key={item.src}
          src={item.src}
          alt=""
          width={item.w}
          height={item.h}
          className={`absolute drop-shadow-[0_10px_14px_rgba(0,0,0,0.12)] ${item.className}`}
        />
      ))}
    </div>
  );
}

export function About() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className={`${CONTAINER} grid items-center gap-12 md:grid-cols-2`}>
        <Reveal>
          <Basket
            items={[
              {
                src: `${CUT}/pineapple.webp`,
                w: 572,
                h: 900,
                className: 'left-[10%] top-[2%] h-[62%] w-auto',
              },
              {
                src: `${CUT}/banana.webp`,
                w: 900,
                h: 787,
                className: 'right-[6%] top-[14%] w-[44%] rotate-[18deg]',
              },
              {
                src: `${CUT}/papaya.webp`,
                w: 900,
                h: 341,
                className: 'left-[4%] top-[52%] w-[56%] -rotate-6',
              },
              {
                src: `${CUT}/mangosteen.webp`,
                w: 900,
                h: 458,
                className: 'right-[4%] top-[50%] w-[42%]',
              },
              {
                src: `${CUT}/strawberries.webp`,
                w: 900,
                h: 524,
                className: 'left-[30%] top-[68%] w-[30%] rotate-6',
              },
              {
                src: `${CUT}/lime.webp`,
                w: 900,
                h: 432,
                className: 'right-[14%] top-[72%] w-[28%]',
              },
            ]}
          />
        </Reveal>
        <Reveal delay={0.1}>
          <SectionIcon name="strawberries" />
          <h2 className={`${HEADING} mt-4 uppercase`}>
            Fresh from farms we know
          </h2>
          <p className={`${TEXT} mt-6`}>
            Petik buys from six growers in Cameron Highlands and a handful of
            smallholders across the peninsula. They pick in the afternoon, the
            lorry leaves the highlands at eleven at night, and your box is
            packed in Shah Alam before breakfast.
          </p>
          <p className={`${TEXT} mt-4`}>
            Every item in the shop is named with the farm it came from. When a
            farm has a bad week, the item comes off the list instead of coming
            from somewhere else.
          </p>
          <a href="#farms" className={`${BTN} mt-8`}>
            Read more
          </a>
        </Reveal>
      </div>
    </section>
  );
}

const FEATURE_ICONS = [
  { icon: Leaf, colour: 'bg-[#2E8B57]' },
  { icon: Clock, colour: 'bg-[#F4B400]' },
  { icon: HandCoins, colour: 'bg-[#EF6C25]' },
  { icon: ShieldCheck, colour: 'bg-[#E5395B]' },
];

export function Features() {
  return (
    <section className="bg-tpl-surface py-20 md:py-28">
      <div className={CONTAINER}>
        <Reveal>
          <p className={SUB}>Why Petik</p>
          <h2 className={`${HEADING} mt-3 max-w-[18ch] uppercase`}>
            Picked yesterday, at your door today
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {FEATURES.map((feature, index) => {
            const { icon: Icon, colour } = FEATURE_ICONS[index];
            return (
              <Reveal
                key={feature.title}
                delay={index * 0.08}
                className="relative"
              >
                <div className="flex items-center">
                  <span
                    className={`relative flex h-[100px] w-[100px] items-center justify-center rounded-full text-white ${colour}`}
                  >
                    <Icon size={40} strokeWidth={1.6} aria-hidden="true" />
                    <span className="absolute -left-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full bg-white text-[14px] font-semibold text-tpl-ink shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
                      {index + 1}
                    </span>
                  </span>
                  {index < FEATURES.length - 1 && (
                    <svg
                      viewBox="0 0 90 30"
                      aria-hidden="true"
                      className="ml-4 hidden w-20 text-neutral-300 lg:block"
                    >
                      <path
                        d="M2 22c20-18 50-20 80-6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeDasharray="5 5"
                      />
                      <path
                        d="M76 9l7 7-9 3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                  )}
                </div>
                <h3
                  className={`${DISPLAY} mt-7 text-[22px] font-medium uppercase leading-tight text-tpl-ink`}
                >
                  {feature.title}
                </h3>
                <p className={`${TEXT} mt-3`}>{feature.text}</p>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function Products() {
  const track = useRef<HTMLDivElement>(null);
  const featured = PRODUCTS.filter((product) => product.featured);
  const move = (direction: 1 | -1) => {
    const node = track.current;
    if (!node) return;
    const card = node.querySelector('li');
    node.scrollBy({
      left: direction * ((card?.clientWidth ?? 280) + 24),
      behavior: 'smooth',
    });
  };

  return (
    <section className="relative overflow-hidden bg-white py-20 md:py-28">
      <div className={CONTAINER}>
        <Reveal className="text-center">
          <SectionIcon name="cherrytomatoes" className="mx-auto" />
          <h2 className={`${HEADING} mt-4`}>Our Products</h2>
          <p className={`${TEXT} mx-auto mt-4 max-w-[52ch]`}>
            This week&apos;s best from the highlands and the lowlands, priced
            per kilo, pack or bunch.
          </p>
        </Reveal>

        <div className="relative mt-12">
          <div
            ref={track}
            className="-mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 pb-4 [scrollbar-width:none] sm:-mx-6 sm:px-6"
          >
            <ul className="flex gap-6">
              {featured.map((product) => (
                <li
                  key={product.id}
                  className="w-[72vw] shrink-0 snap-start sm:w-[calc((100vw-6rem)/2.2)] lg:w-[270px]"
                >
                  <ProductCard product={product} />
                </li>
              ))}
            </ul>
          </div>
          {(
            [
              [-1, ChevronLeft, '-left-5'],
              [1, ChevronRight, '-right-5'],
            ] as const
          ).map(([direction, Icon, side]) => (
            <button
              key={direction}
              type="button"
              onClick={() => move(direction)}
              aria-label={direction < 0 ? 'Previous products' : 'Next products'}
              className={`absolute top-[38%] hidden h-12 w-12 items-center justify-center rounded-full bg-white text-tpl-ink shadow-[0_2px_12px_rgba(0,0,0,0.12)] transition-colors hover:bg-tpl-accent hover:text-white xl:flex ${side}`}
            >
              <Icon size={22} aria-hidden="true" />
            </button>
          ))}
        </div>

        <div className="mt-10 text-center">
          <a href="#shop" className={BTN}>
            View more
          </a>
        </div>
      </div>
    </section>
  );
}

export function WhyUs() {
  return (
    <section className="bg-white pb-20 md:pb-28">
      <div className={`${CONTAINER} grid items-center gap-12 md:grid-cols-2`}>
        <Reveal>
          <SectionIcon name="lime" />
          <h2 className={`${HEADING} mt-4 uppercase`}>Why choose us</h2>
          <p className={`${TEXT} mt-5`}>
            A supermarket box has usually travelled for days. Ours travels for
            one night, and you can see on every item where it grew.
          </p>
          <ul className="mt-8 space-y-6">
            {REASONS.map((reason) => (
              <li key={reason} className="flex gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-tpl-accent text-tpl-accent">
                  <Star size={16} aria-hidden="true" />
                </span>
                <p className={TEXT}>{reason}</p>
              </li>
            ))}
          </ul>
          <a href="#farms" className={`${BTN} mt-9`}>
            Read more
          </a>
        </Reveal>
        <Reveal delay={0.1}>
          <Basket
            items={[
              {
                src: `${CUT}/pineapple.webp`,
                w: 572,
                h: 900,
                className: 'right-[14%] top-[0%] h-[74%] w-auto',
              },
              {
                src: `${CUT}/capsicum.webp`,
                w: 900,
                h: 886,
                className: 'left-[8%] top-[18%] w-[34%] -rotate-12',
              },
              {
                src: `${CUT}/cherrytomatoes.webp`,
                w: 900,
                h: 767,
                className: 'left-[6%] top-[56%] w-[40%]',
              },
              {
                src: `${CUT}/pakchoy.webp`,
                w: 900,
                h: 749,
                className: 'right-[2%] top-[58%] w-[44%] rotate-6',
              },
              {
                src: `${CUT}/eggs.webp`,
                w: 561,
                h: 483,
                className: 'left-[44%] top-[72%] w-[18%]',
              },
            ]}
          />
        </Reveal>
      </div>
    </section>
  );
}

export function Newsletter() {
  const [done, setDone] = useState(false);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    setDone(true);
  };
  return (
    <section className="relative overflow-hidden bg-tpl-line py-20 md:py-24">
      <Image
        src={`${CUT}/rambutan.webp`}
        alt=""
        width={900}
        height={468}
        className="pointer-events-none absolute -left-10 bottom-4 hidden w-56 opacity-90 md:block"
      />
      <Image
        src={`${CUT}/carrots.webp`}
        alt=""
        width={900}
        height={459}
        className="pointer-events-none absolute -right-8 top-6 hidden w-60 rotate-12 opacity-90 md:block"
      />
      <div className={`${CONTAINER} relative text-center`}>
        <p className="text-[14px] text-tpl-ink/80">
          Get the harvest list every Monday night.
        </p>
        <h2
          className={`${DISPLAY} mt-3 text-[clamp(1.9rem,3.6vw,2.75rem)] font-medium uppercase leading-tight text-tpl-ink`}
        >
          Know what&apos;s fresh first
        </h2>
        <form
          onSubmit={submit}
          className="mx-auto mt-8 flex max-w-[560px] items-center gap-2 rounded-full bg-white p-2 shadow-[0_6px_24px_rgba(0,0,0,0.06)]"
        >
          <label htmlFor="petik-email" className="sr-only">
            Email address
          </label>
          <input
            id="petik-email"
            type="email"
            required
            placeholder="Enter your email"
            className="h-12 min-w-0 flex-1 bg-transparent px-5 text-[14px] text-tpl-ink outline-none placeholder:text-tpl-muted"
          />
          <button
            type="submit"
            className={`${DISPLAY} inline-flex h-12 shrink-0 items-center gap-2 rounded-full bg-[#EF8829] px-7 text-[13px] font-medium uppercase tracking-[1px] text-white transition hover:brightness-95`}
          >
            Subscribe
            <ArrowRight
              size={15}
              aria-hidden="true"
              className="hidden sm:block"
            />
          </button>
        </form>
        <p aria-live="polite" className="mt-5 text-[14px] text-tpl-ink/80">
          {done
            ? 'Thank you. The next list arrives on Monday night.'
            : 'One email a week. Unsubscribe any time.'}
        </p>
      </div>
    </section>
  );
}
