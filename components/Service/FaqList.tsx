import type { ReactNode } from 'react';
import { Plus } from 'lucide-react';

export interface FaqItem {
  question: string;
  answer: ReactNode;
}

export default function FaqList({ items }: { items: FaqItem[] }) {
  return (
    <div className="divide-y divide-gray-200 rounded-3xl border border-gray-200 bg-white/70 px-6 shadow-xl backdrop-blur-sm dark:divide-gray-700/70 dark:border-gray-700 dark:bg-gray-800/70 sm:px-8">
      {items.map((faq) => (
        <details key={faq.question} className="group">
          <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-4 font-semibold text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-green-500/40 dark:text-gray-100 [&::-webkit-details-marker]:hidden">
            {faq.question}
            <Plus
              size={18}
              aria-hidden="true"
              className="shrink-0 text-gray-400 transition-transform duration-300 group-open:rotate-45 group-open:text-green-600 dark:group-open:text-green-400"
            />
          </summary>
          <div className="pb-6 text-sm leading-relaxed text-gray-600 dark:text-gray-400 sm:text-[15px]">
            {faq.answer}
          </div>
        </details>
      ))}
    </div>
  );
}
