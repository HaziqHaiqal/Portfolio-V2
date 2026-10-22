import type { Metadata } from 'next';
import {
  CountUp,
  ParallaxPhoto,
  RevealText,
} from '@components/Templates/motion';
import { PHOTOS } from '@components/Templates/atelier-nura/data';

export const metadata: Metadata = { title: 'Our story' };

const STATS = [
  { to: 2019, label: 'Founded in Keramat', plain: true },
  { to: 4000, label: 'Customers across Malaysia', suffix: '+' },
  { to: 60, label: 'Pieces at most per style' },
  { to: 6, label: 'Tailors in our studio' },
];

const PRINCIPLES = [
  {
    title: 'Fabric first',
    text: 'Nida crepe, satin and chiffon chosen to breathe in Malaysian heat, washed before cutting so pieces keep their shape.',
  },
  {
    title: 'Small batches',
    text: 'No style is made in more than 60 pieces, so you rarely meet your outfit at the next kenduri.',
  },
  {
    title: 'Finished by hand',
    text: 'Every hem is pressed and checked in our studio before it is folded into your box.',
  },
];

export default function AtelierNuraAbout() {
  return (
    <>
      <section className="mx-auto max-w-[90rem] px-4 pb-16 pt-16 md:px-8 md:pb-24 md:pt-24">
        <h1 className="max-w-5xl text-5xl font-medium leading-[1.02] tracking-[-0.045em] md:text-8xl">
          <RevealText text="Modest wear that is light, well cut and made to last." />
        </h1>
      </section>

      <ParallaxPhoto
        src={PHOTOS.campaign}
        alt="Two abayas in stone and sand under white arches"
        sizes="100vw"
        priority
        className="h-[70vh] md:h-[90vh]"
      />

      <section className="mx-auto grid max-w-[90rem] gap-12 px-4 pt-20 md:grid-cols-12 md:px-8 md:pt-32">
        <p className="text-2xl leading-snug tracking-tight md:col-span-7 md:text-4xl">
          Nura started sewing for her sisters because nothing in the shops was
          modest, breathable and well cut at the same time. Six years later, the
          same idea guides every piece.
        </p>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-10 md:col-span-4 md:col-start-9">
          {STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col-reverse">
              <dt className="mt-2 text-sm text-tpl-muted">{stat.label}</dt>
              <dd className="text-4xl font-medium tracking-tight md:text-5xl">
                {stat.plain ? (
                  stat.to
                ) : (
                  <CountUp to={stat.to} suffix={stat.suffix} />
                )}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mx-auto grid max-w-[90rem] items-end gap-10 px-4 pt-20 md:grid-cols-12 md:px-8 md:pt-32">
        <ParallaxPhoto
          src={PHOTOS.abayaStudio}
          alt="Model in an embroidered black abaya in the studio"
          sizes="(min-width: 768px) 40vw, 100vw"
          className="aspect-[4/5] md:col-span-5"
        />
        <ul className="divide-y divide-tpl-line border-y border-tpl-line md:col-span-6 md:col-start-7">
          {PRINCIPLES.map((principle) => (
            <li
              key={principle.title}
              className="grid gap-2 py-8 md:grid-cols-[12rem_1fr]"
            >
              <p className="text-xl font-medium tracking-tight">
                {principle.title}
              </p>
              <p className="leading-relaxed text-tpl-muted">{principle.text}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
