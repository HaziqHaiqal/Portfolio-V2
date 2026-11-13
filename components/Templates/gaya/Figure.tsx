'use client';

import Image from 'next/image';
import { imageOf } from './data';
import { useDark, useGarment } from './garment';

export default function Figure({
  id,
  alt,
  sizes,
  priority = false,
  className = '',
}: {
  id: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  const garment = useGarment();
  const dark = useDark();
  const shoe = id.startsWith('shoe-');
  const ratio = shoe ? 'aspect-[804/500]' : 'aspect-[687/944]';
  return (
    <span className={`relative block ${ratio} ${className}`}>
      <Image
        src={shoe ? imageOf(id) : garment(id)}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        unoptimized
        className={`object-contain ${shoe || dark ? '' : 'mix-blend-multiply'}`}
      />
    </span>
  );
}
