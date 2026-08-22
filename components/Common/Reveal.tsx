'use client';

import { m } from 'framer-motion';
import type { ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  className?: string;
  y?: number;
  scale?: number;
  duration?: number;
  delay?: number;
}

export default function Reveal({
  children,
  className,
  y,
  scale,
  duration,
  delay,
}: RevealProps) {
  const from = {
    opacity: 0,
    ...(y !== undefined && { y }),
    ...(scale !== undefined && { scale }),
  };
  const to = {
    opacity: 1,
    ...(y !== undefined && { y: 0 }),
    ...(scale !== undefined && { scale: 1 }),
  };

  return (
    <m.div
      className={className}
      initial={from}
      whileInView={to}
      viewport={{ once: true }}
      transition={{
        ...(duration !== undefined && { duration }),
        ...(delay !== undefined && { delay }),
      }}
    >
      {children}
    </m.div>
  );
}
