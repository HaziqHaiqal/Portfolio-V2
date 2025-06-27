import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, ChevronRight } from "lucide-react";
import { Experience } from "@lib/supabase";
import Image from "next/image";
import { useTheme } from '@components/providers/ThemeProvider';

interface ExperienceSectionProps {
  experience: Experience[] | null | undefined;
}

const ExperienceSection = ({ experience }: ExperienceSectionProps) => {
  const { isDarkMode } = useTheme();
  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(new Set());

  // Early return after ALL hooks are called
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
    const companyName = exp.company;
    if (!acc[companyName]) {
      acc[companyName] = {
        logo: exp.company_logo_url,
        roles: [],
      };
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
      className={`py-32 px-6 relative overflow-hidden`}
    >
      {/* Matrix-style background */}
      <div className="absolute inset-0 opacity-20">
        <div className="matrix-rain" />
      </div>

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
            className={`text-xl leading-relaxed max-w-3xl mx-auto font-mono ${isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
          >
            <span className="text-blue-600">$</span> git log --oneline --graph
          </p>
        </motion.div>

        {/* Git-style Timeline */}
        <div className="max-w-4xl mx-auto">
          <motion.div
            className={`rounded-2xl border shadow-xl p-8 ${isDarkMode
              ? "bg-gray-800/80 border-gray-700 backdrop-blur-lg"
              : "bg-white/80 border-gray-200 backdrop-blur-lg"
              }`}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >


            {/* Git Timeline */}
            <div className="relative">
              {/* Main timeline line */}
              <div className={`absolute left-6 top-0 bottom-0 w-px ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`} />

              <div className="space-y-8">
                {sortedCompanies.map(([company, data], companyIndex) => {
                  const companyRoles = data.roles.sort((a, b) =>
                    new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
                  );
                  const isExpanded = expandedCompanies.has(company);

                  return (
                    <motion.div
                      key={company}
                      initial={{ opacity: 0, x: -30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: companyIndex * 0.1 }}
                      viewport={{ once: true }}
                      className="relative"
                    >
                      {/* Company Branch Point */}
                      <div className="flex items-start gap-4">
                        {/* Company node on main timeline */}
                        <div className="relative flex flex-col items-center">
                                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 overflow-hidden ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                            } shadow-lg z-10 cursor-pointer hover:scale-105 transition-transform`}
                            onClick={() => toggleCompany(company)}>
                              {data.logo ? (
                              <Image src={data.logo} alt={`${company} logo`} width={32} height={32} className="object-contain max-w-full max-h-full" />
                            ) : (
                              <Briefcase size={20} className={isDarkMode ? 'text-gray-300' : 'text-gray-600'} />
                            )}
                          </div>
                        </div>

                        {/* Company Info */}
                        <div className="flex-1 pt-2">
                          <button
                            onClick={() => toggleCompany(company)}
                            className="w-full text-left group"
                          >
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className={`text-lg font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} group-hover:text-blue-500 transition-colors`}>
                                {company}
                              </h4>
                              <motion.div
                                animate={{ rotate: isExpanded ? 90 : 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <ChevronRight size={16} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
                              </motion.div>
                            </div>
                            <p className={`text-sm font-mono ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              feature/{company.toLowerCase().replace(/\s+/g, '-')}-experience
                            </p>
                          </button>

                          {/* Expandable Roles Section */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="mt-6 ml-4 relative"
                              >
                                {/* Branch line from company to roles */}
                                <div className={`absolute left-0 top-0 bottom-0 w-px ${isDarkMode ? 'bg-blue-500' : 'bg-blue-400'}`} />

                                <div className="space-y-6">
                                  {companyRoles.map((role, roleIndex) => {
                                    const startDate = new Date(role.start_date);
                                    const endDate = role.is_current ? new Date() : new Date(role.end_date!);

                                    return (
                                      <motion.div
                                        key={`${company}-${roleIndex}`}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.4, delay: roleIndex * 0.1 }}
                                        className="relative flex items-start gap-4"
                                      >
                                        {/* Role commit dot positioned on branch line */}
                                        <div className="relative -ml-1.5">
                                          <div className={`w-3 h-3 rounded-full border-2 ${roleIndex === 0
                                            ? 'bg-blue-500 border-blue-500'
                                            : isDarkMode
                                              ? 'bg-gray-700 border-blue-400'
                                              : 'bg-white border-blue-400'
                                            } shadow-sm z-10`} />
                                        </div>

                                        {/* Role content */}
                                        <div className="flex-1 pb-4">
                                          {/* Commit Hash & Date */}
                                          <div className="flex items-center gap-3 mb-2">
                                            <span className={`text-xs font-mono px-2 py-1 rounded ${isDarkMode ? 'bg-blue-800 text-blue-300' : 'bg-blue-100 text-blue-700'
                                              }`}>
                                              {Math.random().toString(16).substr(2, 7)}
                                            </span>
                                            <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                              {startDate.toLocaleDateString()} - {role.is_current ? 'Present' : endDate.toLocaleDateString()}
                                            </span>
                                            {role.is_current && (
                                              <motion.span
                                                className="w-2 h-2 bg-green-500 rounded-full"
                                                animate={{ scale: [1, 1.3, 1] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                              />
                                            )}
                                          </div>

                                          {/* Commit Message (Role Title) */}
                                          <h5 className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} mb-2`}>
                                            feat: {role.position}
                                          </h5>

                                          {/* Description */}
                                          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-3 leading-relaxed`}>
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
                      </div>
                    </motion.div>
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