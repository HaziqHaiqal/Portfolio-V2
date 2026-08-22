'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { m, AnimatePresence } from 'framer-motion';
import {
  X,
  Globe,
  Github,
  Clock,
  Calendar,
  Users,
  GitCommit,
} from 'lucide-react';
import ProjectImageGallery from '@components/Media/ProjectImageGallery';
import { getCategoryInfo } from '@constants/projects';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: {
    id?: string;
    title: string;
    description: string;
    longDescription?: string;
    tech: string;
    year: string;
    status: string;
    gradient: string;
    commits: string;
    languages: string[];
    category: string;
    projectUrl?: string;
    githubUrl?: string;
    features?: string[];
    teamSize?: string;
    duration?: string;
    thumbnail_url?: string;
  } | null;
}

interface ThemeTokens {
  panelBg: string;
  panelText: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textFaint: string;
  divider: string;
  cardBg: string;
  cardBorder: string;
  chipBg: string;
  chipBorder: string;
  chipText: string;
  chipHoverBg: string;
  glassBg: string;
  glassBorder: string;
  glassText: string;
  primaryBtnBg: string;
  primaryBtnText: string;
  primaryBtnDisabled: string;
  secondaryBtnBg: string;
  secondaryBtnHoverBg: string;
  secondaryBtnBorder: string;
  secondaryBtnText: string;
  secondaryBtnDisabled: string;
  backdropClass: string;
  // Header gradient stops
  headerStop1: string;
  headerStop2: string;
  headerStop3: string;
  shadowOnImage: string;
}

export default function ProjectModal({
  isOpen,
  onClose,
  project,
}: ProjectModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!project) return null;

  const categoryInfo = getCategoryInfo(project.category);
  const CategoryIcon = categoryInfo.icon;

  const TINT_CATEGORIES = new Set([
    'web',
    'mobile',
    'art',
    'game',
    'api',
    'ai',
    'tool',
    'other',
  ]);
  const tintKey = TINT_CATEGORIES.has(categoryInfo.value)
    ? categoryInfo.value
    : 'other';
  const tint = `var(--tint-${tintKey})`;

  const T: ThemeTokens = {
    panelBg: 'bg-white dark:bg-gray-900',
    panelText: 'text-gray-900 dark:text-white',
    textPrimary: 'text-gray-900 dark:text-white',
    textSecondary: 'text-gray-700 dark:text-white/75',
    textMuted: 'text-gray-500 dark:text-white/55',
    textFaint: 'text-gray-400 dark:text-white/35',
    divider: 'border-gray-200 dark:border-white/[0.06]',
    cardBg: 'bg-gray-50 dark:bg-white/[0.04]',
    cardBorder: 'border-gray-200 dark:border-white/10',
    chipBg: 'bg-gray-100 dark:bg-white/[0.08]',
    chipBorder: 'border-gray-200 dark:border-white/10',
    chipText: 'text-gray-700 dark:text-white/90',
    chipHoverBg: 'hover:bg-gray-200 dark:hover:bg-white/[0.12]',
    glassBg: 'bg-white/80 dark:bg-white/10',
    glassBorder: 'border-gray-200 dark:border-white/10',
    glassText: 'text-gray-900 dark:text-white',
    primaryBtnBg:
      'bg-gray-900 text-white shadow-md hover:bg-gray-800 dark:bg-white dark:text-black dark:shadow-lg dark:hover:bg-white/90',
    primaryBtnText: 'text-white dark:text-black',
    primaryBtnDisabled:
      'cursor-not-allowed bg-gray-200 text-gray-400 shadow-none dark:bg-white/30 dark:text-black/40',
    secondaryBtnBg: 'bg-white dark:bg-white/[0.08]',
    secondaryBtnHoverBg: 'hover:bg-gray-50 dark:hover:bg-white/[0.15]',
    secondaryBtnBorder: 'border-gray-200 dark:border-white/10',
    secondaryBtnText: 'text-gray-900 dark:text-white',
    secondaryBtnDisabled:
      'cursor-not-allowed border-gray-100 bg-gray-50 text-gray-400 dark:border-white/5 dark:bg-white/[0.04] dark:text-white/30',
    backdropClass: 'bg-black/40 backdrop-blur-md dark:bg-black/80',
    headerStop1: tint,
    headerStop2: 'var(--modal-stop2)',
    headerStop3: 'var(--modal-stop3)',
    shadowOnImage:
      'shadow-[0_20px_60px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.55)]',
  };

  const meta = [
    { icon: Calendar, label: project.year },
    { icon: Users, label: project.teamSize || 'Solo' },
    { icon: Clock, label: project.duration || 'Ongoing' },
    ...(project.commits && project.commits !== '0'
      ? [{ icon: GitCommit, label: project.commits }]
      : []),
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <m.div
          className="fixed inset-0 z-50 flex items-end justify-center md:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <m.div
            className={`absolute inset-0 ${T.backdropClass}`}
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Panel */}
          <m.div
            className={`relative flex h-[94vh] w-full flex-col overflow-hidden rounded-t-2xl shadow-2xl md:mx-4 md:h-[88vh] md:max-w-4xl md:rounded-2xl ${T.panelBg}`}
            initial={{ y: '8%', opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: '8%', opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Gradient that bleeds from category color into the body */}
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-[55%]"
              style={{
                background: `linear-gradient(180deg, ${T.headerStop1} 0%, ${T.headerStop2} 55%, ${T.headerStop3} 100%)`,
              }}
            />

            {/* Top bar */}
            <div className="relative z-10 flex flex-shrink-0 items-center justify-between px-5 py-3">
              <div
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium backdrop-blur-md ${T.glassBg} ${T.glassBorder} ${T.glassText}`}
              >
                <CategoryIcon size={12} />
                {categoryInfo.label}
              </div>
              <m.button
                onClick={onClose}
                className={`rounded-full border p-2 backdrop-blur-md transition-colors ${T.glassBg} hover:${T.chipHoverBg} ${T.glassBorder} ${T.glassText}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Close"
              >
                <X size={16} />
              </m.button>
            </div>

            {/* Scrollable */}
            <div className="relative z-10 flex-1 overflow-y-auto overscroll-contain">
              {/* Header: cover + title */}
              <div className="flex flex-col items-end gap-6 px-6 py-7 md:flex-row md:gap-8 md:px-8">
                <m.div
                  className={`relative aspect-[16/10] w-full flex-shrink-0 overflow-hidden rounded-xl sm:w-80 md:w-80 ${T.shadowOnImage} bg-gray-100 dark:bg-gray-950/50`}
                  initial={{ y: 20, opacity: 0, scale: 0.96 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  {project.thumbnail_url && (
                    <Image
                      src={project.thumbnail_url}
                      alt=""
                      fill
                      sizes="320px"
                      className={`scale-110 object-cover opacity-40 blur-2xl dark:opacity-60`}
                      aria-hidden
                    />
                  )}
                  {project.thumbnail_url ? (
                    <Image
                      src={project.thumbnail_url}
                      alt={project.title}
                      fill
                      sizes="320px"
                      className="object-contain"
                      priority
                    />
                  ) : (
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${project.gradient}`}
                    />
                  )}
                </m.div>

                {/* Info */}
                <m.div
                  className={`min-w-0 flex-1 ${T.textPrimary}`}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.15 }}
                >
                  <h1 className="mb-3 break-words text-4xl font-bold leading-[0.95] tracking-tight sm:text-5xl md:mb-4 md:text-6xl">
                    {project.title}
                  </h1>
                  <p
                    className={`mb-4 max-w-2xl text-sm leading-relaxed md:text-base ${T.textSecondary}`}
                  >
                    {project.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm">
                    {meta.map((m, i) => {
                      const MIcon = m.icon;
                      return (
                        <React.Fragment key={i}>
                          {i > 0 && (
                            <span className={`select-none ${T.textFaint}`}>
                              ·
                            </span>
                          )}
                          <span
                            className={`inline-flex items-center gap-1.5 ${T.textMuted}`}
                          >
                            <MIcon size={12} className={T.textFaint} />
                            {m.label}
                          </span>
                        </React.Fragment>
                      );
                    })}
                  </div>
                </m.div>
              </div>

              {/* Action bar */}
              <m.div
                className="flex flex-wrap items-center gap-3 px-6 pb-6 md:px-8"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <ActionButton
                  href={project.projectUrl}
                  icon={<Globe size={15} />}
                  label="Live Site"
                  variant="primary"
                  T={T}
                />
                <ActionButton
                  href={project.githubUrl}
                  icon={<Github size={15} />}
                  label="Source"
                  variant="secondary"
                  T={T}
                />
              </m.div>

              {/* Gallery */}
              {project.id && (
                <Section T={T} first>
                  <SectionTitle T={T}>Gallery</SectionTitle>
                  <div
                    className={`rounded-xl border p-3 ${T.cardBg} ${T.cardBorder}`}
                  >
                    <ProjectImageGallery projectId={project.id} compact />
                  </div>
                </Section>
              )}

              {/* About */}
              {project.longDescription && (
                <Section T={T}>
                  <SectionTitle T={T}>About</SectionTitle>
                  <p
                    className={`max-w-3xl text-[15px] leading-relaxed ${T.textSecondary}`}
                  >
                    {project.longDescription}
                  </p>
                </Section>
              )}

              {/* Highlights — simple prose list */}
              {project.features && project.features.length > 0 && (
                <Section T={T}>
                  <SectionTitle T={T}>Highlights</SectionTitle>
                  <div>
                    {project.features.map((feature, i) => (
                      <m.div
                        key={i}
                        className={`border-b py-5 last:border-b-0 ${T.divider}`}
                        initial={{ opacity: 0, y: 6 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.04 * i }}
                      >
                        <p
                          className={`text-[15px] leading-relaxed ${T.textPrimary}`}
                        >
                          {feature}
                        </p>
                      </m.div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Built with */}
              {project.languages.length > 0 && (
                <Section T={T}>
                  <SectionTitle T={T}>Built with</SectionTitle>
                  <div className="flex flex-wrap gap-1.5">
                    {project.languages.map((tech, i) => (
                      <span
                        key={i}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${T.chipBg} ${T.chipBorder} ${T.chipText} ${T.chipHoverBg}`}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </Section>
              )}

              {/* Footer meta */}
              <div
                className={`mt-10 border-t px-6 pb-10 pt-6 text-xs md:px-8 ${T.divider} ${T.textFaint}`}
              >
                {project.year} · {categoryInfo.label} ·{' '}
                {project.duration || 'Ongoing'}
                {project.teamSize ? ` · ${project.teamSize}` : ''}
              </div>
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}

function Section({
  children,
  T,
  first,
}: {
  children: React.ReactNode;
  T: ThemeTokens;
  first?: boolean;
}) {
  return (
    <section
      className={`px-6 md:px-8 ${
        first ? 'mt-2' : `mt-8 border-t pt-8 ${T.divider}`
      }`}
    >
      {children}
    </section>
  );
}

function SectionTitle({
  children,
  T,
}: {
  children: React.ReactNode;
  T: ThemeTokens;
}) {
  return (
    <h2
      className={`mb-4 text-base font-semibold tracking-tight ${T.textPrimary}`}
    >
      {children}
    </h2>
  );
}

function ActionButton({
  href,
  icon,
  label,
  variant,
  T,
}: {
  href?: string;
  icon: React.ReactNode;
  label: string;
  variant: 'primary' | 'secondary';
  T: ThemeTokens;
}) {
  const enabled = Boolean(href);
  const baseClass =
    'flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-colors';
  const enabledClass =
    variant === 'primary'
      ? T.primaryBtnBg
      : `${T.secondaryBtnBg} ${T.secondaryBtnHoverBg} backdrop-blur-md border ${T.secondaryBtnBorder} ${T.secondaryBtnText}`;
  const disabledClass =
    variant === 'primary' ? T.primaryBtnDisabled : T.secondaryBtnDisabled;

  if (!enabled) {
    return (
      <button
        disabled
        className={`${baseClass} ${disabledClass}`}
        aria-label={`${label} (unavailable)`}
        title="Not available"
      >
        {icon}
        {label}
      </button>
    );
  }
  return (
    <m.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${baseClass} ${enabledClass}`}
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
    >
      {icon}
      {label}
    </m.a>
  );
}
