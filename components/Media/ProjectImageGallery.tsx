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
  const [viewing, setViewing] = useState<number | null>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getProjectImages(projectId)
      .then(setImages)
      .catch((error) => console.error('Failed to load project images:', error))
      .finally(() => setLoading(false));
  }, [projectId]);

  const markLoaded = (url: string) =>
    setLoaded((prev) => (prev.has(url) ? prev : new Set(prev).add(url)));

  const step = useCallback(
    (direction: 1 | -1) =>
      setViewing((index) =>
        index === null
          ? index
          : (index + direction + images.length) % images.length
      ),
    [images.length]
  );

  // Captured on document so Escape closes the viewer, not the project modal.
  useEffect(() => {
    if (viewing === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        setViewing(null);
      }
      if (event.key === 'ArrowRight') step(1);
      if (event.key === 'ArrowLeft') step(-1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [viewing, step]);

  const scrollStrip = (direction: 1 | -1) => {
    const strip = stripRef.current;
    if (strip)
      strip.scrollBy({
        left: direction * strip.clientWidth * 0.8,
        behavior: 'smooth',
      });
  };

  if (loading) {
    return (
      <div className={`flex gap-3 overflow-hidden ${className}`}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-56 w-40 shrink-0 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-700/50 sm:h-72 sm:w-48"
          />
        ))}
      </div>
    );
  }

  if (images.length === 0) return null;
  const current = viewing === null ? null : images[viewing];

  return (
    <div className={className}>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h3 className="font-bold text-gray-900 dark:text-white">
          Screenshots
          <span className="ml-2 font-mono text-xs font-normal text-gray-500 dark:text-gray-400">
            {images.length}
          </span>
        </h3>
        {images.length > 2 && (
          <div className="hidden gap-2 sm:flex">
            <button
              type="button"
              onClick={() => scrollStrip(-1)}
              aria-label="Scroll screenshots left"
              className={ARROW}
            >
              <ChevronLeft size={17} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => scrollStrip(1)}
              aria-label="Scroll screenshots right"
              className={ARROW}
            >
              <ChevronRight size={17} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      <div
        ref={stripRef}
        className="scrollbar-hide -mx-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-6 pb-2 md:-mx-8 md:px-8"
      >
        {images.map((image, index) => (
          <button
            key={image.id}
            type="button"
            onClick={() => setViewing(index)}
            aria-label={`View screenshot ${index + 1} of ${images.length}`}
            className={`relative h-56 shrink-0 snap-start overflow-hidden rounded-xl bg-gray-100 ring-1 ring-gray-900/5 transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple-500/40 dark:bg-gray-700/50 dark:ring-white/10 sm:h-72 ${
              loaded.has(image.url) ? '' : 'w-40 animate-pulse sm:w-48'
            }`}
          >
            <Image
              src={image.url}
              alt={image.alt}
              width={0}
              height={0}
              sizes="(max-width: 640px) 70vw, 420px"
              onLoad={() => markLoaded(image.url)}
              onError={() => markLoaded(image.url)}
              className={`h-full w-auto max-w-[75vw] object-contain transition-opacity duration-300 sm:max-w-[34rem] ${
                loaded.has(image.url) ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </button>
        ))}
      </div>

      <AnimatePresence>
        {current && (
          <m.div
            role="dialog"
            aria-modal="true"
            aria-label={`Screenshot ${(viewing ?? 0) + 1} of ${images.length}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 p-4"
            onClick={() => setViewing(null)}
          >
            <button
              type="button"
              onClick={() => setViewing(null)}
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
                  {(viewing ?? 0) + 1} / {images.length}
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
