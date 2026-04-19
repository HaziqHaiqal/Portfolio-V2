import { create } from 'zustand'
import type { ProjectProps } from 'types/portfolio'

/**
 * Purely UI-local state (modals, menus). All server data is fetched in
 * Server Components and passed down as props — no client-side data store.
 */
interface UIState {
  selectedProject: ProjectProps | null
  isProjectModalOpen: boolean
  isMobileMenuOpen: boolean

  openProjectModal: (project: ProjectProps) => void
  closeProjectModal: () => void
  toggleMobileMenu: () => void
  closeMobileMenu: () => void
}

export const useUIStore = create<UIState>((set) => ({
  selectedProject: null,
  isProjectModalOpen: false,
  isMobileMenuOpen: false,

  openProjectModal: (project) =>
    set({ selectedProject: project, isProjectModalOpen: true }),
  closeProjectModal: () =>
    set({ selectedProject: null, isProjectModalOpen: false }),
  toggleMobileMenu: () =>
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
}))
