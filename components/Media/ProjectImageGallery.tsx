'use client';

import React from 'react';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { m, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Loader2, Monitor } from 'lucide-react';
import { getProjectImages, type UploadedFile } from '@lib/fileManager';

interface ProjectImageGalleryProps {
  projectId: string;
  compact?: boolean;
}

export default function ProjectImageGallery({
  projectId,
  compact = false,
}: ProjectImageGalleryProps) {
  const [images, setImages] = useState<UploadedFile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  // Keyed per size: a loaded thumbnail doesn't mean the larger copy has loaded.
  const [loaded, setLoaded] = useState<ReadonlySet<string>>(() => new Set());
  const markLoaded = (key: string) =>
    setLoaded((prev) => (prev.has(key) ? prev : new Set(prev).add(key)));
  const fadeIn = (key: string) =>
    `transition-opacity duration-300 ${loaded.has(key) ? 'opacity-100' : 'opacity-0'}`;

  const thumbnailContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadImages = async () => {
      try {
        const projectImages = await getProjectImages(projectId);
        setImages(projectImages);
      } catch (error) {
        console.error('Failed to load project images:', error);
      } finally {
        setLoading(false);
      }
    };
    loadImages();
  }, [projectId]);

  useEffect(() => {
    const strip = thumbnailContainerRef.current;
    const thumb = strip?.children[currentIndex] as HTMLElement | undefined;
    if (!strip || !thumb) return;
    const offset =
      thumb.getBoundingClientRect().left - strip.getBoundingClientRect().left;
    strip.scrollTo({
      left:
        strip.scrollLeft + offset - (strip.clientWidth - thumb.offsetWidth) / 2,
      behavior: 'smooth',
    });
  }, [currentIndex]);

  const nextImage = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const prevImage = () =>
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-48 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800" />
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 w-16 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800"
            />
          ))}
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="rounded-3xl border-2 border-dashed border-gray-300 py-16 text-center text-gray-400 dark:border-gray-700 dark:text-gray-500">
        <Monitor size={48} className="mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium">No Images Available</p>
        <p className="mt-1 text-sm">
          Images for this project will appear here once uploaded.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="relative overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800">
          <div className={`relative ${compact ? 'h-52 sm:h-60' : 'h-96'}`}>
            <Image
              src={images[currentIndex].url}
              alt={images[currentIndex].alt}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className={`object-contain ${fadeIn(`main:${images[currentIndex].url}`)}`}
              onClick={() => setIsFullscreen(true)}
              onLoad={() => markLoaded(`main:${images[currentIndex].url}`)}
              onError={() => markLoaded(`main:${images[currentIndex].url}`)}
              priority={true}
            />
            {!loaded.has(`main:${images[currentIndex].url}`) && (
              <div
                role="status"
                className="pointer-events-none absolute inset-0 grid place-items-center"
              >
                <Loader2
                  aria-hidden
                  className="h-6 w-6 animate-spin text-gray-400 dark:text-gray-500"
                />
                <span className="sr-only">Loading image</span>
              </div>
            )}

            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            {images.length > 1 && (
              <div className="absolute bottom-3 right-3 rounded-full bg-black/70 px-2 py-1 text-xs text-white">
                {currentIndex + 1} / {images.length}
              </div>
            )}
          </div>

          {images[currentIndex].caption && (
            <div className="bg-white p-4 dark:bg-gray-900">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {images[currentIndex].caption}
              </p>
            </div>
          )}
        </div>

        {images.length > 1 && (
          <div
            ref={thumbnailContainerRef}
            className="scrollbar-hide flex gap-2 overflow-x-auto px-1 pb-2 pt-1"
          >
            {images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => setCurrentIndex(index)}
                className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                  index === currentIndex
                    ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800'
                    : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                }`}
              >
                {!loaded.has(`thumb:${image.url}`) && (
                  <span
                    aria-hidden
                    className="absolute inset-0 animate-pulse bg-gray-200 dark:bg-gray-700"
                  />
                )}
                <Image
                  src={image.url}
                  alt={image.alt}
                  fill
                  sizes="80px"
                  className={`object-cover ${fadeIn(`thumb:${image.url}`)}`}
                  onLoad={() => markLoaded(`thumb:${image.url}`)}
                  onError={() => markLoaded(`thumb:${image.url}`)}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {isFullscreen && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 p-4"
            onClick={() => setIsFullscreen(false)}
          >
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute right-4 top-4 p-2 text-white hover:text-gray-300"
            >
              <X className="h-6 w-6" />
            </button>

            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-white hover:text-gray-300"
                >
                  <ChevronLeft className="h-8 w-8" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white hover:text-gray-300"
                >
                  <ChevronRight className="h-8 w-8" />
                </button>
              </>
            )}

            <m.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative h-full max-h-[90vh] w-full max-w-5xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={images[currentIndex].url}
                alt={images[currentIndex].alt}
                fill
                sizes="100vw"
                className={`object-contain ${fadeIn(`full:${images[currentIndex].url}`)}`}
                onLoad={() => markLoaded(`full:${images[currentIndex].url}`)}
                onError={() => markLoaded(`full:${images[currentIndex].url}`)}
              />
              {!loaded.has(`full:${images[currentIndex].url}`) && (
                <div
                  role="status"
                  className="pointer-events-none absolute inset-0 grid place-items-center"
                >
                  <Loader2
                    aria-hidden
                    className="h-8 w-8 animate-spin text-white/70"
                  />
                  <span className="sr-only">Loading image</span>
                </div>
              )}
            </m.div>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-white">
              {images.length > 1 && (
                <p className="mb-1 text-sm">
                  {currentIndex + 1} / {images.length}
                </p>
              )}
              {images[currentIndex].caption && (
                <p className="text-sm text-gray-300">
                  {images[currentIndex].caption}
                </p>
              )}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}
