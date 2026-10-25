'use client';

import { useId, useState } from 'react';
import { Check } from 'lucide-react';
import type { PricingTab } from '@constants/services';
import { WhatsAppButton } from './PriceParts';

export default function QuotePanel({
  tab,
  whatsappHref,
}: {
  tab: PricingTab;
  whatsappHref: string;
}) {
  const [brief, setBrief] = useState('');
  const id = useId();
  const quote = tab.quote;
  if (!quote) return null;

  return (
    <section
      aria-labelledby={`${id}-title`}
      className="mx-auto max-w-3xl rounded-3xl border border-gray-200 bg-white/70 p-5 shadow-xl backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/70 sm:p-6 lg:p-8"
    >
      <h3
        id={`${id}-title`}
        className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100"
      >
        Tell me about your app
      </h3>
      <p className="mt-2 text-gray-600 dark:text-gray-400">
        Every app is different, so each one gets its own quote. It&apos;s free,
        with a written scope and a fixed price before any work starts.
      </p>

      <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
        {quote.includes.map((item) => (
          <li
            key={item}
            className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300"
          >
            <Check
              size={16}
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-green-500"
            />
            {item}
          </li>
        ))}
      </ul>

      <label
        htmlFor={`${id}-brief`}
        className="mt-6 block text-sm font-semibold text-gray-900 dark:text-gray-100"
      >
        What should your app do?
      </label>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {quote.examples}
      </p>
      <textarea
        id={`${id}-brief`}
        value={brief}
        onChange={(event) => setBrief(event.target.value)}
        rows={5}
        placeholder={quote.placeholder}
        className="mt-3 w-full resize-y rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-900/60 dark:text-gray-100"
      />
      <div className="mt-4 sm:max-w-xs">
        <WhatsAppButton
          href={whatsappHref}
          message={`Hi Haziq, I'd like a quote for a ${tab.noun}.\n${brief.trim()}\nPlease let me know what you need from me.`}
          event={{ tab: tab.id, package: 'quote' }}
          disabled={brief.trim().length < 10}
        >
          Get a free quote
        </WhatsAppButton>
      </div>
    </section>
  );
}
