'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';
import { Plus } from 'lucide-react';

export interface FaqItem {
  category: string;
  question: string;
  answer: ReactNode;
}

const CATEGORIES = [
  { id: 'Starting a project', label: 'Getting started' },
  { id: 'After launch', label: 'After launch' },
  { id: 'Costs and ownership', label: 'Costs & ownership' },
] as const;

export default function FaqList({ items }: { items: FaqItem[] }) {
  const categories = CATEGORIES.filter((category) =>
    items.some((item) => item.category === category.id)
  );
  const [selectedCategory, setSelectedCategory] = useState(
    categories[0]?.id ?? ''
  );
  const visibleItems = items.filter(
    (item) => item.category === selectedCategory
  );

  return (
    <div>
      <div
        role="group"
        aria-label="Frequently asked question categories"
        className="mb-7 flex gap-6 overflow-x-auto border-b border-gray-200 px-1 [scrollbar-width:none] sm:justify-center sm:gap-8 dark:border-gray-700"
      >
        {categories.map((category) => {
          const selected = category.id === selectedCategory;
          return (
            <button
              key={category.id}
              type="button"
              aria-pressed={selected}
              onClick={() => setSelectedCategory(category.id)}
              className={`min-h-11 shrink-0 border-b-2 px-0 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-500/20 ${
                selected
                  ? 'border-green-600 text-gray-900 dark:border-green-400 dark:text-gray-100'
                  : 'border-transparent text-gray-500 hover:text-green-700 dark:text-gray-400 dark:hover:text-green-300'
              }`}
            >
              {category.label}
            </button>
          );
        })}
      </div>

      <div className="divide-y divide-gray-200 overflow-hidden rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-sm dark:divide-gray-700 dark:border-gray-700 dark:bg-gray-800/70">
        {visibleItems.map((faq) => (
          <details
            key={faq.question}
            className="group transition-colors open:bg-gray-50 dark:open:bg-gray-800"
          >
            <summary className="flex min-h-16 cursor-pointer list-none items-center gap-4 px-5 py-4 font-semibold text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-green-500/40 dark:text-gray-100 [&::-webkit-details-marker]:hidden sm:px-6">
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
    </div>
  );
}
