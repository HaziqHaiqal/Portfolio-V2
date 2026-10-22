'use client';

import { useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import {
  m,
  useReducedMotion,
  useScroll,
  useTransform,
  AnimatePresence,
} from 'framer-motion';
import * as SelectPrimitive from '@radix-ui/react-select';
import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  CirclePlay,
  Folder,
} from 'lucide-react';
import { SiGithub } from 'react-icons/si';
import { PROJECT_CATEGORIES, getCategoryInfo } from '@constants/projects';
import { useUIStore } from '@lib/stores';
import type { ProjectProps } from 'types/portfolio';

const LINK =
  'inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 underline-offset-4 transition-colors hover:text-gray-900 hover:underline dark:text-gray-400 dark:hover:text-white';

function CaseStudy({
  project,
  index,
  flip,
}: {
  project: ProjectProps;
  index: number;
  flip: boolean;
}) {
  const openProjectModal = useUIStore((state) => state.openProjectModal);
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const imageY = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? [0, 0] : [28, -28]
  );
  const info = getCategoryInfo(project.category);
  const tech = project.languages.slice(0, 4);

  return (
    <article
      ref={ref}
      className="grid items-center gap-8 border-t border-gray-200 pt-8 dark:border-gray-700 md:grid-cols-12 md:gap-12 md:pt-12"
    >
      <m.button
        type="button"
        onClick={() => openProjectModal(project)}
        aria-label={`Open ${project.title} details`}
        initial={{ opacity: 0, x: reduceMotion ? 0 : flip ? 40 : -40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{ y: imageY }}
        className={`group relative block aspect-[16/10] overflow-hidden rounded-2xl bg-gray-100 shadow-2xl ring-1 ring-gray-900/5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple-500/40 dark:bg-gray-800 dark:ring-white/10 md:col-span-7 ${
          flip ? 'md:order-2' : ''
        }`}
      >
        <span className="absolute inset-0 block">
          {project.thumbnail_url ? (
            <Image
              src={project.thumbnail_url}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 58vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />
          ) : (
            <span className="flex h-full items-center justify-center bg-gradient-to-br from-blue-500/20 to-purple-600/20 font-mono text-gray-600 dark:text-gray-300">
              {project.title}
            </span>
          )}
        </span>
      </m.button>

      <m.div
        initial={{ opacity: 0, y: reduceMotion ? 0 : 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className={`md:col-span-5 ${flip ? 'md:order-1' : ''}`}
      >
        <p className="flex items-center gap-3 font-mono text-xs text-gray-500 dark:text-gray-400">
          <span className="text-purple-600 dark:text-purple-400">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span
            aria-hidden="true"
            className="h-px w-8 bg-gray-300 dark:bg-gray-600"
          />
          {info.label}
          {project.year && ` · ${project.year}`}
        </p>
        <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white md:text-4xl">
          {project.title}
        </h2>
        {project.description && (
          <p className="mt-4 leading-relaxed text-gray-600 dark:text-gray-400">
            {project.description}
          </p>
        )}
        {tech.length > 0 && (
          <p className="mt-5 font-mono text-xs text-gray-500 dark:text-gray-400">
            {tech.join(' · ')}
          </p>
        )}

        <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
          <button
            type="button"
            onClick={() => openProjectModal(project)}
            className="group/details inline-flex min-h-10 items-center gap-1.5 rounded-full bg-gray-900 px-5 text-sm font-semibold text-white transition-colors hover:bg-purple-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple-500/30 dark:bg-white dark:text-gray-900 dark:hover:bg-purple-500 dark:hover:text-white"
          >
            View details
            <ArrowRight
              size={15}
              aria-hidden="true"
              className="transition-transform group-hover/details:translate-x-0.5"
            />
          </button>
          {project.projectUrl && (
            <a
              href={project.projectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={LINK}
            >
              Live site
              <ArrowUpRight size={15} aria-hidden="true" />
            </a>
          )}
          {project.demoUrl && (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={LINK}
            >
              <CirclePlay size={15} aria-hidden="true" />
              Demo
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={LINK}
            >
              <SiGithub size={14} aria-hidden="true" />
              Code
            </a>
          )}
        </div>
      </m.div>
    </article>
  );
}

export default function ProjectCaseStudies({
  projects,
}: {
  projects: ProjectProps[];
}) {
  const [category, setCategory] = useState('all');

  const filters = useMemo(() => {
    const countOf = (value: string) =>
      projects.filter((p) => getCategoryInfo(p.category).value === value)
        .length;
    return [
      { value: 'all', label: 'All', icon: Folder, count: projects.length },
      ...PROJECT_CATEGORIES.map((c) => ({
        value: c.value,
        label: c.label,
        icon: c.icon,
        count: countOf(c.value),
      })).filter((c) => c.count > 0),
    ];
  }, [projects]);

  const shown =
    category === 'all'
      ? projects
      : projects.filter((p) => getCategoryInfo(p.category).value === category);
  const currentFilter = filters.find((f) => f.value === category) ?? filters[0];
  const CurrentIcon = currentFilter.icon;

  if (projects.length === 0) {
    return (
      <p className="py-20 text-center text-gray-600 dark:text-gray-400">
        New projects are on the way.
      </p>
    );
  }

  return (
    <div>
      {filters.length > 2 && (
        <div className="mb-12 flex justify-center sm:hidden">
          <SelectPrimitive.Root value={category} onValueChange={setCategory}>
            <div className="rounded-full bg-gradient-to-r from-blue-500 to-purple-600 p-[1.5px] shadow-lg shadow-purple-500/25">
              <SelectPrimitive.Trigger
                aria-label={`Filter projects by category: ${currentFilter.label}`}
                className="group flex h-12 w-60 items-center gap-2.5 rounded-full bg-white pl-1.5 pr-2 text-sm font-semibold text-gray-900 outline-none focus-visible:ring-4 focus-visible:ring-purple-500/25 dark:bg-gray-900 dark:text-white"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  <CurrentIcon size={16} aria-hidden />
                </span>
                <SelectPrimitive.Value>
                  {currentFilter.label}
                </SelectPrimitive.Value>
                <span className="font-mono text-xs font-normal text-gray-500 dark:text-gray-400">
                  {currentFilter.count}
                </span>
                <SelectPrimitive.Icon className="ml-auto grid h-8 w-8 place-items-center rounded-full bg-black/5 text-gray-600 dark:bg-white/[0.06] dark:text-gray-300">
                  <ChevronDown
                    size={15}
                    aria-hidden
                    className="transition-transform duration-200 group-data-[state=open]:rotate-180"
                  />
                </SelectPrimitive.Icon>
              </SelectPrimitive.Trigger>
            </div>
            <SelectPrimitive.Portal>
              <SelectPrimitive.Content
                position="popper"
                align="center"
                sideOffset={8}
                className="z-50 max-h-[min(22rem,var(--radix-select-content-available-height))] w-[calc(var(--radix-select-trigger-width)+3px)] overflow-hidden rounded-3xl border border-black/5 bg-white/85 shadow-2xl shadow-black/20 backdrop-blur-xl data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 dark:border-white/10 dark:bg-gray-900/80 dark:shadow-black/60"
              >
                <SelectPrimitive.Viewport className="p-1.5">
                  {filters.map(({ value, label, icon: Icon, count }) => (
                    <SelectPrimitive.Item
                      key={value}
                      value={value}
                      className="group flex min-h-12 cursor-pointer select-none items-center gap-2.5 rounded-[1.125rem] py-1.5 pl-1.5 pr-2.5 text-sm font-medium text-gray-700 outline-none data-[highlighted]:bg-gray-50 data-[state=checked]:bg-gray-100 data-[state=checked]:text-gray-900 dark:text-gray-300 dark:data-[highlighted]:bg-white/5 dark:data-[state=checked]:bg-white/[0.07] dark:data-[state=checked]:text-white"
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gray-100 text-gray-500 group-data-[state=checked]:bg-gradient-to-br group-data-[state=checked]:from-blue-500 group-data-[state=checked]:to-purple-600 group-data-[state=checked]:text-white dark:bg-white/[0.06] dark:text-gray-400">
                        <Icon size={16} aria-hidden />
                      </span>
                      <SelectPrimitive.ItemText>
                        {label}
                      </SelectPrimitive.ItemText>
                      <span className="ml-auto min-w-[1.375rem] rounded-full bg-black/5 px-[7px] py-0.5 text-center font-mono text-[11px] text-gray-500 dark:bg-white/[0.06] dark:text-gray-400">
                        {count}
                      </span>
                    </SelectPrimitive.Item>
                  ))}
                </SelectPrimitive.Viewport>
              </SelectPrimitive.Content>
            </SelectPrimitive.Portal>
          </SelectPrimitive.Root>
        </div>
      )}

      {filters.length > 2 && (
        <div
          role="group"
          aria-label="Filter projects by category"
          className="mb-12 hidden flex-wrap justify-center gap-3 sm:flex md:mb-16"
        >
          {filters.map(({ value, label, icon: Icon, count }) => {
            const on = value === category;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={on}
                onClick={() => setCategory(value)}
                className={`inline-flex h-11 items-center gap-2 rounded-full border px-5 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple-500/25 ${
                  on
                    ? 'border-transparent bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-purple-500/25'
                    : 'border-gray-300 bg-white/70 text-gray-700 backdrop-blur-sm hover:border-purple-400/60 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-900/60 dark:text-gray-300 dark:hover:border-purple-400/60 dark:hover:text-white'
                }`}
              >
                <Icon size={16} aria-hidden />
                {label}
                <span
                  className={`font-mono text-xs ${
                    on ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <AnimatePresence mode="wait">
        <m.div
          key={category}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-16 md:space-y-24"
        >
          {shown.map((project, index) => (
            <CaseStudy
              key={project.id}
              project={project}
              index={index}
              flip={index % 2 === 1}
            />
          ))}
        </m.div>
      </AnimatePresence>
    </div>
  );
}
