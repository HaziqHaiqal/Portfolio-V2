import Reveal from '@components/Common/Reveal';
import type { ComponentType } from 'react';

// Loose enough to accept both lucide-react and react-icons components —
// SectionHeader only ever calls Icon with `size` and `className`.
type SectionIcon = ComponentType<{ size?: number; className?: string }>;

interface SectionHeaderProps {
  icon: SectionIcon;
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
    <Reveal
      className={`mb-10 text-center md:mb-12 ${className}`}
      y={30}
      duration={0.6}
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
    </Reveal>
  );
}
