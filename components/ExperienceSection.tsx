import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, ChevronDown } from 'lucide-react';
import { Experience } from '@lib/supabase';
import UniversalImage from '@components/Media/UniversalImage';
import SectionHeader from '@components/Common/SectionHeader';
import { useTheme } from '@components/Provider/ThemeProvider';
import { generateHash } from '@lib/utils';

interface ExperienceSectionProps {
  experience: Experience[] | null | undefined;
}

const ExperienceSection = ({ experience }: ExperienceSectionProps) => {
  const { isDarkMode } = useTheme();
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
          <motion.div
            className={`rounded-3xl border p-8 shadow-2xl ${
              isDarkMode
                ? 'border-gray-700 bg-gray-800/70'
                : 'border-gray-200 bg-white/70'
            }`}
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
                        className={`absolute left-6 top-0 w-0.5 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`}
                        style={{
                          height: isLast && !isExpanded ? '24px' : '100%',
                        }}
                      />

                      {/* Animated blue line overlay */}
                      <motion.div
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
                      <motion.div
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
                            <motion.div
                              className={`relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border shadow-lg ${
                                isDarkMode
                                  ? 'border-blue-500/40 bg-gray-700 shadow-blue-900/30'
                                  : 'border-blue-500/40 bg-white shadow-blue-900/30'
                              }`}
                              style={{
                                boxShadow: isExpanded
                                  ? '0 0 0 4px #3b82f6'
                                  : isDarkMode
                                    ? '0 0 0 4px #374151'
                                    : '0 0 0 4px #d1d5db',
                              }}
                              animate={{
                                boxShadow: isExpanded
                                  ? '0 0 0 4px #3b82f6'
                                  : isDarkMode
                                    ? '0 0 0 4px #374151'
                                    : '0 0 0 4px #d1d5db',
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
                                  className={
                                    isDarkMode
                                      ? 'text-gray-300'
                                      : 'text-gray-600'
                                  }
                                />
                              )}
                            </motion.div>
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
                                className={`text-lg font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} transition-colors group-hover:text-blue-500`}
                              >
                                {company}
                              </h4>
                              <motion.div
                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                <ChevronDown
                                  size={16}
                                  className={
                                    isDarkMode
                                      ? 'text-gray-400'
                                      : 'text-gray-600'
                                  }
                                />
                              </motion.div>
                            </div>
                          </button>

                          {/* Expandable Roles Section */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
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
                                      <motion.div
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
                                          className={`absolute -left-[53px] top-[6px] z-10 h-3 w-3 rounded-full border-2 border-blue-500 ${
                                            isDarkMode
                                              ? 'bg-gray-800'
                                              : 'bg-white'
                                          }`}
                                        />

                                        {/* Role content - closer to dot */}
                                        <div className="min-w-0 flex-1">
                                          {/* Commit Hash & Date */}
                                          <div className="mb-3 flex flex-wrap items-center gap-2 sm:gap-3">
                                            <span
                                              className={`whitespace-nowrap rounded px-1.5 py-0.5 font-mono text-[12px] sm:px-2 sm:py-1 sm:text-xs ${isDarkMode ? 'bg-blue-800 text-blue-300' : 'bg-blue-100 text-blue-700'}`}
                                            >
                                              {roleHash}
                                            </span>
                                            <span
                                              className={`whitespace-nowrap text-[12px] sm:text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
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
                                              <motion.span
                                                className="h-2 w-2 flex-shrink-0 rounded-full bg-green-500"
                                                animate={{ scale: [1, 1.3, 1] }}
                                                transition={{
                                                  duration: 2,
                                                  repeat: Infinity,
                                                }}
                                              />
                                            )}
                                          </div>

                                          {/* Commit Message (Role Title) */}
                                          <h5
                                            className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} mb-4`}
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
                                                className={`mb-4 list-disc space-y-2 pl-5 text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
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
                                                      className={`rounded-full px-2 py-1 text-xs ${
                                                        isDarkMode
                                                          ? 'border border-gray-600 bg-gray-700 text-gray-300'
                                                          : 'border border-gray-300 bg-gray-100 text-gray-700'
                                                      }`}
                                                    >
                                                      {tech}
                                                    </span>
                                                  )
                                                )}
                                              </div>
                                            )}
                                        </div>
                                      </motion.div>
                                    );
                                  })}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ExperienceSection;
