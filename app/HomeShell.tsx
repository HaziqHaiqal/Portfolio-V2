'use client';

import dynamic from 'next/dynamic';
import { m } from 'framer-motion';
import { Github, Linkedin, Mail } from 'lucide-react';
import type { ReactNode } from 'react';
import { themeClasses as classes } from '@constants/theme';
import { useUIStore } from '@lib/stores';
import { getCurrentYear } from '@lib/format';
import { useKeyboardShortcuts } from '@hooks/useCommon';
import FloatingElements from '@components/Layout/FloatingElements';
import NavBar from '@components/Layout/NavBar';
import ContactModal from '@components/Modal/ContactModal';
import type { Profile } from '@lib/supabase';

const ProjectModal = dynamic(() => import('@components/Modal/ProjectModal'), {
  ssr: false,
});

interface HomeShellProps {
  profile: Profile | null;
  children: ReactNode;
}

export default function HomeShell({ profile, children }: HomeShellProps) {
  const { selectedProject, isProjectModalOpen, closeProjectModal } =
    useUIStore();

  useKeyboardShortcuts();

  const currentYear = getCurrentYear();

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
              linear-gradient(var(--grid-line) 1px, transparent 1px),
              linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />

        <FloatingElements />
        <NavBar />
        {children}
      </div>

      <footer className="relative z-10 bg-gray-900 px-6 py-12 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-8 flex justify-center gap-6">
            <m.a
              href={profile?.github_url || '#'}
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-800 transition-colors duration-300 hover:bg-blue-600"
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <Github size={20} />
            </m.a>
            <m.a
              href={profile?.linkedin_url || '#'}
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-800 transition-colors duration-300 hover:bg-blue-600"
              whileHover={{ scale: 1.1, rotate: -5 }}
            >
              <Linkedin size={20} />
            </m.a>
            <m.a
              href={`mailto:${profile?.display_name || 'woodyz.dev@gmail.com'}`}
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-800 transition-colors duration-300 hover:bg-purple-600"
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <Mail size={20} />
            </m.a>
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
          onClose={closeProjectModal}
        />
      )}
    </div>
  );
}
