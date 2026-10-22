import type { Metadata } from 'next';
import { ShieldCheck } from 'lucide-react';
import {
  CountUp,
  ParallaxPhoto,
  RevealText,
} from '@components/Templates/motion';
import {
  CREDENTIALS,
  LEADERS,
  PHOTOS,
  TIMELINE,
} from '@components/Templates/teras-bina/data';

export const metadata: Metadata = { title: 'About' };

const STATS = [
  { to: 420, label: 'Staff across two offices' },
  { to: 310, label: 'Projects handed over' },
  {
    to: 2.1,
    label: 'Million man-hours without a lost-time injury',
    decimals: 1,
    suffix: 'M',
  },
];

export default function TerasBinaAbout() {
  return (
    <div className="pb-24 md:pb-36">
      <section className="mx-auto max-w-7xl px-5 pb-16 pt-16 md:px-8 md:pb-24 md:pt-24">
        <h1 className="max-w-5xl text-5xl font-semibold leading-[1] tracking-[-0.045em] md:text-8xl">
          <RevealText text="Built in Shah Alam, trusted across the Peninsula." />
        </h1>
      </section>

      <ParallaxPhoto
        src={PHOTOS.teamSite}
        alt="Site team walking across a concrete slab"
        sizes="100vw"
        priority
        className="h-[60vh] md:h-[85vh]"
      />

      <section className="mx-auto grid max-w-7xl gap-12 px-5 pt-20 md:grid-cols-12 md:px-8 md:pt-32">
        <p className="text-2xl leading-snug tracking-tight md:col-span-6 md:text-4xl">
          What started as a crew of twelve is now a G7 contractor with its own
          M&E division and offices in Shah Alam and Johor Bahru.
        </p>
        <dl className="space-y-8 md:col-span-5 md:col-start-8">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col-reverse border-t border-tpl-line pt-5"
            >
              <dt className="mt-1 text-tpl-muted">{stat.label}</dt>
              <dd className="text-5xl font-semibold tracking-tight md:text-6xl">
                <CountUp
                  to={stat.to}
                  decimals={stat.decimals}
                  suffix={stat.suffix}
                />
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 pt-24 md:grid-cols-12 md:px-8 md:pt-36">
        <h2 className="text-4xl font-semibold tracking-[-0.04em] md:col-span-4 md:text-6xl">
          Milestones
        </h2>
        <ol className="md:col-span-7 md:col-start-6">
          {TIMELINE.map((item) => (
            <li
              key={item.year}
              className="grid grid-cols-[5rem_1fr] gap-6 border-t border-tpl-line py-6 md:grid-cols-[8rem_1fr]"
            >
              <p className="text-2xl font-semibold tracking-tight text-tpl-accent md:text-3xl">
                {item.year}
              </p>
              <p className="text-lg leading-relaxed">{item.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 pt-24 md:grid-cols-12 md:px-8 md:pt-36">
        <h2 className="text-4xl font-semibold tracking-[-0.04em] md:col-span-4 md:text-6xl">
          Leadership
        </h2>
        <ul className="md:col-span-7 md:col-start-6">
          {LEADERS.map((leader) => (
            <li
              key={leader.name}
              className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-t border-tpl-line py-6"
            >
              <p className="text-2xl font-semibold tracking-tight">
                {leader.name}
              </p>
              <p className="text-tpl-muted">{leader.role}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-7xl px-5 pt-24 md:px-8 md:pt-36">
        <ul className="flex flex-wrap gap-x-12 gap-y-6 border-y border-tpl-line py-10">
          {CREDENTIALS.map((item) => (
            <li key={item.name} className="flex items-center gap-3">
              <ShieldCheck
                size={24}
                aria-hidden="true"
                className="text-tpl-accent"
              />
              <span>
                <span className="block font-semibold">{item.name}</span>
                <span className="text-sm text-tpl-muted">{item.note}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
