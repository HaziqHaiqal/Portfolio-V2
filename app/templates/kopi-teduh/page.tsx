import type { Metadata } from 'next';
import { Bricolage_Grotesque } from 'next/font/google';
import { ArrowUpRight, Coffee, Star } from 'lucide-react';
import { SiInstagram, SiWhatsapp } from 'react-icons/si';
import DemoBar from '@components/Templates/DemoBar';
import Photo from '@components/Templates/Photo';
import SiteHeader from '@components/Templates/SiteHeader';
import WhatsAppButton from '@components/Templates/WhatsAppButton';
import { PaletteRoot } from '@components/Templates/Palette';
import {
  HeroPhoto,
  HorizontalScroll,
  Marquee,
  RevealText,
  Reveal,
} from '@components/Templates/motion';
import {
  HoursList,
  Menu,
  OpenStatus,
} from '@components/Templates/kopi-teduh/Live';
import {
  BRAND,
  GALLERY,
  ORDER_MESSAGE,
  PHOTOS,
  REVIEWS,
} from '@components/Templates/kopi-teduh/data';

const font = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--tpl-font',
  axes: ['opsz'],
});

export const metadata: Metadata = {
  title: BRAND,
  description:
    'Café template with a live open status, photo menu and WhatsApp pickup orders.',
};

const LINKS = [
  { href: '#menu', label: 'Menu' },
  { href: '#space', label: 'The space' },
  { href: '#visit', label: 'Visit' },
];

const MARQUEE = ['Kopi', 'Teh tarik', 'Nasi lemak', 'Roti bakar', 'Roti tisu'];

export default function KopiTeduhPage() {
  return (
    <PaletteRoot slug="kopi-teduh" className={font.variable}>
      <DemoBar slug="kopi-teduh" />
      <SiteHeader
        overlay
        links={LINKS}
        brand={
          <a
            href="#top"
            className="flex items-center gap-2 text-lg font-semibold tracking-tight"
          >
            <Coffee size={20} aria-hidden="true" />
            Kopi Teduh
          </a>
        }
      >
        <WhatsAppButton
          message={ORDER_MESSAGE}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-tpl-accent px-4 text-sm font-semibold text-tpl-on-accent"
        >
          Order
        </WhatsAppButton>
      </SiteHeader>

      <main id="top">
        <section className="relative flex h-[calc(100svh-3rem)] min-h-[36rem] items-end overflow-hidden bg-black text-white">
          <HeroPhoto
            src={PHOTOS.interior}
            alt="Sunlit café seating with rattan chairs and plants"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/30" />
          <div className="relative mx-auto w-full max-w-[90rem] px-5 pb-12 md:px-8 md:pb-16">
            <OpenStatus className="rounded-full bg-white/15 px-3.5 py-1.5 text-sm font-medium backdrop-blur" />
            <h1 className="mt-6 max-w-5xl text-[15vw] font-semibold leading-[0.88] tracking-[-0.05em] md:text-[8.5vw]">
              <RevealText text="Kopi pekat, nasi lemak panas." delay={0.3} />
            </h1>
            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-5">
              <p className="max-w-sm text-lg text-white/80">
                A shady kopitiam in Bangsar. Thick kopi and slow mornings since
                2016.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="#menu"
                  className="inline-flex h-12 items-center rounded-full bg-white px-6 text-sm font-semibold text-black transition-transform hover:-translate-y-0.5"
                >
                  See the menu
                </a>
                <WhatsAppButton
                  message={ORDER_MESSAGE}
                  className="inline-flex h-12 items-center gap-2 rounded-full bg-white/15 px-6 text-sm font-semibold backdrop-blur transition-colors hover:bg-white/25"
                >
                  Order for pickup
                </WhatsAppButton>
              </div>
            </div>
          </div>
        </section>

        <Marquee
          duration={28}
          className="bg-tpl-accent py-5 text-4xl font-semibold tracking-tight text-tpl-on-accent md:py-7 md:text-7xl"
        >
          {MARQUEE.map((item) => (
            <span
              key={item}
              className="flex items-center gap-8 pr-8 md:gap-12 md:pr-12"
            >
              {item}
              <Coffee
                className="h-8 w-8 opacity-60 md:h-12 md:w-12"
                aria-hidden="true"
              />
            </span>
          ))}
        </Marquee>

        <section
          id="menu"
          className="mx-auto max-w-[90rem] scroll-mt-20 px-5 py-24 md:px-8 md:py-36"
        >
          <div className="grid gap-10 lg:grid-cols-[1fr_2.4fr] lg:gap-16">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <h2 className="text-6xl font-semibold tracking-[-0.04em] md:text-8xl">
                <RevealText text="Menu" onView />
              </h2>
              <p className="mt-4 max-w-xs text-tpl-muted">
                Breakfast all day. Pork-free kitchen. Prices in RM, including
                SST.
              </p>
              <WhatsAppButton
                message={ORDER_MESSAGE}
                className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-tpl-ink px-6 text-sm font-semibold text-tpl-bg transition-transform hover:-translate-y-0.5"
              >
                Order for pickup
              </WhatsAppButton>
            </div>
            <Menu />
          </div>
        </section>

        <section id="space" className="scroll-mt-20 bg-tpl-ink text-tpl-bg">
          <div className="mx-auto flex max-w-[90rem] flex-col gap-4 px-5 pb-10 pt-24 md:flex-row md:items-end md:justify-between md:px-8 md:pt-32">
            <h2 className="text-5xl font-semibold tracking-[-0.04em] md:text-8xl">
              <RevealText text="Teduh means shade." onView />
            </h2>
            <p className="max-w-xs opacity-70">
              Ceiling fans, big windows and plants everywhere. 48 seats, Wi-Fi
              and power points.
            </p>
          </div>
          <HorizontalScroll className="pb-16 md:pb-0">
            {GALLERY.map((photo, index) => (
              <figure
                key={photo.caption}
                className={`w-[78vw] shrink-0 snap-center md:w-auto ${
                  index % 2 ? 'md:mt-24' : ''
                }`}
              >
                <div
                  className={`relative aspect-[4/5] overflow-hidden rounded-[1.75rem] ${
                    index % 2 ? 'md:h-[56vh]' : 'md:aspect-[4/3] md:h-[60vh]'
                  }`}
                >
                  <Photo
                    src={photo.image}
                    alt={photo.caption}
                    fill
                    sizes="(min-width: 768px) 60vw, 80vw"
                    className="object-cover"
                  />
                </div>
                <figcaption className="mt-3 text-sm opacity-70">
                  {photo.caption}
                </figcaption>
              </figure>
            ))}
          </HorizontalScroll>
        </section>

        <section
          id="visit"
          className="mx-auto max-w-[90rem] scroll-mt-20 px-5 py-24 md:px-8 md:py-36"
        >
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <h2 className="text-5xl font-semibold tracking-[-0.04em] md:text-7xl">
                <RevealText text="Come sit a while." onView />
              </h2>
              <p className="mt-6 max-w-sm text-lg text-tpl-muted">
                18, Jalan Telawi 2, Bangsar Baru, 59100 Kuala Lumpur
              </p>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Jalan+Telawi+2+Bangsar+Kuala+Lumpur"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 font-semibold text-tpl-accent underline-offset-4 hover:underline"
              >
                Get directions
                <ArrowUpRight size={16} aria-hidden="true" />
              </a>
              <div className="mt-10">
                <HoursList />
              </div>
            </div>
            <Reveal className="min-h-[24rem] overflow-hidden rounded-[2rem] bg-tpl-tint">
              <iframe
                title={`Map showing ${BRAND} in Bangsar`}
                src="https://maps.google.com/maps?q=Jalan+Telawi+2+Bangsar+Kuala+Lumpur&z=16&output=embed"
                loading="lazy"
                className="h-full min-h-[24rem] w-full"
              />
            </Reveal>
          </div>
        </section>

        <section
          aria-label="Reviews"
          className="border-y border-tpl-line py-10"
        >
          <Marquee duration={45}>
            {REVIEWS.map((review) => (
              <figure
                key={review.name}
                className="flex items-center gap-4 pr-16"
              >
                <span className="flex gap-0.5" aria-label="5 stars">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      size={16}
                      aria-hidden="true"
                      className="fill-amber-400 text-amber-400"
                    />
                  ))}
                </span>
                <blockquote className="whitespace-nowrap text-2xl font-medium tracking-tight md:text-3xl">
                  “{review.text}”
                </blockquote>
                <figcaption className="whitespace-nowrap text-sm text-tpl-muted">
                  {review.name}
                </figcaption>
              </figure>
            ))}
          </Marquee>
        </section>
      </main>

      <footer className="overflow-hidden px-5 pb-8 pt-20 md:px-8">
        <div className="mx-auto flex max-w-[90rem] flex-wrap items-center justify-between gap-4 text-sm text-tpl-muted">
          <p>Open daily from 7am in Bangsar</p>
          <div className="flex gap-2">
            {[
              { icon: SiInstagram, label: 'Instagram' },
              { icon: SiWhatsapp, label: 'WhatsApp' },
            ].map(({ icon: Icon, label }) => (
              <span
                key={label}
                aria-label={label}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-tpl-line text-tpl-ink"
              >
                <Icon size={16} aria-hidden="true" />
              </span>
            ))}
          </div>
        </div>
        <p
          aria-hidden="true"
          className="mx-auto mt-6 max-w-[90rem] whitespace-nowrap text-[19vw] font-semibold leading-[0.8] tracking-[-0.06em] text-tpl-accent"
        >
          Kopi Teduh
        </p>
        <p className="mx-auto mt-6 max-w-[90rem] text-xs text-tpl-muted">
          © {BRAND}. Demo content for template preview.
        </p>
      </footer>
    </PaletteRoot>
  );
}
