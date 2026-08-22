import React from 'react';
import { m } from 'framer-motion';
import { Zap } from 'lucide-react';
import ProjectsGrid from '@components/List/ProjectsGrid';
import SectionHeader from '@components/Common/SectionHeader';
import { ProjectProps } from 'types/portfolio';
import { useTheme } from '@components/Provider/ThemeProvider';

interface ProjectSectionProps {
  projects: ProjectProps[];
  loading?: boolean;
  error?: string | null;
  handleProjectClick: (project: ProjectProps) => void;
}

const ProjectSection = ({
  projects,
  loading = false,
  error = null,
  handleProjectClick,
}: ProjectSectionProps) => {
  const { isDarkMode } = useTheme();

  return (
    <section id="projects" className={`relative overflow-hidden px-6 py-32`}>
      {/* Standard background - no custom gradients */}
      <div className="absolute inset-0 opacity-20">
        <div className="matrix-rain" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            icon={Zap}
            label="repo.showcase()"
            title="Projects"
            accentClass="text-purple-500"
            gradientClass="from-purple-600 to-purple-400"
          />

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <m.div
                className="relative"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <m.div
                  className="h-16 w-16 rounded-full border-4 border-blue-500/30 border-t-blue-500"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                <m.div
                  className="absolute inset-2 h-12 w-12 rounded-full border-4 border-purple-500/30 border-b-purple-500"
                  animate={{ rotate: -360 }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
              </m.div>
            </div>
          ) : error ? (
            <m.div
              className="py-20 text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-4 text-6xl">⚠️</div>
              <p
                className={`text-lg ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}
              >
                Oops! Something went wrong while loading projects.
              </p>
              <p
                className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
              >
                {error}
              </p>
            </m.div>
          ) : projects && projects.length > 0 ? (
            <ProjectsGrid
              projects={projects}
              onProjectClick={handleProjectClick}
              isDarkMode={isDarkMode}
              showFeaturedOnly={false}
            />
          ) : (
            <m.div
              className="py-20 text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-4 text-6xl">🚧</div>
              <p
                className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
              >
                Projects coming soon...
              </p>
              <p
                className={`mt-2 text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}
              >
                Currently working on some exciting new projects!
              </p>
            </m.div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProjectSection;
