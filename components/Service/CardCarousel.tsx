'use client';

import {
  Children,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ARROW =
  'flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white/70 text-gray-700 transition-colors hover:border-green-500/60 hover:text-green-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-500/20 disabled:pointer-events-none disabled:opacity-35 dark:border-gray-600 dark:bg-gray-800/70 dark:text-gray-200 dark:hover:text-green-400';

/** The scroll position that shows a card: centred, or at the list's leading edge. */
function leftFor(list: HTMLElement, child: HTMLElement, centered: boolean) {
  return centered
    ? child.offsetLeft + child.offsetWidth / 2 - list.clientWidth / 2
    : child.offsetLeft - parseFloat(getComputedStyle(list).paddingLeft);
}

/**
 * Cards that swipe sideways on small screens and sit in a grid from a
 * breakpoint up. `className` holds both layouts; `dotsClassName` hides the
 * controls once the grid takes over. `centered` snaps each card to the middle
 * and opens on the `initial` card, so its neighbours peek in on both sides.
 */
export default function CardCarousel({
  label,
  className,
  itemClassName,
  dotsClassName,
  centered = false,
  arrows = false,
  initial = 0,
  children,
}: {
  label: string;
  className: string;
  itemClassName: string | ((index: number) => string);
  dotsClassName: string;
  centered?: boolean;
  arrows?: boolean;
  initial?: number;
  children: ReactNode;
}) {
  const listRef = useRef<HTMLUListElement>(null);
  const [scrolled, setActive] = useState(initial);
  const items = Children.toArray(children);
  const active = Math.min(scrolled, items.length - 1);

  // A hidden tab has no width yet, so wait until the list can be measured.
  useEffect(() => {
    const list = listRef.current;
    if (!list || !initial) return;
    const observer = new ResizeObserver(() => {
      const child = list.children[initial] as HTMLElement | undefined;
      if (!list.clientWidth || !child) return;
      list.scrollLeft = leftFor(list, child, centered);
      observer.disconnect();
    });
    observer.observe(list);
    return () => observer.disconnect();
  }, [centered, initial]);

  const onScroll = () => {
    const list = listRef.current;
    if (!list) return;
    let nearest = 0;
    let distance = Infinity;
    Array.from(list.children).forEach((child, index) => {
      const gap = Math.abs(
        leftFor(list, child as HTMLElement, centered) - list.scrollLeft
      );
      if (gap < distance) {
        distance = gap;
        nearest = index;
      }
    });
    // The last card can't always reach its snap point, so the end of the scroll counts as it.
    if (list.scrollLeft + list.clientWidth >= list.scrollWidth - 4)
      nearest = items.length - 1;
    setActive(nearest);
  };

  const show = (index: number) => {
    const list = listRef.current;
    const child = list?.children[index] as HTMLElement | undefined;
    if (!list || !child) return;
    list.scrollTo({
      left: leftFor(list, child, centered),
      behavior: 'smooth',
    });
  };

  return (
    <div role="region" aria-roledescription="carousel" aria-label={label}>
      <ul ref={listRef} onScroll={onScroll} className={`relative ${className}`}>
        {items.map((item, index) => (
          <li
            key={isValidElement(item) && item.key !== null ? item.key : index}
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${items.length}`}
            className={
              typeof itemClassName === 'function'
                ? itemClassName(index)
                : itemClassName
            }
          >
            {item}
          </li>
        ))}
      </ul>
      {items.length > 1 && (
        <div
          className={`mt-2 flex items-center justify-center gap-3 ${dotsClassName}`}
        >
          {arrows && (
            <button
              type="button"
              onClick={() => show(active - 1)}
              disabled={active === 0}
              aria-label="Previous card"
              className={ARROW}
            >
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
          )}
          <div className="flex">
            {items.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => show(index)}
                aria-label={`Show card ${index + 1} of ${items.length}`}
                aria-current={index === active}
                className="flex h-8 w-6 items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/40"
              >
                <span
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === active
                      ? 'w-5 bg-green-600 dark:bg-green-400'
                      : 'w-2 bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              </button>
            ))}
          </div>
          {arrows && (
            <button
              type="button"
              onClick={() => show(active + 1)}
              disabled={active === items.length - 1}
              aria-label="Next card"
              className={ARROW}
            >
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
