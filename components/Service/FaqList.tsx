import type { ReactNode } from 'react';
import { Plus } from 'lucide-react';

export interface FaqItem {
  question: string;
  answer: ReactNode;
}

export default function FaqList({ items }: { items: FaqItem[] }) {
  return (
    <div className="border-t border-gray-200 dark:border-gray-700">
      {items.map((faq) => (
        <details
          key={faq.question}
          name="faq"
          className="faq-item group border-b border-gray-200 dark:border-gray-700"
        >
          <summary className="flex min-h-16 cursor-pointer list-none items-center gap-4 py-5 text-base font-semibold text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-green-500/40 dark:text-gray-100 sm:text-lg [&::-webkit-details-marker]:hidden">
            <span className="flex-1">{faq.question}</span>
            <Plus
              size={20}
              aria-hidden="true"
              className="shrink-0 text-gray-400 transition-transform duration-200 group-open:rotate-45 group-open:text-red-600 dark:group-open:text-red-400"
            />
          </summary>
          <div className="pb-6 pr-10 text-sm leading-relaxed text-gray-600 dark:text-gray-400 sm:text-[15px]">
            {faq.answer}
          </div>
        </details>
      ))}
    </div>
  );
}
