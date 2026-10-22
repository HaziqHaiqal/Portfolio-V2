'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { giveHandoff, HANDOFF } from '@lib/handoff';

/** Opens this template's order dialog on the services page. */
export default function UseTemplateLink({
  slug,
  className,
  children,
}: {
  slug: string;
  className: string;
  children: ReactNode;
}) {
  return (
    <Link
      href="/services"
      onClick={() => giveHandoff(HANDOFF.templateOrder, slug)}
      className={className}
    >
      {children}
    </Link>
  );
}
