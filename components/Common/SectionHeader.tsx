'use client';

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { useTheme } from '@components/Provider/ThemeProvider';

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
  const { isDarkMode } = useTheme();

  return (
    <motion.div
      className={`mb-10 text-center md:mb-12 ${className}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      <div className="mb-3 inline-flex items-center gap-2 font-mono text-sm">
        <Icon size={16} className={accentClass} />
        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
          {label}
        </span>
      </div>
      <h2
        className={`mb-4 text-3xl font-extrabold md:text-4xl ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}
      >
        {title}
      </h2>
      <div
        className={`mx-auto h-[3px] w-11 rounded-full bg-gradient-to-r ${gradientClass}`}
      />
    </motion.div>
  );
}
