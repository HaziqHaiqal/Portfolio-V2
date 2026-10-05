'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent, PointerEvent } from 'react';
import Image from 'next/image';
import { AnimatePresence, m } from 'framer-motion';
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  CirclePlay,
  Folder,
} from 'lucide-react';
import { SiGithub } from 'react-icons/si';
import { PROJECT_CATEGORIES, getCategoryInfo } from '@constants/projects';
import { useUIStore } from '@lib/stores';
import { cn } from '@lib/utils';
import type { ProjectProps } from 'types/portfolio';

const SWIPE_THRESHOLD = 50;
// Movement before a press counts as a drag rather than a tap on the card.
const DRAG_SLOP = 8;
// Quiet time after the last wheel event that ends a trackpad gesture.
const WHEEL_SETTLE_MS = 160;
// Distance between neighbouring card slots, as a share of the rail's width.
const SLOT_SHARE = 0.76;

// Where a card sits at slot offsets -2, -1, 0, 1, 2. Between slots the values are
// interpolated, so a card being dragged travels its real path instead of sliding.
const TILT = {
  x: [-120, -74, 0, 74, 120], // % of card width
  z: [-560, -280, 0, -280, -560], // px
  rotateY: [55, 40, 0, -40, -55], // deg
};
const SHELF = {
  x: [-118, -78, 0, 78, 118],
  y: [64, 34, 0, 34, 64],
  rotateY: [24, 16, 0, -16, -24],
  scale: [0.6, 0.8, 1, 0.8, 0.6],
};
const OPACITY = [0, 1, 1, 1, 0];

const pad = (n: number) => String(n).padStart(2, '0');
const clamp = (v: number, limit: number) =>
  Math.max(-limit, Math.min(limit, v));

/** Signed distance from the active card, wrapped so the shorter way round wins. */
function offsetFrom(k: number, active: number, total: number) {
  const off = (k - active + total) % total;
  return off > total / 2 ? off - total : off;
}

/** Linear lookup into a five-stop table for a fractional slot offset. */
function at(stops: number[], f: number) {
  const x = Math.max(-2, Math.min(2, f)) + 2;
  const i = Math.min(3, Math.floor(x));
  return stops[i] + (stops[i + 1] - stops[i]) * (x - i);
}

/**
 * Both layouts ship as CSS variables and the breakpoint picks one in CSS, so the
 * server render already matches the screen. Phones get the "sunken shelf"
 * (neighbours drop lower and shrink); wider screens tilt them away at the sides.
 * `f` is the card's slot offset, fractional while a drag or scroll is under way.
 */
function cardStyle(f: number): CSSProperties {
  return {
    '--card-shelf': `translateX(${at(SHELF.x, f)}%) translateY(${at(SHELF.y, f)}px) rotateY(${at(SHELF.rotateY, f)}deg) scale(${at(SHELF.scale, f)})`,
    '--card-tilt': `translateX(${at(TILT.x, f)}%) translateZ(${at(TILT.z, f)}px) rotateY(${at(TILT.rotateY, f)}deg)`,
    opacity: at(OPACITY, f),
    // Whichever card is nearer the centre stays on top as two of them cross.
    zIndex: Math.round(10 - Math.min(Math.abs(f), 2) * 3),
  } as CSSProperties;
}

function ArrowButton({
  direction,
  onClick,
  className,
}: {
  direction: 'prev' | 'next';
  onClick: () => void;
  className?: string;
}) {
  const Icon = direction === 'prev' ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === 'prev' ? 'Previous project' : 'Next project'}
      className={cn(
        'grid h-12 w-12 place-items-center rounded-full border border-gray-300 bg-white/80 text-gray-700 shadow-sm backdrop-blur-sm transition-colors hover:border-purple-400/60 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple-500/25 dark:border-gray-700 dark:bg-gray-900/80 dark:text-gray-200 dark:hover:border-purple-400/60 dark:hover:text-white',
        className
      )}
    >
      <Icon size={20} aria-hidden />
    </button>
  );
}

const footerLinkClass =
  'grid h-11 w-11 place-items-center rounded-xl border border-gray-300 text-gray-700 transition-colors hover:border-purple-400/60 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple-500/25 dark:border-gray-700 dark:text-gray-200 dark:hover:text-white';

export default function ProjectsCoverflow({
  projects,
}: {
  projects: ProjectProps[];
}) {
  const [category, setCategory] = useState('all');
  const [active, setActive] = useState(0);
  // Live drag or scroll distance in px, and the slot width it's measured against.
  const [scrub, setScrub] = useState({ dx: 0, slot: 1 });
  const openProjectModal = useUIStore((state) => state.openProjectModal);
  const regionRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    startX: number;
    captured: boolean;
    slot: number;
  } | null>(null);
  const suppressClick = useRef(false);

  // "All" plus only the categories that visible projects actually use.
  const filters = useMemo(() => {
    const countOf = (value: string) =>
      projects.filter((p) => getCategoryInfo(p.category).value === value)
        .length;
    return [
      { value: 'all', label: 'All', icon: Folder, count: projects.length },
      ...PROJECT_CATEGORIES.map((c) => ({
        value: c.value,
        label: c.label,
        icon: c.icon,
        count: countOf(c.value),
      })).filter((c) => c.count > 0),
    ];
  }, [projects]);

  const shown = useMemo(
    () =>
      category === 'all'
        ? projects
        : projects.filter(
            (p) => getCategoryInfo(p.category).value === category
          ),
    [projects, category]
  );

  const total = shown.length;

  // Horizontal trackpad or mouse scrolling moves the cards exactly like a drag,
  // then settles once the gesture (momentum included) goes quiet: at most one
  // project per gesture, past the same threshold. A native listener, because
  // React's wheel handler is passive and can't stop the browser's back swipe.
  useEffect(() => {
    const el = regionRef.current;
    if (!el || total < 2) return;
    let dx = 0;
    let settleTimer: ReturnType<typeof setTimeout> | undefined;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      const rail = el.querySelector<HTMLElement>('[data-rail]');
      const slot = (rail?.offsetWidth ?? 600) * SLOT_SHARE;
      dx = clamp(dx - e.deltaX, slot);
      setScrub({ dx, slot });
      clearTimeout(settleTimer);
      settleTimer = setTimeout(() => {
        const moved = dx;
        dx = 0;
        setScrub({ dx: 0, slot });
        if (Math.abs(moved) < SWIPE_THRESHOLD) return;
        const dir = moved < 0 ? 1 : -1;
        setActive((a) => (Math.min(a, total - 1) + dir + total) % total);
      }, WHEEL_SETTLE_MS);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      clearTimeout(settleTimer);
      el.removeEventListener('wheel', onWheel);
    };
  }, [total]);

  if (total === 0) return null;

  const index = Math.min(active, total - 1);
  const current = shown[index];

  const go = (to: number) => setActive(((to % total) + total) % total);

  const pickCategory = (value: string) => {
    setCategory(value);
    setActive(0);
  };

  // Cards follow the drag 1:1 along their own paths; a whole slot is the most
  // one gesture can move.
  const scrubbing = scrub.dx !== 0;
  const progress = scrub.dx / scrub.slot;

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    drag.current = {
      startX: e.clientX,
      captured: false,
      slot: e.currentTarget.offsetWidth * SLOT_SHARE,
    };
    suppressClick.current = false;
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.startX;
    // Only a real drag takes the pointer, so a tap still reaches the card.
    if (!d.captured && Math.abs(dx) > DRAG_SLOP) {
      e.currentTarget.setPointerCapture(e.pointerId);
      d.captured = true;
    }
    if (d.captured) setScrub({ dx: clamp(dx, d.slot), slot: d.slot });
  };

  const onPointerUp = (e: PointerEvent) => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    if (d.captured) setScrub({ dx: 0, slot: d.slot });
    const dx = e.clientX - d.startX;
    if (Math.abs(dx) < SWIPE_THRESHOLD) return;
    // A mouse drag still ends in a click on the card; it isn't a tap.
    suppressClick.current = true;
    go(index + (dx < 0 ? 1 : -1));
  };

  const onPointerCancel = () => {
    drag.current = null;
    setScrub((s) => ({ ...s, dx: 0 }));
  };

  const onCardClick = (k: number) => {
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    if (k === index) openProjectModal(shown[k]);
    else go(k);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      go(index + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      go(index - 1);
    }
  };

  return (
    <div className="space-y-8">
      <div
        role="group"
        aria-label="Filter projects by category"
        className="flex flex-wrap justify-center gap-3"
      >
        {filters.map(({ value, label, icon: Icon, count }) => {
          const on = value === category;
          return (
            <button
              key={value}
              type="button"
              aria-pressed={on}
              onClick={() => pickCategory(value)}
              className={cn(
                'inline-flex h-11 items-center gap-2 rounded-full border px-5 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple-500/25',
                on
                  ? 'border-transparent bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-purple-500/25'
                  : 'border-gray-300 bg-white/70 text-gray-700 backdrop-blur-sm hover:border-purple-400/60 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-900/60 dark:text-gray-300 dark:hover:border-purple-400/60 dark:hover:text-white'
              )}
            >
              <Icon size={16} aria-hidden />
              {label}
              <span
                className={cn(
                  'font-mono text-xs',
                  on ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div
        ref={regionRef}
        role="region"
        aria-roledescription="carousel"
        aria-label="Projects"
        tabIndex={0}
        onKeyDown={onKeyDown}
        className="relative rounded-3xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple-500/25"
      >
        <p className="sr-only" aria-live="polite">
          {`${current.title}, project ${index + 1} of ${total}`}
        </p>

        <AnimatePresence mode="wait" initial={false}>
          <m.div
            key={category}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div
              data-rail
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerCancel}
              className="relative mx-auto w-[min(600px,86vw)] touch-pan-y select-none [perspective:1600px]"
            >
              {/* Sizes the rail: an image band plus the fixed-height footer. */}
              <div aria-hidden className="invisible">
                <div className="aspect-[20/9]" />
                <div className="h-[76px]" />
              </div>

              {shown.map((project, k) => {
                const off = offsetFrom(k, index, total);
                const f = off + progress;
                const parked = Math.abs(off) > 1;
                const isActive = off === 0;
                const info = getCategoryInfo(project.category);
                return (
                  <div
                    key={project.id}
                    aria-hidden={parked}
                    style={cardStyle(f)}
                    className={cn(
                      'absolute inset-0 flex flex-col overflow-hidden rounded-2xl border bg-white [transform:var(--card-shelf)] motion-reduce:transition-none dark:bg-gray-900 md:[transform:var(--card-tilt)]',
                      // Follow the pointer instantly; ease into place once it lets go.
                      scrubbing
                        ? 'transition-none'
                        : 'transition-[transform,opacity,box-shadow] duration-700 [transition-timing-function:cubic-bezier(0.2,0.8,0.2,1)]',
                      isActive
                        ? 'border-gray-300 shadow-2xl shadow-purple-500/25 dark:border-gray-600'
                        : 'border-gray-200 dark:border-gray-800',
                      parked && 'pointer-events-none'
                    )}
                  >
                    {/* Underlay: the whole card is the click target; footer actions sit above it. */}
                    <button
                      type="button"
                      onClick={() => onCardClick(k)}
                      aria-label={
                        isActive
                          ? `Open ${project.title} details`
                          : `Show ${project.title}`
                      }
                      tabIndex={parked ? -1 : 0}
                      className="absolute inset-0 rounded-2xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-purple-500/40"
                    />

                    <div className="pointer-events-none relative min-h-0 flex-1 bg-gray-100 dark:bg-gray-800">
                      {project.thumbnail_url ? (
                        <Image
                          src={project.thumbnail_url}
                          alt=""
                          fill
                          draggable={false}
                          sizes="(max-width: 768px) 86vw, 600px"
                          className="object-cover"
                        />
                      ) : (
                        <span className="flex h-full items-center justify-center bg-gradient-to-br from-blue-500/20 to-purple-600/20 font-mono text-gray-600 dark:text-gray-300">
                          {project.title}
                        </span>
                      )}
                    </div>

                    <div className="pointer-events-none relative flex h-[76px] shrink-0 items-center gap-3 border-t border-gray-200 px-4 dark:border-gray-800 sm:px-5">
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-base font-bold text-gray-900 dark:text-white sm:text-lg">
                          {project.title}
                        </h3>
                        <p className="truncate font-mono text-xs text-gray-500 dark:text-gray-400">
                          <span className="text-purple-600 dark:text-purple-400">
                            {pad(k + 1)}/{pad(total)}
                          </span>
                          {` · ${info.label}`}
                          {project.year && ` · ${project.year}`}
                        </p>
                      </div>

                      <div
                        className={cn(
                          'flex shrink-0 gap-2 transition-opacity duration-300',
                          isActive
                            ? 'pointer-events-auto opacity-100'
                            : 'pointer-events-none opacity-0'
                        )}
                      >
                        {project.projectUrl && (
                          <a
                            href={project.projectUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${project.title} live site`}
                            title="Live site"
                            tabIndex={isActive ? 0 : -1}
                            className={footerLinkClass}
                          >
                            <ArrowUpRight size={16} aria-hidden />
                          </a>
                        )}
                        {project.demoUrl && (
                          <a
                            href={project.demoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${project.title} demo`}
                            title="Demo"
                            tabIndex={isActive ? 0 : -1}
                            className={footerLinkClass}
                          >
                            <CirclePlay size={16} aria-hidden />
                          </a>
                        )}
                        {project.githubUrl && (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${project.title} source code`}
                            title="Source code"
                            tabIndex={isActive ? 0 : -1}
                            className={footerLinkClass}
                          >
                            <SiGithub size={15} aria-hidden />
                          </a>
                        )}
                      </div>
                    </div>

                    <span
                      aria-hidden
                      style={{ opacity: Math.min(Math.abs(f), 1) }}
                      className={cn(
                        'pointer-events-none absolute inset-0 bg-white/50 dark:bg-gray-950/55',
                        !scrubbing && 'transition-opacity duration-700'
                      )}
                    />
                  </div>
                );
              })}
            </div>
          </m.div>
        </AnimatePresence>

        {total > 1 && (
          <>
            <ArrowButton
              direction="prev"
              onClick={() => go(index - 1)}
              className="absolute left-0 top-1/2 z-10 hidden -translate-y-1/2 md:grid"
            />
            <ArrowButton
              direction="next"
              onClick={() => go(index + 1)}
              className="absolute right-0 top-1/2 z-10 hidden -translate-y-1/2 md:grid"
            />
          </>
        )}
      </div>

      {total > 1 && (
        <div className="flex items-center justify-center gap-2">
          <ArrowButton
            direction="prev"
            onClick={() => go(index - 1)}
            className="md:hidden"
          />
          <div className="flex">
            {shown.map((project, k) => (
              <button
                key={project.id}
                type="button"
                onClick={() => go(k)}
                aria-label={`Show ${project.title}`}
                aria-current={k === index}
                className="group grid h-11 w-9 place-items-center focus-visible:outline-none"
              >
                <span
                  className={cn(
                    'h-2 rounded-full transition-all duration-300 group-focus-visible:ring-4 group-focus-visible:ring-purple-500/30',
                    k === index
                      ? 'w-6 bg-gradient-to-r from-blue-500 to-purple-600'
                      : 'w-2 bg-gray-300 group-hover:bg-gray-400 dark:bg-gray-600 dark:group-hover:bg-gray-500'
                  )}
                />
              </button>
            ))}
          </div>
          <ArrowButton
            direction="next"
            onClick={() => go(index + 1)}
            className="md:hidden"
          />
        </div>
      )}
    </div>
  );
}
