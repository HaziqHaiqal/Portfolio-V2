"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { useTheme } from "@components/providers/ThemeProvider";

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
  className = "",
}: SectionHeaderProps) {
  const { isDarkMode } = useTheme();

  return (
    <motion.div
      className={`text-center mb-10 md:mb-12 ${className}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      <div className="inline-flex items-center gap-2 font-mono text-sm mb-3">
        <Icon size={16} className={accentClass} />
        <span className={isDarkMode ? "text-gray-400" : "text-gray-500"}>
          {label}
        </span>
      </div>
      <h2
        className={`text-3xl md:text-4xl font-extrabold mb-4 ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}
      >
        {title}
      </h2>
      <div
        className={`w-11 h-[3px] mx-auto rounded-full bg-gradient-to-r ${gradientClass}`}
      />
    </motion.div>
  );
}
