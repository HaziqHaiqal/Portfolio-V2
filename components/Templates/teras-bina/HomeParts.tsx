'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import Photo from '@components/Templates/Photo';
import { HoverPreview } from '@components/Templates/motion';
import { BASE_PATH, SERVICES } from './data';

export function ServicesList() {
  const items = SERVICES.map((service) => ({ ...service, key: service.id }));

  return (
    <HoverPreview
      items={items}
      imageClassName="h-64 w-80"
      className="border-b border-tpl-line"
      renderRow={(item) => (
        <Link
          href={`${BASE_PATH}/services`}
          className="group grid items-center gap-4 border-t border-tpl-line py-7 md:grid-cols-[1.4fr_1fr_auto] md:gap-10 md:py-10"
        >
          <span className="relative aspect-[16/9] overflow-hidden rounded-2xl md:hidden">
            <Photo
              src={item.image}
              alt=""
              fill
              sizes="100vw"
              className="object-cover"
            />
          </span>
          <span className="text-3xl font-semibold tracking-[-0.03em] transition-transform duration-500 md:text-6xl md:group-hover:translate-x-4">
            {item.title}
          </span>
          <span className="text-tpl-muted">{item.text}</span>
          <span className="hidden h-14 w-14 items-center justify-center rounded-full border border-tpl-line transition-colors group-hover:border-tpl-accent group-hover:bg-tpl-accent group-hover:text-tpl-on-accent md:flex">
            <ArrowUpRight size={22} aria-hidden="true" />
          </span>
        </Link>
      )}
    />
  );
}
