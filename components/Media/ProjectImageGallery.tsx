'use client';

import React from 'react';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { m, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Monitor } from 'lucide-react';
import { getProjectImages, type UploadedFile } from '@lib/fileManager';

interface ProjectImageGalleryProps {
  projectId: string;
  /** Shorter hero when embedded in project modal */
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

  const thumbnailContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

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

  const checkScrollability = () => {
    const el = thumbnailContainerRef.current;
    if (el) {
      setCanScrollLeft(el.scrollLeft > 0);
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth);
    }
  };

  useEffect(() => {
    const el = thumbnailContainerRef.current;
    if (!el) return;

    checkScrollability();
    const resizeObserver = new ResizeObserver(checkScrollability);
    resizeObserver.observe(el);

    return () => resizeObserver.disconnect();
  }, [images]);

  const nextImage = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const prevImage = () =>
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  const scrollThumbnails = (direction: 'left' | 'right') => {
    const el = thumbnailContainerRef.current;
    if (el) {
      const scrollAmount =
        direction === 'right' ? el.clientWidth * 0.8 : -el.clientWidth * 0.8;
      el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

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
        {/* Main Image */}
        <div className="relative overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800">
          <div className={`relative ${compact ? 'h-52 sm:h-60' : 'h-96'}`}>
            <Image
              src={images[currentIndex].url}
              alt={images[currentIndex].alt}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-contain"
              onClick={() => setIsFullscreen(true)}
              priority={true}
            />

            {/* Navigation Arrows - Only show if multiple images */}
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

            {/* Image Counter */}
            {images.length > 1 && (
              <div className="absolute bottom-3 right-3 rounded-full bg-black/70 px-2 py-1 text-xs text-white">
                {currentIndex + 1} / {images.length}
              </div>
            )}
          </div>

          {/* Caption */}
          {images[currentIndex].caption && (
            <div className="bg-white p-4 dark:bg-gray-900">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {images[currentIndex].caption}
              </p>
            </div>
          )}
        </div>

        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <div className="relative">
            {canScrollLeft && (
              <button
                onClick={() => scrollThumbnails('left')}
                className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/80 p-1 shadow-md transition-all hover:bg-white dark:bg-gray-900/80 dark:hover:bg-gray-900"
              >
                <ChevronLeft className="h-5 w-5 text-gray-800 dark:text-gray-200" />
              </button>
            )}
            <div
              ref={thumbnailContainerRef}
              onScroll={checkScrollability}
              className="scrollbar-hide flex gap-2 overflow-x-auto pb-2"
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
                  <Image
                    src={image.url}
                    alt={image.alt}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
            {canScrollRight && (
              <button
                onClick={() => scrollThumbnails('right')}
                className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/80 p-1 shadow-md transition-all hover:bg-white dark:bg-gray-900/80 dark:hover:bg-gray-900"
              >
                <ChevronRight className="h-5 w-5 text-gray-800 dark:text-gray-200" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 p-4"
            onClick={() => setIsFullscreen(false)}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute right-4 top-4 p-2 text-white hover:text-gray-300"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Navigation Arrows */}
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

            {/* Fullscreen Image */}
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
                className="object-contain"
              />
            </m.div>

            {/* Image Info */}
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
