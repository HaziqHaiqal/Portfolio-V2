import React from "react";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import ProjectsGrid from "@components/ProjectsGrid";
import { ProjectProps } from 'types/portfolio';
import { useTheme } from "@components/providers/ThemeProvider";

interface ProjectShowcaseSectionProps {
  projects: ProjectProps[];
  loading: boolean;
  error: string | null;
  mounted: boolean;
  handleProjectClick: (project: ProjectProps) => void;
}

const ProjectShowcaseSection = ({
  projects,
  loading,
  error,
  mounted,
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
          {/* Heading */}
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 text-white px-8 py-3 rounded-full font-bold text-xl mb-8 shadow-xl"
              whileHover={{ scale: 1.05 }}
            >
              <Zap size={24} />
              repo.showcase()
            </motion.div>
            <motion.p
              className={`text-xl leading-relaxed max-w-3xl mx-auto font-mono ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <span className="text-orange-500">{'// '}</span>
              Building digital solutions that make a difference
            </motion.p>
          </motion.div>

          {/* Content */}
          {!mounted || loading ? (
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