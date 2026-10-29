'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { m, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { getProjectImages, type UploadedFile } from '@lib/fileManager';

const ARROW =
  'flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple-500/20 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-500 dark:hover:text-white';

/** Renders nothing until the project has at least one image. */
export default function ProjectImageGallery({
  projectId,
  className = '',
}: {
  projectId: string;
  className?: string;
}) {
  const [images, setImages] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState<ReadonlySet<string>>(() => new Set());
  const [active, setActive] = useState(0);
  const [viewing, setViewing] = useState(false);
  const thumbsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getProjectImages(projectId)
      .then((list) => {
        setImages(list);
        setActive(0);
      })
      .catch((error) => console.error('Failed to load project images:', error))
      .finally(() => setLoading(false));
  }, [projectId]);

  const markLoaded = (url: string) =>
    setLoaded((prev) => (prev.has(url) ? prev : new Set(prev).add(url)));

  const step = useCallback(
    (direction: 1 | -1) =>
      setActive((index) => (index + direction + images.length) % images.length),
    [images.length]
  );

  // Captured on document so Escape closes the viewer, not the project modal.
  useEffect(() => {
    if (!viewing) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        setViewing(false);
      }
      if (event.key === 'ArrowRight') step(1);
      if (event.key === 'ArrowLeft') step(-1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [viewing, step]);

  // Scrolls only the thumbnail row, so the modal never jumps.
  useEffect(() => {
    const row = thumbsRef.current;
    const thumb = row?.children[active] as HTMLElement | undefined;
    if (!row || !thumb) return;
    row.scrollTo({
      left: thumb.offsetLeft - (row.clientWidth - thumb.offsetWidth) / 2,
      behavior: 'smooth',
    });
  }, [active]);

  if (loading) {
    return (
      <div className={className}>
        <div className="aspect-video animate-pulse rounded-xl bg-gray-100 dark:bg-gray-700/50" />
        <div className="mt-4 flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="aspect-video h-14 shrink-0 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-700/50 sm:h-16"
            />
          ))}
        </div>
      </div>
    );
  }

  if (images.length === 0) return null;
  const current = images[active] ?? images[0];

  return (
    <div className={className}>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h3 className="font-bold text-gray-900 dark:text-white">
          Screenshots
          <span className="ml-2 font-mono text-xs font-normal text-gray-500 dark:text-gray-400">
            {images.length}
          </span>
        </h3>
        {images.length > 1 && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous screenshot"
              className={ARROW}
            >
              <ChevronLeft size={17} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next screenshot"
              className={ARROW}
            >
              <ChevronRight size={17} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => setViewing(true)}
        aria-label={`Open screenshot ${active + 1} of ${images.length} full screen`}
        className="relative block aspect-video w-full overflow-hidden rounded-xl bg-gray-100 ring-1 ring-gray-900/5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple-500/40 dark:bg-gray-900/60 dark:ring-white/10"
      >
        <Image
          key={current.id}
          src={current.url}
          alt={current.alt}
          fill
          sizes="(max-width: 768px) 100vw, 704px"
          onLoad={() => markLoaded(current.url)}
          onError={() => markLoaded(current.url)}
          className={`object-contain transition-opacity duration-300 ${
            loaded.has(current.url) ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </button>
      {current.caption && (
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          {current.caption}
        </p>
      )}

      {images.length > 1 && (
        <div
          ref={thumbsRef}
          className="scrollbar-hide relative -mx-1 mt-3 flex gap-2 overflow-x-auto p-1"
        >
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Show screenshot ${index + 1} of ${images.length}`}
              aria-current={index === active ? 'true' : undefined}
              className={`relative aspect-video h-14 shrink-0 overflow-hidden rounded-lg bg-gray-100 transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple-500/40 dark:bg-gray-700/50 sm:h-16 ${
                index === active
                  ? 'ring-2 ring-purple-500'
                  : 'opacity-60 ring-1 ring-gray-900/5 hover:opacity-100 dark:ring-white/10'
              }`}
            >
              <Image
                src={image.url}
                alt=""
                fill
                sizes="120px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {viewing && (
          <m.div
            role="dialog"
            aria-modal="true"
            aria-label={`Screenshot ${active + 1} of ${images.length}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 p-4"
            onClick={() => setViewing(false)}
          >
            <button
              type="button"
              onClick={() => setViewing(false)}
              aria-label="Close screenshot"
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X size={22} />
            </button>

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    step(-1);
                  }}
                  aria-label="Previous screenshot"
                  className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    step(1);
                  }}
                  aria-label="Next screenshot"
                  className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            <m.div
              key={current.id}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative h-full max-h-[85dvh] w-full max-w-5xl"
              onClick={(event) => event.stopPropagation()}
            >
              <Image
                src={current.url}
                alt={current.alt}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </m.div>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-sm text-white">
              {images.length > 1 && (
                <p>
                  {active + 1} / {images.length}
                </p>
              )}
              {current.caption && (
                <p className="mt-1 text-gray-300">{current.caption}</p>
              )}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
