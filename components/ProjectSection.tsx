import { Zap } from 'lucide-react';
import ProjectsGrid from '@components/List/ProjectsGrid';
import SectionHeader from '@components/Common/SectionHeader';
import Reveal from '@components/Common/Reveal';
import { ProjectProps } from 'types/portfolio';

interface ProjectSectionProps {
  projects: ProjectProps[];
  loading?: boolean;
  error?: string | null;
}

const ProjectSection = ({
  projects,
  loading = false,
  error = null,
}: ProjectSectionProps) => {
  return (
    <section id="projects" className="relative overflow-hidden px-6 py-32">
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
              <div className="relative">
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-500/30 border-t-blue-500" />
                <div className="animate-spin-reverse absolute inset-2 h-12 w-12 rounded-full border-4 border-purple-500/30 border-b-purple-500" />
              </div>
            </div>
          ) : error ? (
            <Reveal className="py-20 text-center" scale={0.9} duration={0.5}>
              <div className="mb-4 text-6xl">⚠️</div>
              <p className="text-lg text-red-600 dark:text-red-400">
                Oops! Something went wrong while loading projects.
              </p>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {error}
              </p>
            </Reveal>
          ) : projects && projects.length > 0 ? (
            <ProjectsGrid projects={projects} showFeaturedOnly={false} />
          ) : (
            <Reveal className="py-20 text-center" scale={0.9} duration={0.5}>
              <div className="mb-4 text-6xl">🚧</div>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Projects coming soon...
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Currently working on some exciting new projects!
              </p>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProjectSection;
