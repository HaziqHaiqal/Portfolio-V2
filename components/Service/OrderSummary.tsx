import type { ReactNode, Ref } from 'react';
import { formatRM } from '@lib/format';

export interface SummaryLine {
  label: string;
  value: string;
  /** Shown under the line, such as a billing switch. */
  detail?: ReactNode;
}

interface Discount {
  label: string;
  amount: number;
}

export default function OrderSummary({
  id,
  lines,
  discount,
  totalLabel,
  total,
  quoted = false,
  children,
  note,
  action,
  footnote,
  ref,
  plain = false,
  className = '',
}: {
  id: string;
  lines: SummaryLine[];
  discount?: Discount | Discount[] | null;
  totalLabel: string;
  total: string;
  quoted?: boolean;
  children?: ReactNode;
  note?: string;
  action: ReactNode;
  footnote?: ReactNode;
  ref?: Ref<HTMLElement>;
  /** Renders as a section of a surrounding card instead of its own box. */
  plain?: boolean;
  className?: string;
}) {
  const discounts = discount
    ? Array.isArray(discount)
      ? discount
      : [discount]
    : [];

  return (
    <section
      ref={ref}
      aria-labelledby={id}
      className={`text-gray-900 dark:text-gray-100 ${
        plain
          ? ''
          : 'rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/40 sm:p-5'
      } ${className}`}
    >
      <h4 id={id} className={plain ? 'font-bold' : 'text-sm font-semibold'}>
        Your order
      </h4>
      {(lines.length > 0 || discounts.length > 0) && (
        <dl className="mt-3 space-y-2 text-sm">
          {lines.map((line) => (
            <div key={line.label}>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-600 dark:text-gray-400">
                  {line.label}
                </dt>
                <dd className="shrink-0 text-right font-medium">
                  {line.value}
                </dd>
              </div>
              {line.detail && <dd className="mt-2">{line.detail}</dd>}
            </div>
          ))}
          {discounts.map((discount) => (
            <div
              key={discount.label}
              className="flex justify-between gap-4 text-green-700 dark:text-green-400"
            >
              <dt>{discount.label}</dt>
              <dd className="shrink-0 font-medium">
                −{formatRM(discount.amount)}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {children && (
        <div className={`mt-4 space-y-3 ${plain ? 'max-w-sm' : ''}`}>
          {children}
        </div>
      )}

      <p className="mt-4 flex flex-wrap items-baseline justify-between gap-x-3 border-t border-gray-200 pt-4 dark:border-gray-700">
        <span className="text-sm font-semibold">{totalLabel}</span>
        <span
          aria-live="polite"
          className={`font-black tracking-tight ${
            quoted ? 'text-xl text-purple-700 dark:text-purple-300' : 'text-2xl'
          }`}
        >
          {total}
        </span>
      </p>
      {note && (
        <p className="mt-1 text-right text-xs text-gray-500 dark:text-gray-400">
          {note}
        </p>
      )}
      <div className={`mt-4 ${plain ? 'flex sm:justify-end' : ''}`}>
        {action}
      </div>
      {footnote}
    </section>
  );
}
