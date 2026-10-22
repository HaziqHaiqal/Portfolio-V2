'use client';

import { useEffect, type ReactNode } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Check, CirclePlay, X } from 'lucide-react';
import { SiGithub } from 'react-icons/si';
import ProjectImageGallery from '@components/Media/ProjectImageGallery';
import { getCategoryInfo } from '@constants/projects';
import { themeClasses } from '@constants/theme';
import { useUIStore } from '@lib/stores';
import type { ProjectProps } from 'types/portfolio';

const PRIMARY_LINK =
  'inline-flex min-h-10 items-center gap-1.5 rounded-full bg-gray-900 px-5 text-sm font-semibold text-white transition-colors hover:bg-purple-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple-500/30 dark:bg-white dark:text-gray-900 dark:hover:bg-purple-500 dark:hover:text-white';
const SECONDARY_LINK =
  'inline-flex min-h-10 items-center gap-1.5 rounded-full border border-gray-300 px-5 text-sm font-semibold text-gray-800 transition-colors hover:border-gray-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple-500/20 dark:border-gray-600 dark:text-gray-200 dark:hover:border-gray-500';

function teamLabel(teamSize?: string) {
  const size = teamSize?.trim();
  if (!size) return null;
  if (size === '1') return 'Solo project';
  return /^\d+$/.test(size) ? `Team of ${size}` : size;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-8 border-t border-gray-200 pt-8 dark:border-gray-700">
      <h3 className="mb-4 font-bold text-gray-900 dark:text-white">{title}</h3>
      {children}
    </section>
  );
}

export default function ProjectModal({
  isOpen,
  onClose,
  project,
}: {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectProps | null;
}) {
  const setChatVisible = useUIStore((state) => state.setChatVisible);

  useEffect(() => {
    if (!isOpen) return;
    setChatVisible(false);
    return () => setChatVisible(true);
  }, [isOpen, setChatVisible]);

  useEffect(() => {
    if (!isOpen) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!project) return null;

  const meta = [
    getCategoryInfo(project.category).label,
    project.year,
    teamLabel(project.teamSize),
    project.duration?.trim(),
  ].filter(Boolean);
  const links: { href: string; label: string; icon: ReactNode }[] = [
    ...(project.projectUrl
      ? [
          {
            href: project.projectUrl,
            label: 'Live site',
            icon: <ArrowUpRight size={15} aria-hidden="true" />,
          },
        ]
      : []),
    ...(project.demoUrl
      ? [
          {
            href: project.demoUrl,
            label: 'Demo',
            icon: <CirclePlay size={15} aria-hidden="true" />,
          },
        ]
      : []),
    ...(project.githubUrl
      ? [
          {
            href: project.githubUrl,
            label: 'Code',
            icon: <SiGithub size={14} aria-hidden="true" />,
          },
        ]
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
          <div
            className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <m.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-modal-title"
            className={`relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl border shadow-2xl md:mx-4 md:max-h-[88dvh] md:max-w-3xl md:rounded-3xl ${themeClasses.modal}`}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          >
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-gray-200 py-3 pl-6 pr-3 dark:border-gray-700 md:pl-8">
              <h2
                id="project-modal-title"
                className="truncate text-base font-bold text-gray-900 dark:text-white"
              >
                {project.title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                autoFocus
                aria-label="Close"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple-500/20 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain px-6 pb-10 pt-6 md:px-8 md:pt-8">
              <p className="font-mono text-xs text-gray-500 dark:text-gray-400">
                {meta.join(' · ')}
              </p>
              {project.description && (
                <p className="mt-3 text-lg leading-relaxed text-gray-700 dark:text-gray-300">
                  {project.description}
                </p>
              )}
              {links.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-3">
                  {links.map((link, index) => (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={index === 0 ? PRIMARY_LINK : SECONDARY_LINK}
                    >
                      {link.icon}
                      {link.label}
                    </a>
                  ))}
                </div>
              )}

              {project.longDescription && (
                <Section title="About">
                  <p className="leading-relaxed text-gray-600 dark:text-gray-400">
                    {project.longDescription}
                  </p>
                </Section>
              )}

              {project.features && project.features.length > 0 && (
                <Section title="Highlights">
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {project.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2.5 text-sm leading-relaxed text-gray-700 dark:text-gray-300"
                      >
                        <Check
                          size={16}
                          aria-hidden="true"
                          className="mt-0.5 shrink-0 text-purple-600 dark:text-purple-400"
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {project.languages.length > 0 && (
                <Section title="Built with">
                  <ul className="flex flex-wrap gap-2">
                    {project.languages.map((tech) => (
                      <li
                        key={tech}
                        className="rounded-full border border-gray-200 px-3 py-1 font-mono text-xs text-gray-700 dark:border-gray-700 dark:text-gray-300"
                      >
                        {tech}
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {project.id && (
                <ProjectImageGallery
                  projectId={project.id}
                  className="mt-8 border-t border-gray-200 pt-8 dark:border-gray-700"
                />
              )}
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
