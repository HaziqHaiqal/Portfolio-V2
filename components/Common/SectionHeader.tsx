'use client';

import { m } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface SectionHeaderProps {
  icon: LucideIcon;
  label: string;
  title: string;
  accentClass: string;
  gradientClass: string;
  className?: string;
}

export default function SectionHeader({
  icon: Icon,
  label,
  title,
  accentClass,
  gradientClass,
  className = '',
}: SectionHeaderProps) {
  return (
    <m.div
      className={`mb-10 text-center md:mb-12 ${className}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      <div className="mb-3 inline-flex items-center gap-2 font-mono text-sm">
        <Icon size={16} className={accentClass} />
        <span className="text-gray-500 dark:text-gray-400">{label}</span>
      </div>
      <h2 className="mb-4 text-3xl font-extrabold text-gray-900 dark:text-gray-100 md:text-4xl">
        {title}
      </h2>
      <div
        className={`mx-auto h-[3px] w-11 rounded-full bg-gradient-to-r ${gradientClass}`}
      />
    </m.div>
  );
}
