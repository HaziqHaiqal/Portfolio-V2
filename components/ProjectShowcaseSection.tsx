import React from "react";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import ProjectsGrid from "@components/ProjectsGrid";
import SectionHeader from "@components/SectionHeader";
import { ProjectProps } from 'types/portfolio';
import { useTheme } from "@components/providers/ThemeProvider";

interface ProjectShowcaseSectionProps {
  projects: ProjectProps[];
  loading?: boolean;
  error?: string | null;
  handleProjectClick: (project: ProjectProps) => void;
}

const ProjectShowcaseSection = ({
  projects,
  loading = false,
  error = null,
  handleProjectClick,
}: ProjectShowcaseSectionProps) => {
  const { isDarkMode } = useTheme();

  return (
    <section
      id="projects"
      className={`py-32 px-6 relative overflow-hidden`}
    >
      {/* Standard background - no custom gradients */}
      <div className="absolute inset-0 opacity-20">
        <div className="matrix-rain" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            icon={Zap}
            label="repo.showcase()"
            title="Projects"
            accentClass="text-purple-500"
            gradientClass="from-purple-600 to-purple-400"
          />

          {/* Content */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <motion.div
                className="relative"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div
                  className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="absolute inset-2 w-12 h-12 border-4 border-purple-500/30 border-b-purple-500 rounded-full"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
              </motion.div>
            </div>
          ) : error ? (
            <motion.div
              className="text-center py-20"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-6xl mb-4">⚠️</div>
              <p className={`text-lg ${isDarkMode ? "text-red-400" : "text-red-600"}`}>
                Oops! Something went wrong while loading projects.
              </p>
              <p className={`text-sm mt-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                {error}
              </p>
            </motion.div>
          ) : projects && projects.length > 0 ? (
            <ProjectsGrid
              projects={projects}
              onProjectClick={handleProjectClick}
              isDarkMode={isDarkMode}
              showFeaturedOnly={false}
            />
          ) : (
            <motion.div
              className="text-center py-20"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-6xl mb-4">🚧</div>
              <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Projects coming soon...
              </p>
              <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                Currently working on some exciting new projects!
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProjectShowcaseSection; 