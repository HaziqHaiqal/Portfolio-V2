'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Monitor } from 'lucide-react';
import { getProjectImages, type ProjectImage } from '../lib/imageUpload';

interface ProjectImageGalleryProps {
  projectId: string;
}

export default function ProjectImageGallery({ projectId }: ProjectImageGalleryProps) {
  const [images, setImages] = useState<ProjectImage[]>([]);
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
  const prevImage = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  const scrollThumbnails = (direction: 'left' | 'right') => {
    const el = thumbnailContainerRef.current;
    if (el) {
      const scrollAmount = direction === 'right' ? el.clientWidth * 0.8 : -el.clientWidth * 0.8;
      el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl h-48 animate-pulse" />
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-lg h-16 w-16 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="text-center py-16 rounded-3xl border-2 border-dashed border-gray-300 dark:border-gray-700 text-gray-400 dark:text-gray-500">
        <Monitor size={48} className="mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium">No Images Available</p>
        <p className="text-sm mt-1">Images for this project will appear here once uploaded.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Main Image */}
        <div className="relative bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden">
          <div className="relative h-96">
            <Image
              src={images[currentIndex].url}
              alt={images[currentIndex].alt}
              fill
              className="object-contain"
              onClick={() => setIsFullscreen(true)}
              priority={true}
            />
            
            {/* Navigation Arrows - Only show if multiple images */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Image Counter */}
            {images.length > 1 && (
              <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                {currentIndex + 1} / {images.length}
              </div>
            )}
          </div>

          {/* Caption */}
          {images[currentIndex].caption && (
            <div className="p-4 bg-white dark:bg-gray-900">
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
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 dark:bg-gray-900/80 hover:bg-white dark:hover:bg-gray-900 shadow-md rounded-full p-1 transition-all"
              >
                <ChevronLeft className="w-5 h-5 text-gray-800 dark:text-gray-200" />
              </button>
            )}
            <div
              ref={thumbnailContainerRef}
              onScroll={checkScrollability}
              className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
            >
              {images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setCurrentIndex(index)}
                  className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    index === currentIndex
                      ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Image
                    src={image.url}
                    alt={image.alt}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
            {canScrollRight && (
              <button
                onClick={() => scrollThumbnails('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 dark:bg-gray-900/80 hover:bg-white dark:hover:bg-gray-900 shadow-md rounded-full p-1 transition-all"
              >
                <ChevronRight className="w-5 h-5 text-gray-800 dark:text-gray-200" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center p-4"
            onClick={() => setIsFullscreen(false)}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 p-2"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 p-2"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 p-2"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}

            {/* Fullscreen Image */}
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-5xl max-h-[90vh] w-full h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={images[currentIndex].url}
                alt={images[currentIndex].alt}
                fill
                className="object-contain"
              />
            </motion.div>

            {/* Image Info */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-white">
              {images.length > 1 && (
                <p className="text-sm mb-1">{currentIndex + 1} / {images.length}</p>
              )}
              {images[currentIndex].caption && (
                <p className="text-sm text-gray-300">{images[currentIndex].caption}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 