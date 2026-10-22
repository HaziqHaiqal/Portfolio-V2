'use client';

import NextImage from 'next/image';
import { useState } from 'react';

interface UniversalImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  fallback?: string;
  /** 'eager' for an above-the-fold image that may be the LCP. */
  loading?: 'eager' | 'lazy';
}

export default function UniversalImage({
  src,
  alt,
  width,
  height,
  className,
  fallback,
  loading,
}: UniversalImageProps) {
  const [imgError, setImgError] = useState(false);
  const [imgSrc, setImgSrc] = useState(src);

  const isSupabaseUrl =
    imgSrc?.includes('supabase.co') || imgSrc?.includes('supabase');

  const handleError = () => {
    if (fallback && imgSrc !== fallback) {
      setImgSrc(fallback);
    } else {
      setImgError(true);
    }
  };

  if (!isSupabaseUrl || imgError) {
    if (imgError && !fallback) {
      return (
        <div
          role="img"
          aria-label={alt}
          className={className}
          style={{
            width: width > 0 ? `${width}px` : undefined,
            height: height > 0 ? `${height}px` : undefined,
          }}
        />
      );
    }

    const finalSrc = (imgError ? fallback : imgSrc) as string;

    if (width > 0 && height > 0) {
      return (
        <div
          className={className}
          style={{
            position: 'relative',
            width: `${width}px`,
            height: `${height}px`,
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          <NextImage
            src={finalSrc}
            alt={alt}
            fill
            sizes={`${Math.max(width, height)}px`}
            className={className}
            onError={handleError}
            loading={loading}
            unoptimized
          />
        </div>
      );
    }

    return (
      <NextImage
        src={finalSrc}
        alt={alt}
        width={0}
        height={0}
        sizes="100vw"
        className={className}
        onError={handleError}
        loading={loading}
        unoptimized
      />
    );
  }

  if (width === 0 || height === 0) {
    return (
      <NextImage
        src={imgSrc}
        alt={alt}
        width={0}
        height={0}
        sizes="100vw"
        className={className}
        onError={handleError}
        loading={loading}
      />
    );
  }

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: `${width}px`,
        height: `${height}px`,
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      <NextImage
        src={imgSrc}
        alt={alt}
        fill
        sizes={`${Math.max(width, height)}px`}
        className={className}
        onError={handleError}
        loading={loading}
      />
    </div>
  );
}
