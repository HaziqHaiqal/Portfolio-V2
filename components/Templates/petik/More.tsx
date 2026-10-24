'use client';

import { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Mail,
  MapPin,
  Phone,
  Quote,
} from 'lucide-react';
import { SiFacebook, SiInstagram, SiTiktok } from 'react-icons/si';
import { Reveal } from '@components/Templates/motion';
import OrderPreview from '../OrderPreview';
import {
  BRAND,
  CUT_SOURCES,
  EMAIL,
  PHONE,
  PICTURES,
  REVIEWS,
  TIPS,
  type PictureId,
} from './data';
import { Logo } from './Header';
import Pic from './Pic';
import {
  BTN,
  CONTAINER,
  DISPLAY,
  HEADING,
  ORANGE,
  SectionIcon,
  SUB,
  TEXT,
} from './ui';

const CUT = '/templates/petik/cut';

export function Farms() {
  const photos: { id: PictureId; caption: string }[] = [
    { id: 'tea', caption: 'Tea terraces, Brinchang' },
    { id: 'kampungraja', caption: 'Vegetable plots, Kampung Raja' },
    { id: 'keafarm', caption: 'The Kea Farm market' },
    { id: 'strawfarm', caption: 'Strawberry beds, Taman Sedia' },
  ];
  return (
    <section id="farms" className="scroll-mt-28 bg-white py-20 md:py-28">
      <div
        className={`${CONTAINER} grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]`}
      >
        <Reveal>
          <SectionIcon name="springonion" />
          <h2 className={`${HEADING} mt-4`}>Our Farms</h2>
          <p className={`${TEXT} mt-5`}>
            Most of the list grows in Cameron Highlands: greens and tomatoes at
            Kea Farm and Kampung Raja, strawberries in Tanah Rata and Taman
            Sedia. The fruit comes from smallholders in Raub, Muar and Kluang,
            and the eggs from a kampung farm in Tanjung Karang.
          </p>
          <p className={`${TEXT} mt-4`}>
            We pay growers the week they deliver, and we only buy what they have
            picked that day.
          </p>
          <a href="#shop" className={`${BTN} mt-8`}>
            Shop the harvest
          </a>
        </Reveal>
        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          {photos.map((photo, index) => (
            <Reveal key={photo.id} delay={index * 0.06}>
              <figure>
                <div className="relative aspect-[4/5] overflow-hidden rounded-[10px]">
                  <Pic
                    picture={PICTURES[photo.id]}
                    fill
                    sizes="(min-width: 1024px) 300px, 45vw"
                    className="object-cover transition-transform duration-700 hover:scale-105"
                  />
                </div>
                <figcaption className="mt-2 text-[13px] text-tpl-muted">
                  {photo.caption}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const NUMBERS = [
  { value: '18 hrs', label: 'From picking to your door' },
  { value: '6 farms', label: 'In Cameron Highlands' },
  { value: '3 slots', label: 'Tuesday to Sunday' },
];

export function Numbers() {
  return (
    <section className="relative overflow-hidden bg-[#192018] py-20 text-white md:py-28">
      <div className="absolute inset-0 opacity-35">
        <Pic
          picture={PICTURES.tea}
          alt=""
          fill
          sizes="100vw"
          className="petik-drift object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-[#192018]/55" />
      <div className={`${CONTAINER} relative text-center`}>
        <p
          className="text-[13px] font-semibold uppercase tracking-[2px]"
          style={{ color: ORANGE }}
        >
          From farm to door
        </p>
        <h2
          className={`${DISPLAY} mx-auto mt-4 max-w-[22ch] text-[clamp(1.9rem,3.6vw,2.9rem)] font-medium uppercase leading-tight`}
        >
          Picked in the highlands, at your door by breakfast
        </h2>
        <dl className="mx-auto mt-12 grid max-w-[880px] gap-8 rounded-[10px] bg-tpl-line px-6 py-10 text-tpl-ink sm:grid-cols-3">
          {NUMBERS.map((item) => (
            <div key={item.label}>
              <dt className="sr-only">{item.label}</dt>
              <dd>
                <span
                  className={`${DISPLAY} block text-[40px] font-medium leading-none`}
                >
                  {item.value}
                </span>
                <span className="mt-2 block text-[14px] text-tpl-muted">
                  {item.label}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export function Reviews() {
  const [index, setIndex] = useState(0);
  const review = REVIEWS[index];
  const go = (step: number) =>
    setIndex((index + step + REVIEWS.length) % REVIEWS.length);
  return (
    <section className="bg-white py-20 md:py-28">
      <div className={`${CONTAINER} text-center`}>
        <Reveal>
          <SectionIcon name="banana" className="mx-auto" />
          <h2 className={`${HEADING} mt-4 uppercase`}>Customers say</h2>
          <p className={`${TEXT} mx-auto mt-4 max-w-[52ch]`}>
            What people across the Klang Valley tell us after their first box.
          </p>
        </Reveal>
        <div className="relative mx-auto mt-12 max-w-[820px]">
          <span
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2"
            style={{ borderColor: ORANGE, color: ORANGE }}
          >
            <Quote size={22} aria-hidden="true" />
          </span>
          <blockquote
            key={index}
            className="petik-fade mt-8 text-[clamp(1.2rem,2.2vw,1.6rem)] italic leading-[1.6] text-tpl-ink"
          >
            &ldquo;{review.text}&rdquo;
          </blockquote>
          <p className={`${DISPLAY} mt-6 text-[17px] font-medium text-tpl-ink`}>
            {review.name}
          </p>
          <p className="text-[14px]" style={{ color: ORANGE }}>
            {review.place}
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous review"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 text-tpl-ink transition-colors hover:border-tpl-accent hover:bg-tpl-accent hover:text-white"
            >
              <ChevronLeft size={20} aria-hidden="true" />
            </button>
            <div className="flex gap-2">
              {REVIEWS.map((item, dot) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setIndex(dot)}
                  aria-label={`Review ${dot + 1}`}
                  aria-current={dot === index}
                  className={`h-2.5 rounded-full transition-all ${dot === index ? 'w-6 bg-tpl-accent' : 'w-2.5 bg-neutral-300'}`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next review"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 text-tpl-ink transition-colors hover:border-tpl-accent hover:bg-tpl-accent hover:text-white"
            >
              <ChevronRight size={20} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Tips() {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <section id="tips" className="bg-tpl-surface py-20 md:py-28">
      <div className={CONTAINER}>
        <Reveal className="text-center">
          <SectionIcon name="capsicum" className="mx-auto" />
          <h2 className={`${HEADING} mt-4 uppercase`}>Recipes & tips</h2>
          <p className={`${TEXT} mx-auto mt-4 max-w-[52ch]`}>
            Small things that make this week&apos;s box last longer and taste
            better.
          </p>
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {TIPS.map((tip, index) => {
            const expanded = open === tip.title;
            return (
              <Reveal key={tip.title} delay={index * 0.08}>
                <article className="flex h-full flex-col overflow-hidden rounded-[10px] bg-white shadow-[0_2px_14px_rgba(0,0,0,0.05)]">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Pic
                      picture={PICTURES[tip.picture]}
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="object-cover transition-transform duration-700 hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <p className="text-[13px] text-tpl-muted">
                      {tip.date}, {tip.read}
                    </p>
                    <h3
                      className={`${DISPLAY} mt-3 text-[18px] font-medium uppercase leading-snug text-tpl-ink`}
                    >
                      {tip.title}
                    </h3>
                    <p className={`${TEXT} mt-2`}>
                      {expanded ? tip.body : tip.excerpt}
                    </p>
                    <div className="mt-auto pt-5">
                      <button
                        type="button"
                        onClick={() => setOpen(expanded ? null : tip.title)}
                        aria-expanded={expanded}
                        className={`${DISPLAY} rounded-full border border-neutral-200 px-6 py-2.5 text-[12px] font-medium uppercase tracking-[1px] text-tpl-ink transition-colors hover:border-tpl-accent hover:bg-tpl-accent hover:text-white`}
                      >
                        {expanded ? 'Show less' : 'Read more'}
                      </button>
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  const [ask, setAsk] = useState(false);
  const credits = [
    ...Object.values(PICTURES).map((picture) => picture.credit),
    ...CUT_SOURCES,
  ];
  const gallery: PictureId[] = [
    'strawberries',
    'tomatoes',
    'keafarm',
    'mangosteen',
    'kampungraja',
    'eggs',
  ];
  const heading = `${DISPLAY} text-[17px] font-medium uppercase text-tpl-ink`;
  const rule = 'mt-3 block h-0.5 w-10 rounded-full';
  return (
    <footer className="bg-tpl-line pt-16 text-tpl-ink md:pt-20">
      <div
        className={`${CONTAINER} grid gap-10 pb-12 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1.2fr_1.2fr]`}
      >
        <div>
          <Logo />
          <p className={`${TEXT} mt-5 max-w-xs`}>
            Fruit and vegetables from Malaysian farms, picked the day before and
            delivered across the Klang Valley.
          </p>
          <div className="mt-5 flex gap-2.5">
            {[SiInstagram, SiFacebook, SiTiktok].map((Icon, index) => (
              <span
                key={index}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-tpl-accent text-tpl-accent"
              >
                <Icon size={15} aria-hidden="true" />
              </span>
            ))}
          </div>
        </div>
        <div>
          <h2 className={heading}>Customer support</h2>
          <span className={rule} style={{ backgroundColor: ORANGE }} />
          <ul className="mt-5 space-y-3 text-[14px] text-tpl-muted">
            <li>
              <a href="#shop" className="hover:text-tpl-accent">
                Shop the harvest
              </a>
            </li>
            <li>
              <a href="#farms" className="hover:text-tpl-accent">
                Our farms
              </a>
            </li>
            <li>
              <a href="#tips" className="hover:text-tpl-accent">
                Recipes & tips
              </a>
            </li>
            <li>
              <button
                type="button"
                onClick={() => setAsk(true)}
                className="hover:text-tpl-accent"
              >
                Delivery and refunds
              </button>
            </li>
          </ul>
        </div>
        <div>
          <h2 className={heading}>Contact info</h2>
          <span className={rule} style={{ backgroundColor: ORANGE }} />
          <ul className="mt-5 space-y-4 text-[14px] text-tpl-muted">
            <li className="flex gap-3">
              <MapPin
                size={17}
                aria-hidden="true"
                className="mt-0.5 shrink-0"
                style={{ color: ORANGE }}
              />
              Packing room, Lot 12, Jalan Utas 15/7, Shah Alam
            </li>
            <li className="flex gap-3">
              <Mail
                size={17}
                aria-hidden="true"
                className="mt-0.5 shrink-0"
                style={{ color: ORANGE }}
              />
              <a href={`mailto:${EMAIL}`} className="hover:text-tpl-accent">
                {EMAIL}
              </a>
            </li>
            <li className="flex gap-3">
              <Phone
                size={17}
                aria-hidden="true"
                className="mt-0.5 shrink-0"
                style={{ color: ORANGE }}
              />
              <button
                type="button"
                onClick={() => setAsk(true)}
                className="hover:text-tpl-accent"
              >
                {PHONE}
              </button>
            </li>
          </ul>
        </div>
        <div>
          <h2 className={heading}>Our gallery</h2>
          <span className={rule} style={{ backgroundColor: ORANGE }} />
          <ul className="mt-5 grid grid-cols-3 gap-2">
            {gallery.map((id) => (
              <li
                key={id}
                className="relative aspect-square overflow-hidden rounded-md"
              >
                <Pic
                  picture={PICTURES[id]}
                  fill
                  sizes="90px"
                  className="object-cover"
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-black/5">
        <div
          className={`${CONTAINER} flex flex-col gap-4 py-6 text-[13px] text-tpl-muted md:flex-row md:items-start md:justify-between`}
        >
          <p>
            © 2026 {BRAND}. Orders close at 10 pm, deliveries Tuesday to Sunday.
          </p>
          <details className="md:max-w-md">
            <summary className="cursor-pointer list-none hover:text-tpl-accent">
              Photo credits
            </summary>
            <ul className="mt-2 space-y-1 text-[12px] leading-snug">
              {credits.map((credit) => (
                <li key={credit.page + credit.title}>
                  <a
                    href={credit.page}
                    target="_blank"
                    rel="noreferrer"
                    className="underline-offset-2 hover:underline"
                  >
                    {credit.title}
                  </a>
                  , {credit.creator}, {credit.licence}
                </li>
              ))}
              <li>Product cut-outs are edited from these originals.</li>
            </ul>
          </details>
          <ul className="flex gap-2">
            {['DuitNow', 'Bank transfer', 'Cash'].map((method) => (
              <li
                key={method}
                className="rounded-md bg-white px-2.5 py-1 text-[12px] font-semibold text-tpl-ink"
              >
                {method}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <OrderPreview
        open={ask}
        message={`Hi ${BRAND}! I have a question about delivery.`}
        onClose={() => setAsk(false)}
      />
    </footer>
  );
}
