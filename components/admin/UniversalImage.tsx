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
}

/**
 * UniversalImage handles both Supabase-hosted images (optimized via Next Image)
 * and external URLs (raw <img>) so we don't need to whitelist every remote host.
 *
 * For Supabase URLs we render Next Image in `fill` mode inside a sized,
 * relative, overflow-hidden wrapper. This avoids the Next 16 warning
 * "has either width or height modified, but not the other" that fires when
 * callers apply CSS sizing that distorts the natural aspect ratio.
 */
export default function UniversalImage({ src, alt, width, height, className, fallback }: UniversalImageProps) {
  const [imgError, setImgError] = useState(false);
  const [imgSrc, setImgSrc] = useState(src);

  const isSupabaseUrl = imgSrc?.includes('supabase.co') || imgSrc?.includes('supabase');

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

    const finalSrc = imgError ? fallback : imgSrc;

    // We intentionally use <img> for non-Supabase remote URLs to avoid
    // Next Image remote-host allowlist configuration.
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={finalSrc}
        alt={alt}
        className={className}
        onError={handleError}
        loading="lazy"
        width={width > 0 ? width : undefined}
        height={height > 0 ? height : undefined}
      />
    );
  }

  // Unsized mode: caller sizes via CSS (used for preview thumbnails that
  // should display at natural aspect ratio).
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
      />
    </div>
  );
}
