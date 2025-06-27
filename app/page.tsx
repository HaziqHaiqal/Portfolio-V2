"use client";

import { motion } from "framer-motion";
import { Mail, Github, Linkedin } from "lucide-react";
import { useState, useEffect } from "react";
import { usePortfolioDataStore } from "@hooks/usePortfolioDataStore";
import { useTheme, useThemeClasses } from "@components/providers/ThemeProvider";
import { useUIStore } from "@lib/stores";
import { useKeyboardShortcuts } from "@hooks/useCommon";
import ProjectModal from "@components/ProjectModal";
import FloatingElements from "@components/FloatingElements";
import NavBar from "@components/NavBar";
import HeroSection from "@components/HeroSection";
import ActivityOverview from "@components/ActivityOverview";
import TechStackSection from "@components/TechStackSection";
import ExperienceSection from "@components/ExperienceSection";
import ProjectShowcaseSection from "@components/ProjectShowcaseSection";
import NetworkSection from "@components/NetworkSection";

import { ProjectProps } from "types/portfolio";

export default function Home() {
  // Prevent hydration mismatch by not rendering dynamic content on server
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything until mounted to avoid ThemeProvider context issues
  if (!mounted) {
    return null;
  }

  return <HomeContent />;
}

function HomeContent() {
  // Use the new theme and UI stores (now safe because we're mounted)
  const { isDarkMode } = useTheme();
  const classes = useThemeClasses();
  const {
    selectedProject,
    isProjectModalOpen,
    openProjectModal,
    closeProjectModal
  } = useUIStore();

  // Fetch portfolio data from Supabase using the new store
  const {
    profile,
    experience,
    projects,
    loading,
    error,
    fetchData,
  } = usePortfolioDataStore();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Local mounted state for this component
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Project modal handlers
  const handleProjectClick = (project: ProjectProps) => {
    openProjectModal(project);
  };

  const handleCloseModal = () => {
    closeProjectModal();
  };

  // Enable keyboard shortcuts
  useKeyboardShortcuts();

  return (
    <div
      className={`min-h-screen relative overflow-hidden transition-all duration-500`}
      suppressHydrationWarning
    >
      {/* Main Content with Grid Background */}
      <div className={`relative ${classes.bg.primary}`}>
        {/* Background Grid */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `
              linear-gradient(${isDarkMode ? 'rgba(255, 255, 255, 0.03)' : '#e7e7ea'} 1px, transparent 1px),
              linear-gradient(90deg, ${isDarkMode ? 'rgba(255, 255, 255, 0.03)' : '#e7e7ea'} 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        ></div>

        {/* Floating Elements */}
        <FloatingElements />

        {/* Navigation */}
        <NavBar />

        {/* Hero Section */}
        <HeroSection profile={profile} />

        {/* Activity Overview Section */}
        <ActivityOverview />

        {/* Code Stack Section */}
        <TechStackSection />

        {/* Experience Section */}
        <ExperienceSection experience={experience} />

        {/* Project Showcase Section */}
        <ProjectShowcaseSection
          projects={projects || []}
          loading={loading}
          error={error}
          mounted={mounted}
          handleProjectClick={handleProjectClick}
        />

        {/* Network Section */}
        <NetworkSection profile={profile} />
      </div>

      {/* Footer - No Grid Background */}
      <footer className="py-12 px-6 bg-gray-900 text-white relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center gap-6 mb-8">
            <motion.a
              href={profile?.github_url || "#"}
              className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-blue-600 transition-colors duration-300"
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <Github size={20} />
            </motion.a>
            <motion.a
              href={profile?.linkedin_url || "#"}
              className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-blue-600 transition-colors duration-300"
              whileHover={{ scale: 1.1, rotate: -5 }}
            >
              <Linkedin size={20} />
            </motion.a>
            <motion.a
              href={`mailto:${profile?.email || "woodyz.dev@gmail.com"}`}
              className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-purple-600 transition-colors duration-300"
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <Mail size={20} />
            </motion.a>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <p className="text-gray-500">© 2024 {profile?.full_name || "Muhammad Haziq Haiqal Kamaruddin"} • Made with lots of ☕ and 🎵</p>
          </div>
        </div>
      </footer>

      {/* Project Modal */}
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
