import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { ParallaxPhoto, RevealText } from '@components/Templates/motion';
import { PRIMARY } from '@components/Templates/teras-bina/ui';
import { BASE_PATH, SERVICES } from '@components/Templates/teras-bina/data';

export const metadata: Metadata = { title: 'Services' };

export default function TerasBinaServices() {
  return (
    <div className="pb-24 md:pb-36">
      <section className="mx-auto max-w-7xl px-5 pt-16 md:px-8 md:pt-24">
        <h1 className="max-w-4xl text-5xl font-semibold leading-[1] tracking-[-0.045em] md:text-8xl">
          <RevealText text="From piling to handover." />
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-tpl-muted">
          Building, civil and M&E work under one contract, so one team is
          responsible for cost, programme and quality.
        </p>
      </section>

      {SERVICES.map((service, index) => (
        <section
          key={service.id}
          className="mx-auto mt-24 grid max-w-7xl items-center gap-10 px-5 md:mt-36 md:grid-cols-12 md:px-8"
        >
          <ParallaxPhoto
            src={service.image}
            alt=""
            sizes="(min-width: 768px) 58vw, 100vw"
            className={`aspect-[4/3] rounded-[1.75rem] md:col-span-7 ${
              index % 2 ? 'md:order-2 md:col-start-6' : ''
            }`}
          />
          <div
            className={`md:col-span-4 ${index % 2 ? 'md:col-start-1 md:row-start-1' : 'md:col-start-9'}`}
          >
            <h2 className="text-4xl font-semibold tracking-[-0.035em] md:text-5xl">
              {service.title}
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-tpl-muted">
              {service.text}
            </p>
            <ul className="mt-8 border-t border-tpl-line">
              {service.scope.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 border-b border-tpl-line py-4"
                >
                  <Check
                    size={18}
                    aria-hidden="true"
                    className="mt-0.5 shrink-0 text-tpl-accent"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>
      ))}

      <section className="mx-auto mt-24 flex max-w-7xl flex-col items-start gap-6 border-t border-tpl-line px-5 pt-12 md:mt-36 md:flex-row md:items-center md:justify-between md:px-8">
        <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">
          Need a budget estimate?
        </h2>
        <Link href={`${BASE_PATH}/contact`} className={PRIMARY}>
          Request a quote
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </section>
    </div>
  );
}
