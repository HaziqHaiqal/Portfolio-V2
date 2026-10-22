import Link from 'next/link';
import { ArrowRight, Sparkle } from 'lucide-react';
import {
  HeroPhoto,
  Marquee,
  ParallaxPhoto,
  RevealText,
} from '@components/Templates/motion';
import {
  CategoryList,
  NewInRow,
} from '@components/Templates/atelier-nura/HomeParts';
import {
  BASE_PATH,
  PHOTOS,
  PROMISES,
} from '@components/Templates/atelier-nura/data';

export default function AtelierNuraHome() {
  return (
    <>
      <section className="relative flex h-[calc(100svh-5rem)] min-h-[38rem] flex-col justify-end overflow-hidden bg-black text-white">
        <HeroPhoto
          src={PHOTOS.hero}
          alt="Model in a sand satin abaya and chiffon shawl from the Sutera collection"
          className="[&_img]:object-[50%_22%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/40" />
        <div className="relative mx-auto w-full max-w-[90rem] px-4 md:px-8">
          <p className="max-w-xs text-sm text-white/85 md:text-base">
            Raya 2027. Satin abaya and dresses in quiet colours, cut loose
            enough to move in all day.
          </p>
          <Link
            href={`${BASE_PATH}/shop`}
            className="group mt-5 inline-flex items-center gap-2 border-b border-white/50 pb-1 text-sm font-medium transition-colors hover:border-white"
          >
            Shop the collection
            <ArrowRight
              size={15}
              aria-hidden="true"
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </div>
        <h1 className="relative mx-auto -mb-[0.13em] mt-6 w-full max-w-[90rem] whitespace-nowrap px-3 text-[27vw] font-medium leading-none tracking-[-0.07em] md:px-6 md:text-[25vw]">
          <RevealText text="Sutera" delay={0.4} />
        </h1>
      </section>

      <Marquee duration={32} className="border-b border-tpl-line py-4 text-sm">
        {PROMISES.map((promise) => (
          <span key={promise.title} className="flex items-center gap-8 pr-8">
            <span>
              <span className="font-medium">{promise.title}.</span>{' '}
              <span className="text-tpl-muted">{promise.text}</span>
            </span>
            <Sparkle size={12} aria-hidden="true" />
          </span>
        ))}
      </Marquee>

      <section className="mx-auto max-w-[90rem] px-4 pt-20 md:px-8 md:pt-32">
        <CategoryList />
      </section>

      <section className="pt-20 md:pt-32">
        <NewInRow />
      </section>

      <section className="mx-auto grid max-w-[90rem] items-center gap-10 px-4 pt-20 md:grid-cols-12 md:gap-6 md:px-8 md:pt-36">
        <ParallaxPhoto
          src={PHOTOS.campaign}
          alt="Two abayas in stone and sand under white arches"
          sizes="(min-width: 768px) 42vw, 100vw"
          strength={10}
          className="aspect-[4/5] md:col-span-5"
        />
        <div className="md:col-span-3 md:col-start-7 md:-mt-40">
          <h2 className="text-4xl font-medium leading-[1.05] tracking-[-0.04em] md:text-6xl">
            <RevealText text="Made to fit you, not a size chart." onView />
          </h2>
          <p className="mt-6 max-w-sm leading-relaxed text-tpl-muted">
            Every piece is finished in our Kuala Lumpur studio. Send your height
            with your order and we adjust the sleeve and length before posting,
            free.
          </p>
          <Link
            href={`${BASE_PATH}/contact`}
            className="mt-8 inline-flex h-12 items-center border border-tpl-ink px-7 text-sm font-medium transition-colors hover:bg-tpl-ink hover:text-tpl-bg"
          >
            Book a fitting
          </Link>
        </div>
        <ParallaxPhoto
          src={PHOTOS.sleeve}
          alt="Gathered satin sleeve in close-up"
          sizes="(min-width: 768px) 25vw, 100vw"
          strength={22}
          className="aspect-[3/4] md:col-span-3 md:col-start-10 md:mt-56"
        />
      </section>
    </>
  );
}
