import type { ReactNode } from 'react';
import { Plus } from 'lucide-react';

export interface FaqItem {
  question: string;
  answer: ReactNode;
}

export default function FaqList({ items }: { items: FaqItem[] }) {
  return (
    <div className="divide-y divide-gray-200 overflow-hidden rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-sm dark:divide-gray-700 dark:border-gray-700 dark:bg-gray-800/70">
      {items.map((faq) => (
        <details
          key={faq.question}
          className="group transition-colors open:bg-gray-50 dark:open:bg-gray-800"
        >
          <summary className="flex min-h-16 cursor-pointer list-none items-center gap-4 px-5 py-4 font-semibold text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-green-500/40 dark:text-gray-100 sm:px-6 [&::-webkit-details-marker]:hidden">
            <span className="flex-1">{faq.question}</span>
            <Plus
              size={18}
              aria-hidden="true"
              className="shrink-0 text-gray-400 transition-transform duration-200 group-open:rotate-45 group-open:text-green-600 dark:group-open:text-green-400"
            />
          </summary>
          <div className="border-t border-gray-200 px-5 pb-6 pt-5 text-sm leading-relaxed text-gray-600 dark:border-gray-700 dark:text-gray-400 sm:px-6 sm:text-[15px]">
            {faq.answer}
          </div>
        </details>
      ))}
    </div>
  );
}
