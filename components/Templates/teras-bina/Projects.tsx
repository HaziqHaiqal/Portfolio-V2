'use client';

import { useEffect, useRef, useState } from 'react';
import Photo from '@components/Templates/Photo';
import Link from 'next/link';
import { ArrowUpRight, MapPin, X } from 'lucide-react';
import {
  BASE_PATH,
  PROJECTS,
  SECTORS,
  type Project,
  type Sector,
} from './data';

function StatusChip({ status }: { status: Project['status'] }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        status === 'In progress'
          ? 'bg-tpl-accent text-tpl-on-accent'
          : 'bg-tpl-bg/90 text-tpl-ink backdrop-blur'
      }`}
    >
      {status === 'In progress' && (
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
      )}
      {status}
    </span>
  );
}

export function ProjectCard({
  project,
  onOpen,
}: {
  project: Project;
  onOpen?: () => void;
}) {
  const body = (
    <>
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-tpl-tint">
        <Photo
          src={project.image}
          alt={project.name}
          fill
          sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
        <div className="absolute left-3 top-3 flex gap-2">
          <StatusChip status={project.status} />
        </div>
        <span className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-tpl-bg text-tpl-ink opacity-0 transition-opacity group-hover:opacity-100">
          <ArrowUpRight size={18} aria-hidden="true" />
        </span>
      </div>
      <div className="mt-4 flex items-start justify-between gap-4 text-left">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">
            {project.name}
          </h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-tpl-muted">
            <MapPin size={14} aria-hidden="true" />
            {project.location}
          </p>
        </div>
        <p className="shrink-0 rounded-full bg-tpl-tint px-3 py-1 text-xs font-medium">
          {project.sector}
        </p>
      </div>
      <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-tpl-line pt-4 text-left text-sm">
        {[
          ['Value', project.value],
          ['Duration', project.duration],
          ['Year', project.year],
        ].map(([term, value]) => (
          <div key={term}>
            <dt className="text-xs text-tpl-muted">{term}</dt>
            <dd className="mt-0.5 font-medium">{value}</dd>
          </div>
        ))}
      </dl>
    </>
  );

  return onOpen ? (
    <button type="button" onClick={onOpen} className="group block w-full">
      {body}
    </button>
  ) : (
    <Link href={`${BASE_PATH}/projects`} className="group block">
      {body}
    </Link>
  );
}

function ProjectDialog({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    ref.current?.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(event) => event.target === ref.current && ref.current.close()}
      aria-labelledby="tb-project-title"
      data-lenis-prevent
      className="m-0 mt-auto max-h-[92dvh] w-full max-w-none animate-[tpl-rise_300ms_ease-out] overflow-y-auto rounded-t-[1.75rem] bg-tpl-bg p-0 text-tpl-ink backdrop:bg-black/60 backdrop:backdrop-blur-sm md:m-auto md:max-w-3xl md:rounded-[1.75rem]"
    >
      <div className="relative aspect-[16/9] bg-tpl-tint">
        <Photo
          src={project.image}
          alt={project.name}
          fill
          sizes="(min-width: 768px) 768px, 100vw"
          className="object-cover"
        />
        <button
          type="button"
          onClick={() => ref.current?.close()}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-tpl-bg/90 backdrop-blur"
        >
          <X size={20} />
        </button>
      </div>
      <div className="p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <StatusChip status={project.status} />
          <span className="rounded-full bg-tpl-tint px-2.5 py-1 text-xs font-medium">
            {project.sector}
          </span>
        </div>
        <h2
          id="tb-project-title"
          className="mt-4 text-3xl font-semibold tracking-tight"
        >
          {project.name}
        </h2>
        <p className="mt-1 flex items-center gap-1.5 text-tpl-muted">
          <MapPin size={15} aria-hidden="true" />
          {project.location}
        </p>
        <p className="mt-5 leading-relaxed text-tpl-muted">{project.summary}</p>
        <dl className="mt-6 grid grid-cols-2 gap-4 rounded-2xl bg-tpl-tint p-5 text-sm sm:grid-cols-4">
          {[
            ['Client', project.client],
            ['Contract value', project.value],
            ['Duration', project.duration],
            [
              project.status === 'Completed' ? 'Completed' : 'Handover',
              project.year,
            ],
          ].map(([term, value]) => (
            <div key={term}>
              <dt className="text-xs text-tpl-muted">{term}</dt>
              <dd className="mt-1 font-medium">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </dialog>
  );
}

export default function ProjectGrid() {
  const [sector, setSector] = useState<Sector | null>(null);
  const [open, setOpen] = useState<Project | null>(null);
  const visible = sector
    ? PROJECTS.filter((project) => project.sector === sector)
    : PROJECTS;

  return (
    <>
      <div
        role="group"
        aria-label="Filter projects by sector"
        className="-mx-5 flex gap-2 overflow-x-auto px-5 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0"
      >
        {[null, ...SECTORS].map((item) => (
          <button
            key={item ?? 'all'}
            type="button"
            aria-pressed={sector === item}
            onClick={() => setSector(item)}
            className={`h-10 shrink-0 rounded-full px-4 text-sm font-medium transition-colors ${
              sector === item
                ? 'bg-tpl-ink text-tpl-bg'
                : 'bg-tpl-tint hover:bg-tpl-line'
            }`}
          >
            {item ?? 'All sectors'}
          </button>
        ))}
      </div>
      <div className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onOpen={() => setOpen(project)}
          />
        ))}
      </div>
      {open && (
        <ProjectDialog
          key={open.id}
          project={open}
          onClose={() => setOpen(null)}
        />
      )}
    </>
  );
}
