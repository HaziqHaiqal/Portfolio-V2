'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Briefcase } from 'lucide-react';
import { Experience } from '@lib/supabase';
import UniversalImage from '@components/Media/UniversalImage';
import SectionHeader from '@components/Common/SectionHeader';
import { generateHash } from '@lib/utils';

interface ExperienceSectionProps {
  experience: Experience[] | null | undefined;
}

// How far down the screen the line's tip sits. Whatever is above it is open.
const TIP = 0.6;

// Phones: logo column, then content. From md: the line runs down the centre and companies alternate sides.
const COLUMNS =
  'grid grid-cols-[3rem_minmax(0,1fr)] gap-x-4 sm:grid-cols-[3.5rem_minmax(0,1fr)] sm:gap-x-6 md:grid-cols-[minmax(0,1fr)_3.5rem_minmax(0,1fr)] md:gap-x-8';

const monthYear = (date: Date) =>
  date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

const toBulletPoints = (text?: string) => {
  if (!text) return [];
  const normalized = text.replace(/\r\n/g, '\n').trim();
  if (!normalized) return [];

  const parts = normalized.includes('•')
    ? normalized.split('•')
    : normalized.includes('\n')
      ? normalized.split('\n')
      : normalized.includes(';')
        ? normalized.split(';')
        : [normalized];

  return parts
    .map((part) => part.trim().replace(/^[-*]\s+/, ''))
    .filter(Boolean);
};

const ExperienceSection = ({ experience }: ExperienceSectionProps) => {
  const listRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLSpanElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  // How many logos and role dots the line has reached, top to bottom.
  const [passed, setPassed] = useState(0);

  useEffect(() => {
    const list = listRef.current;
    const track = trackRef.current;
    const fill = fillRef.current;
    if (!list || !track || !fill) return;

    let frame = 0;
    const centre = (element: Element) => {
      const rect = element.getBoundingClientRect();
      return rect.top + rect.height / 2;
    };
    const update = () => {
      frame = 0;
      const markers = Array.from(list.querySelectorAll('[data-marker]'));
      if (markers.length === 0) return;
      const tip = window.innerHeight * TIP;
      const box = list.getBoundingClientRect();
      const first = markers[0].getBoundingClientRect();
      const start = first.top + first.height / 2;
      const end = box.bottom;
      track.style.left =
        fill.style.left = `${first.left + first.width / 2 - box.left}px`;
      track.style.top = fill.style.top = `${start - box.top}px`;
      fill.style.height = `${Math.min(Math.max(tip - start, 0), end - start)}px`;
      setPassed(markers.filter((marker) => centre(marker) <= tip).length);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    // Taller panels take longer, so every company unfolds at a similar speed.
    const pace = () => {
      list.querySelectorAll<HTMLElement>('[data-panel]').forEach((panel) => {
        const height = panel.querySelector('ol')?.offsetHeight ?? 0;
        panel.style.transitionDuration = `${Math.round(
          Math.min(1400, 250 + height)
        )}ms`;
      });
    };
    const onResize = () => {
      pace();
      schedule();
    };

    pace();
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', onResize);
    const observer = new ResizeObserver(schedule);
    observer.observe(list);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', onResize);
      observer.disconnect();
    };
  }, []);

  if (!experience || experience.length === 0) return null;

  const groupedExperience = experience.reduce(
    (acc, exp) => {
      const companyName = exp.companies?.name || 'Unknown Company';
      if (!acc[companyName]) {
        acc[companyName] = {
          logo: exp.companies?.logo_url,
          roles: [],
        };
      }
      if (!acc[companyName].logo && exp.companies?.logo_url) {
        acc[companyName].logo = exp.companies.logo_url;
      }
      acc[companyName].roles.push(exp);
      return acc;
    },
    {} as Record<string, { logo?: string; roles: Experience[] }>
  );

  const sortedCompanies = Object.entries(groupedExperience).sort((a, b) => {
    const latestA = Math.max(
      ...a[1].roles.map((r) => new Date(r.start_date).getTime())
    );
    const latestB = Math.max(
      ...b[1].roles.map((r) => new Date(r.start_date).getTime())
    );
    return latestB - latestA;
  });

  // Each company's logo is a marker, followed by one per role.
  const markers = sortedCompanies.map(
    (_, index) =>
      index +
      sortedCompanies
        .slice(0, index)
        .reduce((count, [, data]) => count + data.roles.length, 0)
  );
  const companies = sortedCompanies.map(([name, data], index) => {
    const roles = [...data.roles].sort(
      (a, b) =>
        new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
    );
    const current = roles.some((role) => role.is_current);
    const first = new Date(
      Math.min(...roles.map((role) => new Date(role.start_date).getTime()))
    );
    const last = new Date(
      Math.max(
        ...roles.map((role) =>
          new Date(role.end_date || role.start_date).getTime()
        )
      )
    );
    return {
      name,
      logo: data.logo,
      roles,
      marker: markers[index],
      period: `${monthYear(first)} - ${current ? 'Present' : monthYear(last)}`,
    };
  });

  return (
    <section id="experience" className="relative overflow-hidden px-6 py-32">
      <div className="relative z-10 mx-auto max-w-7xl">
        <SectionHeader
          icon={Briefcase}
          title="Experience"
          accentClass="text-rose-500"
          gradientClass="from-rose-600 to-rose-400"
        />

        <div ref={listRef} className="relative mx-auto max-w-3xl md:max-w-5xl">
          <span
            ref={trackRef}
            aria-hidden="true"
            className="absolute bottom-0 left-6 top-6 w-0.5 -translate-x-1/2 rounded-full bg-gray-200 dark:bg-gray-700 sm:left-7 sm:top-7 md:left-1/2"
          />
          <span
            ref={fillRef}
            aria-hidden="true"
            className="absolute left-6 top-6 h-0 w-0.5 -translate-x-1/2 rounded-full bg-blue-500 sm:left-7 sm:top-7 md:left-1/2"
          />

          <ol className="relative">
            {companies.map((company, companyIndex) => {
              const open = passed > company.marker;
              const isLast = companyIndex === companies.length - 1;
              const left = companyIndex % 2 === 1;
              const side = left ? 'md:col-start-1' : 'md:col-start-3';
              const align = left ? 'md:text-right' : '';

              return (
                <li
                  key={company.name}
                  className={isLast ? '' : 'pb-10 sm:pb-12'}
                >
                  <div className={COLUMNS}>
                    <span
                      data-marker
                      className={`relative z-10 col-start-1 row-span-2 row-start-1 flex h-12 w-12 items-center justify-center self-center justify-self-center overflow-hidden rounded-full bg-white ring-4 transition-shadow duration-300 dark:bg-gray-700 sm:h-14 sm:w-14 md:col-start-2 ${
                        open
                          ? 'ring-blue-500'
                          : 'ring-[color:var(--company-ring)]'
                      }`}
                    >
                      {company.logo ? (
                        <UniversalImage
                          src={company.logo}
                          alt={`${company.name} logo`}
                          width={56}
                          height={56}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Briefcase
                          size={22}
                          aria-hidden="true"
                          className="text-gray-600 dark:text-gray-300"
                        />
                      )}
                    </span>
                    <h3
                      className={`col-start-2 row-start-1 self-end text-lg font-bold leading-tight text-gray-900 dark:text-gray-100 sm:text-xl ${side} ${align}`}
                    >
                      {company.name}
                    </h3>
                    <p
                      className={`col-start-2 row-start-2 mt-1 text-sm text-gray-500 dark:text-gray-400 ${side} ${align}`}
                    >
                      {company.period}
                    </p>
                  </div>

                  <div
                    data-panel
                    className={`grid transition-[grid-template-rows,opacity] ease-in-out motion-reduce:transition-none ${
                      open
                        ? 'grid-rows-[1fr] opacity-100'
                        : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <ol className="space-y-8 pt-6">
                        {company.roles.map((role, roleIndex) => {
                          const lit = passed > company.marker + 1 + roleIndex;
                          const roleHash = generateHash(
                            role.position +
                              (role.companies?.name || '') +
                              role.start_date
                          );
                          const points =
                            role.responsibilities &&
                            role.responsibilities.length > 0
                              ? role.responsibilities
                              : toBulletPoints(role.description);

                          return (
                            <li key={roleHash} className={`${COLUMNS} gap-y-2`}>
                              <span
                                data-marker
                                aria-hidden="true"
                                className={`col-start-1 row-span-3 row-start-1 mt-1 h-3 w-3 self-start justify-self-center rounded-full transition-colors duration-300 md:col-start-2 ${
                                  lit
                                    ? 'bg-blue-500'
                                    : 'bg-gray-300 dark:bg-gray-600'
                                }`}
                              />
                              <div
                                className={`col-start-2 row-start-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs ${side} ${
                                  left ? 'md:justify-end' : ''
                                }`}
                              >
                                <span className="rounded bg-blue-100 px-1.5 py-0.5 font-mono text-blue-700 dark:bg-blue-800 dark:text-blue-300">
                                  {roleHash}
                                </span>
                                <span className="text-gray-500 dark:text-gray-400">
                                  {monthYear(new Date(role.start_date))} -{' '}
                                  {role.is_current
                                    ? 'Present'
                                    : monthYear(new Date(role.end_date!))}
                                </span>
                                {role.is_current && (
                                  <span
                                    className="pulse-dot h-2 w-2 shrink-0 rounded-full bg-green-500"
                                    style={
                                      {
                                        '--pulse-peak': '1.3',
                                      } as React.CSSProperties
                                    }
                                  />
                                )}
                              </div>

                              <h4
                                className={`col-start-2 row-start-2 text-base font-semibold text-gray-900 dark:text-gray-100 ${side} ${align}`}
                              >
                                {role.position}
                              </h4>

                              <div
                                className={`col-start-2 row-start-3 min-w-0 ${side}`}
                              >
                                {points.length > 0 && (
                                  <ul className="mt-1 list-disc space-y-2 pl-5 text-sm leading-relaxed text-gray-600 marker:text-blue-500 dark:text-gray-300">
                                    {points.map((point, index) => (
                                      <li key={index}>{point}</li>
                                    ))}
                                  </ul>
                                )}

                                {role.technologies &&
                                  role.technologies.length > 0 && (
                                    <ul
                                      className={`mt-4 flex flex-wrap gap-2 ${
                                        left ? 'md:justify-end' : ''
                                      }`}
                                    >
                                      {role.technologies.map(
                                        (tech: string, index: number) => (
                                          <li
                                            key={index}
                                            className="rounded-full border border-gray-300 bg-gray-100 px-2 py-1 text-xs text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
                                          >
                                            {tech}
                                          </li>
                                        )
                                      )}
                                    </ul>
                                  )}
                              </div>
                            </li>
                          );
                        })}
                      </ol>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
};

export default ExperienceSection;
