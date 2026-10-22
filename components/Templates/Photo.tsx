'use client';

import Image, { type ImageLoader, type ImageProps } from 'next/image';

// Demo photos are hotlinked from Unsplash and Pexels, which resize on their
// own CDNs, so they skip Next's optimiser and the repo stores no photo files.
const stockPhoto: ImageLoader = ({ src, width, quality }) =>
  src.includes('images.pexels.com')
    ? `${src}?auto=compress&cs=tinysrgb&w=${width}`
    : `${src}?w=${width}&q=${quality ?? 70}&auto=format&fit=crop`;

export default function Photo({ alt, ...props }: ImageProps) {
  return <Image loader={stockPhoto} alt={alt} {...props} />;
}
