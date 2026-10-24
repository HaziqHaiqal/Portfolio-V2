import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Outfit } from 'next/font/google';
import { ArrowRight, ChevronLeft } from 'lucide-react';
import { AUTOMATION } from '@constants/services';
import { formatRM } from '@lib/format';
import PickLink from '@components/Templates/PickLink';
import {
  Approvals,
  Chatbot,
  MorningReport,
  WhatsAppOrders,
} from '@components/Templates/automation/Simulations';

const font = Outfit({ subsets: ['latin'], variable: '--tpl-font' });

export const metadata: Metadata = {
  title: 'Automation',
  description:
    'Four everyday automations, simulated: WhatsApp orders, a website chatbot, approvals and a morning report.',
};

const PICK = { tab: AUTOMATION.id };

const DEMOS: {
  build: string;
  title: string;
  text: string;
  demo: ReactNode;
}[] = [
  {
    build: 'whatsapp-orders',
    title: 'WhatsApp orders, saved for you',
    text: 'Send an order as a customer. It lands in the orders sheet, the customer gets a confirmation, and the kitchen is told.',
    demo: <WhatsAppOrders />,
  },
  {
    build: 'chatbot',
    title: 'A chatbot for your website',
    text: 'Tap a question. The assistant answers from the shop’s own details, and hands over to a person when asked.',
    demo: <Chatbot />,
  },
  {
    build: 'approvals',
    title: 'Approvals in one tap',
    text: 'Send a leave request as staff, then approve or decline it as the manager. Every step is recorded.',
    demo: <Approvals />,
  },
  {
    build: 'reports',
    title: 'A morning report',
    text: 'Yesterday’s sales, best seller and low stock, sent to the owner’s WhatsApp every morning.',
    demo: <MorningReport />,
  },
];

const priceOf = (build: string) => {
  const item = AUTOMATION.bundles.find((entry) => entry.id === build);
  return item ? `From ${formatRM(item.price)}` : '';
};

export default function AutomationDemosPage() {
  return (
    <div
      className={`${font.variable} min-h-screen bg-[#F4F2EE] font-[family-name:var(--tpl-font)] text-[#111] [--demo-bar:3rem]`}
    >
      <div className="sticky top-0 z-[60] h-[--demo-bar] bg-neutral-950 text-white">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-3 px-3 sm:px-5">
          <Link
            href="/services"
            className="flex min-w-0 items-center gap-1 text-xs text-white/70 transition-colors hover:text-white"
          >
            <ChevronLeft size={16} aria-hidden="true" className="shrink-0" />
            <span className="hidden sm:inline">Services</span>
            <span className="sm:hidden">Back</span>
          </Link>
          <span className="text-xs font-medium text-white/80">Automation</span>
          <PickLink
            pick={PICK}
            className="inline-flex h-8 shrink-0 items-center rounded-full bg-white px-3.5 text-xs font-semibold text-neutral-950 transition-colors hover:bg-neutral-200"
          >
            See prices
          </PickLink>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-5 pb-20 pt-12 sm:px-8 sm:pt-16">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/50">
          Simulated, nothing is sent
        </p>
        <h1 className="mt-3 text-[clamp(2.25rem,6vw,4rem)] font-semibold leading-[1] tracking-[-0.03em]">
          Automation
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-black/70">
          Four everyday automations for Malaysian businesses. Press the buttons
          to see what each one does.
        </p>

        <div className="mt-14 space-y-16">
          {DEMOS.map((item, index) => (
            <section key={item.build} aria-labelledby={`demo-${item.build}`}>
              <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div className="max-w-xl">
                  <p className="text-xs font-semibold tabular-nums text-black/40">
                    0{index + 1}
                  </p>
                  <h2
                    id={`demo-${item.build}`}
                    className="mt-1 text-2xl font-semibold tracking-[-0.02em] sm:text-3xl"
                  >
                    {item.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-black/70 sm:text-base">
                    {item.text}
                  </p>
                </div>
                <p className="shrink-0 rounded-full bg-white px-4 py-2 text-sm font-semibold shadow-sm ring-1 ring-black/5">
                  {priceOf(item.build)}
                </p>
              </div>
              {item.demo}
            </section>
          ))}
        </div>

        <div className="mt-20 flex flex-col items-start justify-between gap-5 rounded-[28px] bg-[#111] p-6 text-white sm:flex-row sm:items-center sm:p-8">
          <p className="max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">
            <span className="font-semibold text-white">
              Want one of these for your business?{' '}
            </span>
            See what each one costs, then ask for a quote on WhatsApp.
          </p>
          <PickLink
            pick={PICK}
            className="inline-flex h-12 shrink-0 items-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-[#111] transition-transform hover:-translate-y-0.5"
          >
            See automation prices
            <ArrowRight size={16} aria-hidden="true" />
          </PickLink>
        </div>
      </main>
    </div>
  );
}
