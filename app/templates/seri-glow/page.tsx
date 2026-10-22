import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { Sparkle, Star } from 'lucide-react';
import { SiInstagram, SiTiktok, SiWhatsapp } from 'react-icons/si';
import DemoBar from '@components/Templates/DemoBar';
import Photo from '@components/Templates/Photo';
import SiteHeader from '@components/Templates/SiteHeader';
import WhatsAppButton from '@components/Templates/WhatsAppButton';
import { PaletteRoot } from '@components/Templates/Palette';
import {
  BagButton,
  BagProvider,
  MobileBagBar,
} from '@components/Templates/Bag';
import {
  Marquee,
  ParallaxPhoto,
  RevealText,
} from '@components/Templates/motion';
import Shop from '@components/Templates/seri-glow/Shop';
import {
  HeroProductCard,
  IngredientStory,
  Newsletter,
  RoutineSet,
} from '@components/Templates/seri-glow/Extras';
import {
  BRAND,
  FAQS,
  FREE_POSTAGE_AT,
  PHOTOS,
  REVIEWS,
} from '@components/Templates/seri-glow/data';

const font = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--tpl-font' });

export const metadata: Metadata = {
  title: BRAND,
  description:
    'Skincare shop template with quick view, bag and WhatsApp checkout.',
};

const LINKS = [
  { href: '#shop', label: 'Shop' },
  { href: '#ingredients', label: 'Ingredients' },
  { href: '#reviews', label: 'Reviews' },
  { href: '#faq', label: 'FAQ' },
];

const PERKS = [
  `Free postage above RM${FREE_POSTAGE_AT}`,
  'Halal-certified ingredients',
  'Fragrance-free',
  'Posted in 1 working day',
];

function InlinePhoto({ src }: { src: string }) {
  return (
    <span className="relative mx-[0.08em] inline-block h-[0.78em] w-[1.5em] translate-y-[0.06em] overflow-hidden rounded-full align-baseline">
      <Photo src={src} alt="" fill sizes="200px" className="object-cover" />
    </span>
  );
}

export default function SeriGlowPage() {
  return (
    <PaletteRoot slug="seri-glow" className={font.variable}>
      <DemoBar slug="seri-glow" />
      <BagProvider
        brand={BRAND}
        freeShippingAt={FREE_POSTAGE_AT}
        note="Delivery and payment details are confirmed on WhatsApp."
      >
        <Marquee
          duration={30}
          className="bg-tpl-accent py-2 text-xs font-medium text-tpl-on-accent"
        >
          {PERKS.map((perk) => (
            <span key={perk} className="flex items-center gap-6 pr-6">
              {perk}
              <Sparkle size={12} aria-hidden="true" />
            </span>
          ))}
        </Marquee>

        <SiteHeader
          links={LINKS}
          brand={
            <a href="#top" className="text-xl font-semibold tracking-tight">
              seri glow
            </a>
          }
        >
          <BagButton className="-mr-2" />
        </SiteHeader>

        <main id="top">
          <section className="mx-auto max-w-[90rem] px-5 pb-10 pt-14 md:px-8 md:pb-14 md:pt-20">
            <h1 className="text-[13vw] font-semibold leading-[0.95] tracking-[-0.05em] md:text-[8.2vw]">
              <span className="block">
                Skin that <InlinePhoto src={PHOTOS.pSerum} /> glows,
              </span>
              <span className="block">
                even in the <InlinePhoto src={PHOTOS.texture} /> heat.
              </span>
            </h1>
            <div className="mt-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <p className="max-w-md text-lg leading-relaxed text-tpl-muted">
                Lightweight skincare made in Malaysia for humid days.
                Fragrance-free, halal-certified and kind to sensitive skin.
              </p>
              <div className="flex items-center gap-6">
                <a
                  href="#shop"
                  className="inline-flex h-14 items-center rounded-full bg-tpl-accent px-8 text-sm font-semibold text-tpl-on-accent transition-transform hover:-translate-y-0.5"
                >
                  Shop bestsellers
                </a>
                <p className="flex items-center gap-2 text-sm">
                  <Star
                    size={16}
                    aria-hidden="true"
                    className="fill-tpl-accent text-tpl-accent"
                  />
                  <span className="font-semibold">4.9</span>
                  <span className="text-tpl-muted">2,140 reviews</span>
                </p>
              </div>
            </div>
          </section>

          <div className="relative">
            <ParallaxPhoto
              src={PHOTOS.hero}
              alt="Smiling woman holding a Glow Serum bottle"
              sizes="100vw"
              priority
              className="h-[70svh] md:h-[88vh]"
            />
            <HeroProductCard />
          </div>

          <section
            id="shop"
            className="mx-auto max-w-[90rem] scroll-mt-20 px-5 py-24 md:px-8 md:py-36"
          >
            <h2 className="mb-10 text-5xl font-semibold tracking-[-0.04em] md:text-7xl">
              <RevealText text="Bestsellers" onView />
            </h2>
            <Shop />
          </section>

          <section
            id="ingredients"
            className="mx-auto max-w-[90rem] scroll-mt-20 px-5 md:px-8"
          >
            <h2 className="max-w-3xl text-5xl font-semibold tracking-[-0.04em] md:text-7xl">
              <RevealText text="Short ingredient lists. Real results." onView />
            </h2>
            <div className="mt-8 md:mt-0">
              <IngredientStory />
            </div>
          </section>

          <section className="mt-16 bg-tpl-tint md:mt-24">
            <div className="mx-auto grid max-w-[90rem] items-center gap-10 px-5 py-20 md:grid-cols-2 md:gap-20 md:px-8 md:py-28">
              <ParallaxPhoto
                src={PHOTOS.modelGlow}
                alt="Woman with glowing skin"
                sizes="(min-width: 768px) 50vw, 100vw"
                className="aspect-[4/5] rounded-[2rem]"
              />
              <RoutineSet />
            </div>
          </section>

          <section id="reviews" className="scroll-mt-20 py-24 md:py-32">
            <div className="mx-auto mb-12 flex max-w-[90rem] flex-wrap items-end justify-between gap-4 px-5 md:px-8">
              <h2 className="text-5xl font-semibold tracking-[-0.04em] md:text-7xl">
                <RevealText text="Loved in the heat." onView />
              </h2>
              <p className="text-tpl-muted">
                4.9 average from 2,140 verified buyers
              </p>
            </div>
            <Marquee duration={50}>
              {REVIEWS.map((review) => (
                <figure
                  key={review.name}
                  className="flex w-[22rem] shrink-0 flex-col pr-12 md:w-[30rem]"
                >
                  <blockquote className="text-2xl font-medium leading-snug tracking-tight md:text-3xl">
                    “{review.text}”
                  </blockquote>
                  <figcaption className="mt-6 flex items-center gap-3 text-sm">
                    <span className="relative h-10 w-10 overflow-hidden rounded-full bg-tpl-tint">
                      <Photo
                        src={review.photo}
                        alt=""
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    </span>
                    <span>
                      <span className="block font-semibold">
                        {review.name}, {review.place}
                      </span>
                      <span className="text-tpl-muted">
                        {review.skin}, bought {review.bought}
                      </span>
                    </span>
                  </figcaption>
                </figure>
              ))}
            </Marquee>
          </section>

          <section
            id="faq"
            className="mx-auto max-w-[90rem] scroll-mt-20 px-5 pb-24 md:px-8 md:pb-32"
          >
            <div className="grid gap-10 lg:grid-cols-[1fr_1.5fr] lg:gap-20">
              <div>
                <h2 className="text-5xl font-semibold tracking-[-0.04em] md:text-6xl">
                  <RevealText text="Good to know" onView />
                </h2>
                <WhatsAppButton
                  message={`Hi ${BRAND}! Can you help me choose products for my skin?\nSkin type:\nMain concern:`}
                  className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-tpl-ink px-6 text-sm font-semibold text-tpl-bg"
                >
                  Ask us on WhatsApp
                </WhatsAppButton>
              </div>
              <div className="border-t border-tpl-line">
                {FAQS.map((faq) => (
                  <details
                    key={faq.question}
                    className="group border-b border-tpl-line"
                  >
                    <summary className="flex min-h-20 cursor-pointer list-none items-center justify-between gap-6 text-xl font-medium tracking-tight [&::-webkit-details-marker]:hidden">
                      {faq.question}
                      <span
                        aria-hidden="true"
                        className="text-3xl font-light text-tpl-accent transition-transform duration-300 group-open:rotate-45"
                      >
                        +
                      </span>
                    </summary>
                    <p className="max-w-xl pb-8 text-lg leading-relaxed text-tpl-muted">
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </section>
        </main>

        <footer className="overflow-hidden bg-tpl-ink px-5 pb-24 pt-20 text-tpl-bg md:px-8 md:pb-10">
          <div className="mx-auto grid max-w-[90rem] gap-10 md:grid-cols-2">
            <div>
              <p className="text-2xl font-semibold tracking-tight">
                Get 10% off your first order
              </p>
              <p className="mt-2 opacity-70">
                Routines, restocks and member-only bundles.
              </p>
            </div>
            <div className="md:justify-self-end">
              <Newsletter />
            </div>
          </div>
          <p
            aria-hidden="true"
            className="mx-auto mt-20 max-w-[90rem] whitespace-nowrap text-[23vw] font-semibold leading-[0.8] tracking-[-0.07em]"
          >
            seri glow
          </p>
          <div className="mx-auto mt-10 flex max-w-[90rem] flex-wrap items-center justify-between gap-4 text-xs opacity-70">
            <p>© {BRAND}. Demo content for template preview.</p>
            <div className="flex gap-2">
              {[
                { icon: SiInstagram, label: 'Instagram' },
                { icon: SiTiktok, label: 'TikTok' },
                { icon: SiWhatsapp, label: 'WhatsApp' },
              ].map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  aria-label={label}
                  className="border-current/30 flex h-10 w-10 items-center justify-center rounded-full border"
                >
                  <Icon size={15} aria-hidden="true" />
                </span>
              ))}
            </div>
          </div>
        </footer>

        <MobileBagBar />
      </BagProvider>
    </PaletteRoot>
  );
}
