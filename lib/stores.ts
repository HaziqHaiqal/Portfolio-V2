import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Profile, Experience, Education, Skill, Interest } from './supabase'
import { ProjectProps } from '../types/portfolio'

// Theme Store
interface ThemeState {
    isDarkMode: boolean
    toggleDarkMode: () => void
    setDarkMode: (isDark: boolean) => void
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            isDarkMode: false,
            toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
            setDarkMode: (isDark: boolean) => set({ isDarkMode: isDark }),
        }),
        {
            name: 'portfolio-theme',
            skipHydration: true, // Important for SSR
        }
    )
)

// Portfolio Data Store
interface PortfolioState {
    // Data
    profile: Profile | null
    experience: Experience[]
    education: Education[]
    skills: Skill[]
    projects: ProjectProps[]
    interests: Interest[]

    // Loading states
    profileLoading: boolean
    experienceLoading: boolean
    educationLoading: boolean
    skillsLoading: boolean
    projectsLoading: boolean
    interestsLoading: boolean

    // Error states
    profileError: string | null
    experienceError: string | null
    educationError: string | null
    skillsError: string | null
    projectsError: string | null
    interestsError: string | null

    // Actions
    setProfile: (profile: Profile | null) => void
    setExperience: (experience: Experience[]) => void
    setEducation: (education: Education[]) => void
    setSkills: (skills: Skill[]) => void
    setProjects: (projects: ProjectProps[]) => void
    setInterests: (interests: Interest[]) => void

    setProfileLoading: (loading: boolean) => void
    setExperienceLoading: (loading: boolean) => void
    setEducationLoading: (loading: boolean) => void
    setSkillsLoading: (loading: boolean) => void
    setProjectsLoading: (loading: boolean) => void
    setInterestsLoading: (loading: boolean) => void

    setProfileError: (error: string | null) => void
    setExperienceError: (error: string | null) => void
    setEducationError: (error: string | null) => void
    setSkillsError: (error: string | null) => void
    setProjectsError: (error: string | null) => void
    setInterestsError: (error: string | null) => void

    // Computed getters
    isLoading: () => boolean
    hasErrors: () => boolean
    getFeaturedProjects: () => ProjectProps[]
    getFeaturedSkills: () => Skill[]
}

export const usePortfolioStore = create<PortfolioState>((set, get) => ({
    // Data
    profile: null,
    experience: [],
    education: [],
    skills: [],
    projects: [],
    interests: [],

    // Loading states
    profileLoading: false,
    experienceLoading: false,
    educationLoading: false,
    skillsLoading: false,
    projectsLoading: false,
    interestsLoading: false,

    // Error states
    profileError: null,
    experienceError: null,
    educationError: null,
    skillsError: null,
    projectsError: null,
    interestsError: null,

    // Actions
    setProfile: (profile) => set({ profile }),
    setExperience: (experience) => set({ experience }),
    setEducation: (education) => set({ education }),
    setSkills: (skills) => set({ skills }),
    setProjects: (projects) => set({ projects }),
    setInterests: (interests) => set({ interests }),

    setProfileLoading: (loading) => set({ profileLoading: loading }),
    setExperienceLoading: (loading) => set({ experienceLoading: loading }),
    setEducationLoading: (loading) => set({ educationLoading: loading }),
    setSkillsLoading: (loading) => set({ skillsLoading: loading }),
    setProjectsLoading: (loading) => set({ projectsLoading: loading }),
    setInterestsLoading: (loading) => set({ interestsLoading: loading }),

    setProfileError: (error) => set({ profileError: error }),
    setExperienceError: (error) => set({ experienceError: error }),
    setEducationError: (error) => set({ educationError: error }),
    setSkillsError: (error) => set({ skillsError: error }),
    setProjectsError: (error) => set({ projectsError: error }),
    setInterestsError: (error) => set({ interestsError: error }),

    // Computed getters
    isLoading: () => {
        const state = get()
        return state.profileLoading || state.experienceLoading || state.educationLoading ||
            state.skillsLoading || state.projectsLoading || state.interestsLoading
    },

    hasErrors: () => {
        const state = get()
        return !!(state.profileError || state.experienceError || state.educationError ||
            state.skillsError || state.projectsError || state.interestsError)
    },

    getFeaturedProjects: () => {
        const state = get()
        return state.projects.filter(project => project.featured)
    },

    getFeaturedSkills: () => {
        const state = get()
        return state.skills.filter(skill => skill.is_featured)
    },
}))

// UI State Store (for modal, mobile menu, etc.)
interface UIState {
    selectedProject: ProjectProps | null
    isProjectModalOpen: boolean
    isMobileMenuOpen: boolean

    setSelectedProject: (project: ProjectProps | null) => void
    openProjectModal: (project: ProjectProps) => void
    closeProjectModal: () => void
    toggleMobileMenu: () => void
    closeMobileMenu: () => void
}

export const useUIStore = create<UIState>((set) => ({
    selectedProject: null,
    isProjectModalOpen: false,
    isMobileMenuOpen: false,

    setSelectedProject: (project) => set({ selectedProject: project }),
    openProjectModal: (project) => set({
        selectedProject: project,
        isProjectModalOpen: true
    }),
    closeProjectModal: () => set({
        selectedProject: null,
        isProjectModalOpen: false
    }),
    toggleMobileMenu: () => set((state) => ({
        isMobileMenuOpen: !state.isMobileMenuOpen
    })),
    closeMobileMenu: () => set({ isMobileMenuOpen: false }),
})) 