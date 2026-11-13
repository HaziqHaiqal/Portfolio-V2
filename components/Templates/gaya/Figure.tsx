import Image from 'next/image';
import { imageOf } from './data';

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
  const ratio = id.startsWith('shoe-')
    ? 'aspect-[804/500]'
    : 'aspect-[687/944]';
  return (
    <span className={`relative block ${ratio} ${className}`}>
      <Image
        src={imageOf(id)}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        unoptimized
        className="object-contain"
      />
    </span>
  );
}
