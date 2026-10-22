import type { Metadata } from 'next';
import WhatsAppButton from '@components/Templates/WhatsAppButton';
import { RevealText } from '@components/Templates/motion';
import { BRAND, FAQS, STUDIO } from '@components/Templates/atelier-nura/data';

export const metadata: Metadata = { title: 'Visit us' };

const FITTING_MESSAGE = [
  `Hi ${BRAND}! I'd like to book a fitting.`,
  'Preferred date and time:',
  'Pieces to try:',
  'Name:',
].join('\n');

export default function AtelierNuraContact() {
  return (
    <>
      <section className="mx-auto grid max-w-[90rem] gap-12 px-4 pt-16 md:grid-cols-2 md:px-8 md:pt-24">
        <div>
          <h1 className="text-5xl font-medium leading-[1.02] tracking-[-0.045em] md:text-8xl">
            <RevealText text="Visit the studio." />
          </h1>
          <p className="mt-8 max-w-sm text-lg text-tpl-muted">
            {STUDIO.address}
          </p>
          <dl className="mt-10 max-w-md border-t border-tpl-line">
            {STUDIO.hours.map((row) => (
              <div
                key={row.days}
                className="flex justify-between gap-4 border-b border-tpl-line py-4"
              >
                <dt className="text-tpl-muted">{row.days}</dt>
                <dd>{row.time}</dd>
              </div>
            ))}
          </dl>
          <WhatsAppButton
            message={FITTING_MESSAGE}
            className="mt-10 inline-flex h-14 items-center gap-2 bg-tpl-accent px-8 text-sm font-medium text-tpl-on-accent"
          >
            Book a fitting on WhatsApp
          </WhatsAppButton>
        </div>
        <div className="min-h-[28rem] overflow-hidden bg-tpl-tint">
          <iframe
            title={`Map showing ${BRAND} in Bangsar`}
            src="https://maps.google.com/maps?q=Jalan+Telawi+3+Bangsar+Kuala+Lumpur&z=16&output=embed"
            loading="lazy"
            className="h-full min-h-[28rem] w-full grayscale-[40%]"
          />
        </div>
      </section>

      <section className="mx-auto grid max-w-[90rem] gap-10 px-4 pt-24 md:grid-cols-12 md:px-8 md:pt-36">
        <h2 className="text-4xl font-medium tracking-[-0.04em] md:col-span-4 md:text-5xl">
          Sizes, delivery and exchanges
        </h2>
        <div className="border-t border-tpl-line md:col-span-7 md:col-start-6">
          {FAQS.map((faq) => (
            <details
              key={faq.question}
              className="group border-b border-tpl-line"
            >
              <summary className="flex min-h-20 cursor-pointer list-none items-center justify-between gap-6 text-xl tracking-tight [&::-webkit-details-marker]:hidden">
                {faq.question}
                <span
                  aria-hidden="true"
                  className="text-2xl font-light transition-transform duration-300 group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="max-w-xl pb-8 leading-relaxed text-tpl-muted">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
