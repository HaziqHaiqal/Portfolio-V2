import { useEffect } from 'react'
import { usePortfolioStore } from '../lib/stores'
import { supabase } from '../lib/supabase'
import { ProjectProps } from '../types/portfolio'

// Hook to fetch and manage all portfolio data using Zustand
export function usePortfolioData() {
  const {
    // Data
    profile,
    experience,
    education,
    skills,
    projects,
    interests,
    
    // Loading states
    profileLoading,
    experienceLoading,
    educationLoading,
    skillsLoading,
    projectsLoading,
    interestsLoading,
    
    // Error states
    profileError,
    experienceError,
    educationError,
    skillsError,
    projectsError,
    interestsError,
    
    // Actions
    setProfile,
    setExperience,
    setEducation,
    setSkills,
    setProjects,
    setInterests,
    
    setProfileLoading,
    setExperienceLoading,
    setEducationLoading,
    setSkillsLoading,
    setProjectsLoading,
    setInterestsLoading,
    
    setProfileError,
    setExperienceError,
    setEducationError,
    setSkillsError,
    setProjectsError,
    setInterestsError,
    
    // Computed getters
    isLoading,
    hasErrors,
    getFeaturedProjects,
    getFeaturedSkills,
  } = usePortfolioStore()

  // Fetch profile data
  useEffect(() => {
    async function fetchProfile() {
      setProfileLoading(true)
      setProfileError(null)
      try {
        const { data, error } = await supabase
          .from('profile')
          .select('*')
          .single()

        if (error) throw error
        setProfile(data)
      } catch (err) {
        setProfileError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setProfileLoading(false)
      }
    }

    if (!profile && !profileLoading) {
      fetchProfile()
    }
  }, [profile, profileLoading, setProfile, setProfileLoading, setProfileError])

  // Fetch experience data
  useEffect(() => {
    async function fetchExperience() {
      setExperienceLoading(true)
      setExperienceError(null)
      try {
        const { data, error } = await supabase
          .from('experience')
          .select('*')
          .order('sort_order', { ascending: true })

        if (error) throw error
        setExperience(data || [])
      } catch (err) {
        setExperienceError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setExperienceLoading(false)
      }
    }

    if (experience.length === 0 && !experienceLoading) {
      fetchExperience()
    }
  }, [experience.length, experienceLoading, setExperience, setExperienceLoading, setExperienceError])

  // Fetch education data
  useEffect(() => {
    async function fetchEducation() {
      setEducationLoading(true)
      setEducationError(null)
      try {
        const { data, error } = await supabase
          .from('education')
          .select('*')
          .order('sort_order', { ascending: true })

        if (error) throw error
        setEducation(data || [])
      } catch (err) {
        setEducationError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setEducationLoading(false)
      }
    }

    if (education.length === 0 && !educationLoading) {
      fetchEducation()
    }
  }, [education.length, educationLoading, setEducation, setEducationLoading, setEducationError])

  // Fetch skills data
  useEffect(() => {
    async function fetchSkills() {
      setSkillsLoading(true)
      setSkillsError(null)
      try {
        const { data, error } = await supabase
          .from('skills')
          .select('*')
          .order('sort_order', { ascending: true })

        if (error) throw error
        setSkills(data || [])
      } catch (err) {
        setSkillsError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setSkillsLoading(false)
      }
    }

    if (skills.length === 0 && !skillsLoading) {
      fetchSkills()
    }
  }, [skills.length, skillsLoading, setSkills, setSkillsLoading, setSkillsError])

  // Fetch projects data
  useEffect(() => {
    async function fetchProjects() {
      setProjectsLoading(true)
      setProjectsError(null)
      try {
        const { data, error } = await supabase
          .from('projects')
          .select(`
            *,
            images:project_images(*)
          `)
          .order('sort_order', { ascending: true })

        if (error) throw error
        
        const mapped: ProjectProps[] = (data || []).map((p: any) => ({
          id: p.id,
          title: p.title,
          description: p.description,
          longDescription: p.long_description,
          tech: p.primary_tech || 'Web',
          year: p.year.toString(),
          status: p.status,
          gradient: `from-${p.gradient_from || 'blue-400'} to-${p.gradient_to || 'blue-600'}`,
          commits: p.commits_count || '0',
          languages: p.tech_stack || [],
          category: p.category,
          featured: p.featured,
          projectUrl: p.project_url,
          githubUrl: p.github_url,
          features: p.features,
          teamSize: p.team_size,
          duration: p.duration,
          images: p.images || [],
          thumbnail_url: p.thumbnail_url,
        }))
        
        setProjects(mapped)
      } catch (err) {
        setProjectsError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setProjectsLoading(false)
      }
    }

    if (projects.length === 0 && !projectsLoading) {
      fetchProjects()
    }
  }, [projects.length, projectsLoading, setProjects, setProjectsLoading, setProjectsError])

  // Fetch interests data
  useEffect(() => {
    async function fetchInterests() {
      setInterestsLoading(true)
      setInterestsError(null)
      try {
        const { data, error } = await supabase
          .from('interests')
          .select('*')
          .order('sort_order', { ascending: true })

        if (error) throw error
        setInterests(data || [])
      } catch (err) {
        setInterestsError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setInterestsLoading(false)
      }
    }

    if (interests.length === 0 && !interestsLoading) {
      fetchInterests()
    }
  }, [interests.length, interestsLoading, setInterests, setInterestsLoading, setInterestsError])

  return {
    // Data
    profile,
    experience,
    education,
    skills,
    projects,
    interests,
    
    // Loading states
    loading: isLoading(),
    profileLoading,
    experienceLoading,
    educationLoading,
    skillsLoading,
    projectsLoading,
    interestsLoading,
    
    // Error states
    error: hasErrors() ? 'Some data failed to load' : null,
    profileError,
    experienceError,
    educationError,
    skillsError,
    projectsError,
    interestsError,
    
    // Computed data
    featuredProjects: getFeaturedProjects(),
    featuredSkills: getFeaturedSkills(),
  }
} 