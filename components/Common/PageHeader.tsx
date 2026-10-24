import type { ComponentType } from 'react';
import Reveal from '@components/Common/Reveal';
import { PAGE_ACCENTS, type PageAccent } from '@constants/colors';

export default function PageHeader({
  icon: Icon,
  title,
  subtitle,
  accent,
  className = '',
}: {
  icon: ComponentType<{ size?: number; className?: string }>;
  title: string;
  /** The page's nav colour. */
  accent: PageAccent;
  subtitle?: string;
  className?: string;
}) {
  return (
    <Reveal
      className={`mb-10 text-center md:mb-12 ${className}`}
      y={30}
      duration={0.6}
    >
      <h1 className="mb-4 inline-flex items-center gap-3 text-3xl font-extrabold text-gray-900 dark:text-gray-100 md:text-4xl">
        <span aria-hidden="true" className="contents">
          <Icon size={28} className={`shrink-0 ${PAGE_ACCENTS[accent].icon}`} />
        </span>
        {title}
      </h1>
      <div
        className={`mx-auto h-[3px] w-11 rounded-full bg-gradient-to-r ${PAGE_ACCENTS[accent].bar}`}
      />
      {subtitle && (
        <p className="mx-auto mt-6 max-w-xl text-gray-600 dark:text-gray-400">
          {subtitle}
        </p>
      )}
    </Reveal>
  );
}
