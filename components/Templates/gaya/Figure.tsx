'use client';

import Image from 'next/image';
import type { Item } from './data';
import { useDark, useGarment } from './garment';

export default function Figure({
  item,
  alt,
  sizes,
  priority = false,
  className = '',
}: {
  item: Item;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  const garment = useGarment();
  const dark = useDark();
  const shoe = item.kind === 'shoes';
  const ratio = shoe ? 'aspect-[804/500]' : 'aspect-[687/944]';
  return (
    <span className={`relative block ${ratio} ${className}`}>
      <Image
        src={garment(item)}
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
