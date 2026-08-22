'use client';

import React, { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Briefcase, ChevronDown } from 'lucide-react';
import { Experience } from '@lib/supabase';
import UniversalImage from '@components/Media/UniversalImage';
import SectionHeader from '@components/Common/SectionHeader';
import { generateHash } from '@lib/utils';

interface ExperienceSectionProps {
  experience: Experience[] | null | undefined;
}

const ExperienceSection = ({ experience }: ExperienceSectionProps) => {
  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(
    new Set()
  );

  if (!experience || experience.length === 0) return null;

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

  const toggleCompany = (company: string) => {
    const newExpanded = new Set(expandedCompanies);
    if (newExpanded.has(company)) {
      newExpanded.delete(company);
    } else {
      newExpanded.add(company);
    }
    setExpandedCompanies(newExpanded);
  };

  const groupedExperience = experience.reduce(
    (acc, exp) => {
      const companyName = exp.companies?.name || 'Unknown Company';
      if (!acc[companyName]) {
        acc[companyName] = {
          logo: exp.companies?.logo_url,
          roles: [],
        };
      }
      // Update logo if this experience has one and previous didn't
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

  return (
    <section id="experience" className="relative overflow-hidden px-6 py-32">
      <div className="relative z-10 mx-auto max-w-7xl">
        <SectionHeader
          icon={Briefcase}
          label="experience.timeline()"
          title="Experience"
          accentClass="text-rose-500"
          gradientClass="from-rose-600 to-rose-400"
        />

        {/* Git-style Timeline */}
        <div className="mx-auto max-w-4xl">
          <m.div
            className={`rounded-3xl border border-gray-200 bg-white/70 p-8 shadow-2xl dark:border-gray-700 dark:bg-gray-800/70`}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {/* Git Timeline */}
            <div className="relative">
              <div className="flex flex-col">
                {sortedCompanies.map(([company, data], companyIndex) => {
                  const companyRoles = data.roles.sort(
                    (a, b) =>
                      new Date(b.start_date).getTime() -
                      new Date(a.start_date).getTime()
                  );
                  const isExpanded = expandedCompanies.has(company);
                  const isLast = companyIndex === sortedCompanies.length - 1;

                  return (
                    <div
                      key={company}
                      className={`relative ${isLast ? '' : 'pb-8'}`}
                    >
                      {/* Gray Background Line - Per Item */}
                      <div
                        className={`absolute left-6 top-0 w-0.5 bg-gray-300 dark:bg-gray-600`}
                        style={{
                          height: isLast && !isExpanded ? '24px' : '100%',
                        }}
                      />

                      {/* Animated blue line overlay */}
                      <m.div
                        className="absolute left-6 top-0 z-[1] w-0.5 origin-top bg-blue-500"
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: isExpanded ? 1 : 0 }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                        style={{
                          height: isLast && !isExpanded ? '24px' : '100%',
                          transformOrigin: 'top',
                        }}
                      />

                      {/* Company Branch Point */}
                      <m.div
                        className="flex items-start gap-4"
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.6,
                          delay: companyIndex * 0.1,
                        }}
                        viewport={{ once: true }}
                      >
                        {/* Company node on main timeline */}
                        <div className="relative z-10 flex flex-col items-center">
                          {/* Logo Container */}
                          <div
                            className="relative cursor-pointer"
                            onClick={() => toggleCompany(company)}
                          >
                            {/* Logo with animated border */}
                            <m.div
                              className={`relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-blue-500/40 bg-white shadow-lg shadow-blue-900/30 dark:border-blue-500/40 dark:bg-gray-700 dark:shadow-blue-900/30`}
                              style={{
                                boxShadow: isExpanded
                                  ? '0 0 0 4px #3b82f6'
                                  : '0 0 0 4px var(--company-ring)',
                              }}
                              animate={{
                                boxShadow: isExpanded
                                  ? '0 0 0 4px #3b82f6'
                                  : '0 0 0 4px var(--company-ring)',
                              }}
                              transition={{
                                duration: 0.3,
                                delay: isExpanded ? 0.2 : 0,
                              }}
                            >
                              {data.logo ? (
                                <UniversalImage
                                  src={data.logo}
                                  alt={`${company} logo`}
                                  width={56}
                                  height={56}
                                  className="h-14 w-14 rounded-full object-cover"
                                />
                              ) : (
                                <Briefcase
                                  size={24}
                                  className="text-gray-600 dark:text-gray-300"
                                />
                              )}
                            </m.div>
                          </div>
                        </div>

                        {/* Company Info */}
                        <div className="flex-1 pt-2">
                          <button
                            onClick={() => toggleCompany(company)}
                            className="group w-full text-left"
                          >
                            <div className="flex items-center gap-3">
                              <h4
                                className={`text-lg font-bold text-gray-900 transition-colors group-hover:text-blue-500 dark:text-gray-100`}
                              >
                                {company}
                              </h4>
                              <m.div
                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                <ChevronDown
                                  size={16}
                                  className="text-gray-600 dark:text-gray-400"
                                />
                              </m.div>
                            </div>
                          </button>

                          {/* Expandable Roles Section */}
                          <AnimatePresence>
                            {isExpanded && (
                              <m.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="relative mt-10"
                              >
                                <div className="space-y-8">
                                  {companyRoles.map((role, roleIndex) => {
                                    const startDate = new Date(role.start_date);
                                    const endDate = role.is_current
                                      ? new Date()
                                      : new Date(role.end_date!);
                                    const roleHash = generateHash(
                                      role.position +
                                        (role.companies?.name || '') +
                                        role.start_date
                                    );
                                    // First job at company (oldest) = feat:, subsequent (newer) = update:
                                    const isFirstJob =
                                      roleIndex === companyRoles.length - 1;

                                    return (
                                      <m.div
                                        key={`${company}-${roleIndex}`}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{
                                          duration: 0.4,
                                          delay: roleIndex * 0.1,
                                        }}
                                        className="relative flex items-start gap-3"
                                      >
                                        {/* Role commit dot - outline only, centered on timeline */}
                                        <div
                                          className={`absolute -left-[53px] top-[6px] z-10 h-3 w-3 rounded-full border-2 border-blue-500 bg-white dark:bg-gray-800`}
                                        />

                                        {/* Role content - closer to dot */}
                                        <div className="min-w-0 flex-1">
                                          {/* Commit Hash & Date */}
                                          <div className="mb-3 flex flex-wrap items-center gap-2 sm:gap-3">
                                            <span
                                              className={`whitespace-nowrap rounded bg-blue-100 px-1.5 py-0.5 font-mono text-[12px] text-blue-700 dark:bg-blue-800 dark:text-blue-300 sm:px-2 sm:py-1 sm:text-xs`}
                                            >
                                              {roleHash}
                                            </span>
                                            <span
                                              className={`whitespace-nowrap text-[12px] text-gray-500 dark:text-gray-400 sm:text-xs`}
                                            >
                                              {startDate.toLocaleDateString(
                                                'en-US',
                                                {
                                                  month: 'short',
                                                  year: 'numeric',
                                                }
                                              )}{' '}
                                              -{' '}
                                              {role.is_current
                                                ? 'Present'
                                                : endDate.toLocaleDateString(
                                                    'en-US',
                                                    {
                                                      month: 'short',
                                                      year: 'numeric',
                                                    }
                                                  )}
                                            </span>
                                            {role.is_current && (
                                              <span
                                                className="pulse-dot h-2 w-2 flex-shrink-0 rounded-full bg-green-500"
                                                style={
                                                  {
                                                    '--pulse-peak': '1.3',
                                                  } as React.CSSProperties
                                                }
                                              />
                                            )}
                                          </div>

                                          {/* Commit Message (Role Title) */}
                                          <h5
                                            className={`mb-4 font-semibold text-gray-800 dark:text-gray-200`}
                                          >
                                            <span
                                              className={
                                                isFirstJob
                                                  ? 'text-green-500'
                                                  : 'text-yellow-500'
                                              }
                                            >
                                              {isFirstJob ? 'feat' : 'update'}:
                                            </span>{' '}
                                            {role.position}
                                          </h5>

                                          {/* Details */}
                                          {(() => {
                                            const points =
                                              role.responsibilities &&
                                              role.responsibilities.length > 0
                                                ? role.responsibilities
                                                : toBulletPoints(
                                                    role.description
                                                  );

                                            if (points.length === 0)
                                              return null;

                                            return (
                                              <ul
                                                className={`mb-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-gray-600 dark:text-gray-300`}
                                              >
                                                {points.map((point, idx) => (
                                                  <li
                                                    key={`${roleHash}-point-${idx}`}
                                                    className="marker:text-blue-500"
                                                  >
                                                    {point}
                                                  </li>
                                                ))}
                                              </ul>
                                            );
                                          })()}

                                          {/* Technologies */}
                                          {role.technologies &&
                                            role.technologies.length > 0 && (
                                              <div className="flex flex-wrap gap-2">
                                                {role.technologies.map(
                                                  (
                                                    tech: string,
                                                    techIndex: number
                                                  ) => (
                                                    <span
                                                      key={techIndex}
                                                      className={`rounded-full border border-gray-300 bg-gray-100 px-2 py-1 text-xs text-gray-700 dark:border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300`}
                                                    >
                                                      {tech}
                                                    </span>
                                                  )
                                                )}
                                              </div>
                                            )}
                                        </div>
                                      </m.div>
                                    );
                                  })}
                                </div>
                              </m.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </m.div>
                    </div>
                  );
                })}
              </div>
            </div>
          </m.div>
        </div>
      </div>
    </section>
  );
};

export default ExperienceSection;
