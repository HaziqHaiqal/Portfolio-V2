'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { giveHandoff, HANDOFF } from '@lib/handoff';
import type { ServicePick } from '@components/Service/servicePick';

/** Opens Services on one pricing tab. */
export default function PickLink({
  pick,
  className,
  children,
}: {
  pick: ServicePick;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href="/services"
      onClick={() => giveHandoff(HANDOFF.servicePick, JSON.stringify(pick))}
      className={className}
    >
      {children}
    </Link>
  );
}
