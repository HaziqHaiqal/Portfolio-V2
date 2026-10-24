'use client';

import Image, { type ImageLoader, type ImageProps } from 'next/image';
import type { Picture } from './data';

// Wikimedia only serves its standard thumbnail widths, so each request is
// rounded up to the nearest one. The photos are linked, not stored.
const WIDTHS = [330, 500, 960, 1280];

const commons: ImageLoader = ({ src, width }) => {
  const size = WIDTHS.find((step) => step >= width) ?? 1280;
  return `https://upload.wikimedia.org/wikipedia/commons/thumb/${src}/${size}px-${src.split('/').at(-1)}`;
};

const direct: ImageLoader = ({ src, width }) => `${src}?w=${width}`;

export default function Pic({
  picture,
  alt,
  ...props
}: { picture: Picture; alt?: string } & Omit<
  ImageProps,
  'src' | 'alt' | 'loader'
>) {
  return (
    <Image
      src={picture.src}
      alt={alt ?? picture.alt}
      loader={picture.src.startsWith('http') ? direct : commons}
      {...props}
    />
  );
}
