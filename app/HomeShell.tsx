'use client';

import dynamic from 'next/dynamic';
import type { ReactNode } from 'react';
import { themeClasses as classes } from '@constants/theme';
import { useUIStore } from '@lib/stores';
import { useKeyboardShortcuts } from '@hooks/useCommon';
import FloatingElements from '@components/Layout/FloatingElements';
import GridBackground from '@components/Layout/GridBackground';
import NavBar from '@components/Layout/NavBar';
import ContactModal from '@components/Modal/ContactModal';
import type { Profile } from '@lib/supabase';

const ProjectModal = dynamic(() => import('@components/Modal/ProjectModal'), {
  ssr: false,
});

interface HomeShellProps {
  profile: Profile | null;
  children: ReactNode;
  footer: ReactNode;
}

export default function HomeShell({
  profile,
  children,
  footer,
}: HomeShellProps) {
  const { selectedProject, isProjectModalOpen, closeProjectModal } =
    useUIStore();

  useKeyboardShortcuts();

  return (
    <div
      className="relative min-h-screen overflow-hidden transition-all duration-500"
      suppressHydrationWarning
    >
      <div className={`relative ${classes.bg.primary}`}>
        <GridBackground />
        <FloatingElements />
        <NavBar />
        {children}
      </div>

      {footer}

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
