'use client';

import { motion } from 'framer-motion';
import { Github, Linkedin, Mail } from 'lucide-react';
import { useTheme, useThemeClasses } from '@components/Provider/ThemeProvider';
import { useUIStore } from '@lib/stores';
import { useKeyboardShortcuts } from '@hooks/useCommon';
import ProjectModal from '@components/Modal/ProjectModal';
import FloatingElements from '@components/Layout/FloatingElements';
import NavBar from '@components/Layout/NavBar';
import HeroSection from '@components/HeroSection';
import ActivityOverview from '@components/ActivityOverview';
import TechStackSection from '@components/TechStackSection';
import ExperienceSection from '@components/ExperienceSection';
import EducationSection from '@components/EducationSection';
import ProjectSection from '@components/ProjectSection';
import ContactModal from '@components/Modal/ContactModal';

import type { ProjectProps } from 'types/portfolio';
import type { PortfolioData } from '@lib/data';

type Props = PortfolioData;

export default function HomeContent({
  profile,
  experience,
  education,
  projects,
}: Props) {
  const { isDarkMode } = useTheme();
  const classes = useThemeClasses();
  const {
    selectedProject,
    isProjectModalOpen,
    openProjectModal,
    closeProjectModal,
  } = useUIStore();

  useKeyboardShortcuts();

  const handleProjectClick = (project: ProjectProps) =>
    openProjectModal(project);
  const handleCloseModal = () => closeProjectModal();
  const currentYear = new Date().getFullYear();

  return (
    <div
      className="relative min-h-screen overflow-hidden transition-all duration-500"
      suppressHydrationWarning
    >
      <div className={`relative ${classes.bg.primary}`}>
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `
              linear-gradient(${isDarkMode ? 'rgba(255, 255, 255, 0.03)' : '#e7e7ea'} 1px, transparent 1px),
              linear-gradient(90deg, ${isDarkMode ? 'rgba(255, 255, 255, 0.03)' : '#e7e7ea'} 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />

        <FloatingElements />
        <NavBar />
        <HeroSection profile={profile} />
        <ActivityOverview />
        <TechStackSection />
        <ExperienceSection experience={experience} />
        <EducationSection education={education} />
        <ProjectSection
          projects={projects}
          handleProjectClick={handleProjectClick}
        />
      </div>

      <footer className="relative z-10 bg-gray-900 px-6 py-12 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-8 flex justify-center gap-6">
            <motion.a
              href={profile?.github_url || '#'}
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-800 transition-colors duration-300 hover:bg-blue-600"
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <Github size={20} />
            </motion.a>
            <motion.a
              href={profile?.linkedin_url || '#'}
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-800 transition-colors duration-300 hover:bg-blue-600"
              whileHover={{ scale: 1.1, rotate: -5 }}
            >
              <Linkedin size={20} />
            </motion.a>
            <motion.a
              href={`mailto:${profile?.email || 'woodyz.dev@gmail.com'}`}
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-800 transition-colors duration-300 hover:bg-purple-600"
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <Mail size={20} />
            </motion.a>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <p className="text-gray-500">
              © {currentYear} {profile?.full_name}
            </p>
          </div>
        </div>
      </footer>

      <ContactModal profile={profile} />

      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          isOpen={isProjectModalOpen}
          onClose={handleCloseModal}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
}
