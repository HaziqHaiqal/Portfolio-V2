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
 * UniversalImage component that handles both Supabase-hosted images (via Next.js Image)
 * and external URLs (via regular img tag) to avoid Next.js image domain configuration issues
 */
export default function UniversalImage({ src, alt, width, height, className, fallback }: UniversalImageProps) {
  const [imgError, setImgError] = useState(false);
  const [imgSrc, setImgSrc] = useState(src);

  // Check if URL is from Supabase storage (use Next.js Image optimization)
  const isSupabaseUrl = imgSrc?.includes('supabase.co') || imgSrc?.includes('supabase');

  // If error occurs, try fallback
  const handleError = () => {
    if (fallback && imgSrc !== fallback) {
      setImgSrc(fallback);
    } else {
      setImgError(true);
    }
  };

  // If it's an external URL, use regular img tag (bypasses Next.js image restrictions)
  if (!isSupabaseUrl || imgError) {
    const imgProps: React.ImgHTMLAttributes<HTMLImageElement> = {
      src: imgError ? fallback || '/placeholder-company.png' : imgSrc,
      alt,
      className,
      onError: handleError,
      loading: 'lazy' as const,
    };
    
    // Only add width/height if they're not 0 (for responsive images)
    if (width > 0) imgProps.width = width;
    if (height > 0) imgProps.height = height;
    
    return <img {...imgProps} />;
  }

  // For Supabase URLs, use Next.js Image for optimization
  // If width/height are 0, use unoptimized with auto sizing
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
        unoptimized={false}
      />
    );
  }

  return (
    <NextImage
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={handleError}
      unoptimized={false}
    />
  );
}

