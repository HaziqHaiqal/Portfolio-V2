import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, ChevronDown } from "lucide-react";
import { Experience } from "@lib/supabase";
import UniversalImage from "./admin/UniversalImage";
import { useTheme } from '@components/providers/ThemeProvider';
import { generateHash } from "@lib/utils";

interface ExperienceSectionProps {
  experience: Experience[] | null | undefined;
}

const ExperienceSection = ({ experience }: ExperienceSectionProps) => {
  const { isDarkMode } = useTheme();
  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(new Set());

  if (!experience || experience.length === 0) return null;

  const toggleCompany = (company: string) => {
    const newExpanded = new Set(expandedCompanies);
    if (newExpanded.has(company)) {
      newExpanded.delete(company);
    } else {
      newExpanded.add(company);
    }
    setExpandedCompanies(newExpanded);
  };

  const groupedExperience = experience.reduce((acc, exp) => {
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
  }, {} as Record<string, { logo?: string; roles: Experience[] }>);

  const sortedCompanies = Object.entries(groupedExperience).sort((a, b) => {
    const latestA = Math.max(...a[1].roles.map(r => new Date(r.start_date).getTime()));
    const latestB = Math.max(...b[1].roles.map(r => new Date(r.start_date).getTime()));
    return latestB - latestA;
  });

  return (
    <section
      id="experience"
      className="py-32 px-6 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full font-bold text-xl mb-8 shadow-xl"
            whileHover={{ scale: 1.05 }}
          >
            <Briefcase size={24} />
            experience.timeline()
          </motion.div>
          <p
            className={`text-xl leading-relaxed max-w-3xl mx-auto font-mono ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
          >
            <span className="text-blue-600">$</span> git log --oneline --graph
          </p>
        </motion.div>

        {/* Git-style Timeline */}
        <div className="max-w-4xl mx-auto">
          <motion.div
            className={`rounded-3xl border shadow-2xl p-8 ${isDarkMode
              ? "bg-gray-800/70 border-gray-700"
              : "bg-white/70 border-gray-200"
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
                  const companyRoles = data.roles.sort((a, b) =>
                    new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
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
                          height: isLast && !isExpanded ? '24px' : '100%'
                        }}
                      />

                      {/* Animated blue line overlay */}
                      <motion.div
                        className="absolute left-6 top-0 w-0.5 bg-blue-500 z-[1] origin-top"
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: isExpanded ? 1 : 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        style={{
                          height: isLast && !isExpanded ? '24px' : '100%',
                          transformOrigin: 'top'
                        }}
                      />

                      {/* Company Branch Point */}
                      <motion.div
                        className="flex items-start gap-4"
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: companyIndex * 0.1 }}
                        viewport={{ once: true }}
                      >
                        {/* Company node on main timeline */}
                        <div className="relative flex flex-col items-center z-10">
                          {/* Logo Container */}
                          <div
                            className="relative cursor-pointer"
                            onClick={() => toggleCompany(company)}
                          >
                            {/* Logo with animated border */}
                            <motion.div
                              className={`w-14 h-14 rounded-full flex items-center justify-center overflow-hidden shadow-lg relative border ${isDarkMode
                                  ? 'bg-gray-700 border-blue-500/40 shadow-blue-900/30'
                                  : 'bg-white border-blue-500/40 shadow-blue-900/30'
                                }`}
                              style={{
                                boxShadow: isExpanded
                                  ? '0 0 0 4px #3b82f6'
                                  : isDarkMode
                                    ? '0 0 0 4px #374151'
                                    : '0 0 0 4px #d1d5db'
                              }}
                              animate={{
                                boxShadow: isExpanded
                                  ? '0 0 0 4px #3b82f6'
                                  : isDarkMode
                                    ? '0 0 0 4px #374151'
                                    : '0 0 0 4px #d1d5db'
                              }}
                              transition={{ duration: 0.3, delay: isExpanded ? 0.2 : 0 }}
                            >
                              {data.logo ? (
                                <UniversalImage
                                  src={data.logo}
                                  alt={`${company} logo`}
                                  width={56}
                                  height={56}
                                  className="w-14 h-14 rounded-full object-cover"
                                />
                              ) : (
                                <Briefcase size={24} className={isDarkMode ? 'text-gray-300' : 'text-gray-600'} />
                              )}
                            </motion.div>
                          </div>
                        </div>

                        {/* Company Info */}
                        <div className="flex-1 pt-2">
                          <button
                            onClick={() => toggleCompany(company)}
                            className="w-full text-left group"
                          >
                            <div className="flex items-center gap-3">
                              <h4 className={`text-lg font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} group-hover:text-blue-500 transition-colors`}>
                                {company}
                              </h4>
                              <motion.div
                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                <ChevronDown size={16} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
                              </motion.div>
                            </div>
                          </button>

                          {/* Expandable Roles Section */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="mt-10 relative"
                              >
                                <div className="space-y-8">
                                  {companyRoles.map((role, roleIndex) => {
                                    const startDate = new Date(role.start_date);
                                    const endDate = role.is_current ? new Date() : new Date(role.end_date!);
                                    const roleHash = generateHash(role.position + (role.companies?.name || '') + role.start_date);
                                    // First job at company (oldest) = feat:, subsequent (newer) = update:
                                    const isFirstJob = roleIndex === companyRoles.length - 1;

                                    return (
                                      <motion.div
                                        key={`${company}-${roleIndex}`}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.4, delay: roleIndex * 0.1 }}
                                        className="relative flex items-start gap-3"
                                      >
                                        {/* Role commit dot - outline only, centered on timeline */}
                                        <div
                                          className={`absolute -left-[53px] top-[6px] w-3 h-3 rounded-full border-2 border-blue-500 z-10 ${isDarkMode ? 'bg-gray-800' : 'bg-white'
                                            }`}
                                        />

                                        {/* Role content - closer to dot */}
                                        <div className="flex-1 min-w-0">
                                          {/* Commit Hash & Date */}
                                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                                            <span className={`text-[12px] sm:text-xs font-mono px-1.5 sm:px-2 py-0.5 sm:py-1 rounded whitespace-nowrap ${isDarkMode ? 'bg-blue-800 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
                                              {roleHash}
                                            </span>
                                            <span className={`text-[12px] sm:text-xs whitespace-nowrap ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                              {startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - {role.is_current ? 'Present' : endDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                            </span>
                                            {role.is_current && (
                                              <motion.span
                                                className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"
                                                animate={{ scale: [1, 1.3, 1] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                              />
                                            )}
                                          </div>

                                          {/* Commit Message (Role Title) */}
                                          <h5 className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} mb-4`}>
                                            <span className={isFirstJob ? 'text-green-500' : 'text-yellow-500'}>
                                              {isFirstJob ? 'feat' : 'update'}:
                                            </span>{' '}
                                            {role.position}
                                          </h5>

                                          {/* Description - more spacing from title */}
                                          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4 leading-relaxed`}>
                                            {role.description}
                                          </p>

                                          {/* Technologies */}
                                          {role.technologies && role.technologies.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                              {role.technologies.map((tech: string, techIndex: number) => (
                                                <span
                                                  key={techIndex}
                                                  className={`text-xs px-2 py-1 rounded-full ${isDarkMode
                                                    ? 'bg-gray-700 text-gray-300 border border-gray-600'
                                                    : 'bg-gray-100 text-gray-700 border border-gray-300'
                                                    }`}
                                                >
                                                  {tech}
                                                </span>
                                              ))}
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
