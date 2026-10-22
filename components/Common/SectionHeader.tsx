import Reveal from '@components/Common/Reveal';
import type { ComponentType } from 'react';

type SectionIcon = ComponentType<{ size?: number; className?: string }>;

interface SectionHeaderProps {
  icon: SectionIcon;
  title: string;
  accentClass: string;
  gradientClass: string;
  className?: string;
}

export default function SectionHeader({
  icon: Icon,
  title,
  accentClass,
  gradientClass,
  className = '',
}: SectionHeaderProps) {
  return (
    <Reveal
      className={`mb-10 text-center md:mb-12 ${className}`}
      y={30}
      duration={0.6}
    >
      <h2 className="mb-4 inline-flex items-center gap-3 text-3xl font-extrabold text-gray-900 dark:text-gray-100 md:text-4xl">
        <span aria-hidden="true" className="contents">
          <Icon size={28} className={`shrink-0 ${accentClass}`} />
        </span>
        {title}
      </h2>
      <div
        className={`mx-auto h-[3px] w-11 rounded-full bg-gradient-to-r ${gradientClass}`}
      />
    </Reveal>
  );
}
