import { useState, useEffect, useMemo } from 'react'
import { supabase, Profile, Experience, Education, Skill, Interest } from '@lib/supabase'
import { ProjectProps } from 'types/portfolio'

export function useProfile() {
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchProfile() {
            try {
                const { data, error } = await supabase
                    .from('profile')
                    .select('*')
                    .single()

                if (error) throw error
                setProfile(data)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred')
            } finally {
                setLoading(false)
            }
        }

        fetchProfile()
    }, [])

    return { profile, loading, error }
}

export function useExperience() {
    const [experience, setExperience] = useState<Experience[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchExperience() {
            try {
                const { data, error } = await supabase
                    .from('experience')
                    .select('*')
                    .order('sort_order', { ascending: true })

                if (error) throw error
                setExperience(data || [])
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred')
            } finally {
                setLoading(false)
            }
        }

        fetchExperience()
    }, [])

    return { experience, loading, error }
}

export function useEducation() {
    const [education, setEducation] = useState<Education[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchEducation() {
            try {
                const { data, error } = await supabase
                    .from('education')
                    .select('*')
                    .order('sort_order', { ascending: true })

                if (error) throw error
                setEducation(data || [])
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred')
            } finally {
                setLoading(false)
            }
        }

        fetchEducation()
    }, [])

    return { education, loading, error }
}

export function useSkills(featured = false) {
    const [skills, setSkills] = useState<Skill[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchSkills() {
            try {
                let query = supabase.from('skills').select('*')

                if (featured) {
                    query = query.eq('is_featured', true)
                }

                const { data, error } = await query.order('sort_order', { ascending: true })

                if (error) throw error
                setSkills(data || [])
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred')
            } finally {
                setLoading(false)
            }
        }

        fetchSkills()
    }, [featured])

    return { skills, loading, error }
}

export function useProjects(featured = false) {
    const [projects, setProjects] = useState<ProjectProps[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchProjects() {
            try {
                let query = supabase
                    .from('projects')
                    .select(`
            *,
            images:project_images(*)
          `)

                if (featured) {
                    query = query.eq('featured', true)
                }

                const { data, error } = await query.order('sort_order', { ascending: true })

                if (error) throw error
                const mapped = (data || []).map((p: any) => ({
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
                }))
                setProjects(mapped)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred')
            } finally {
                setLoading(false)
            }
        }

        fetchProjects()
    }, [featured])

    return { projects, loading, error }
}

export function useInterests(featured = false) {
    const [interests, setInterests] = useState<Interest[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchInterests() {
            try {
                let query = supabase.from('interests').select('*')

                if (featured) {
                    query = query.eq('is_featured', true)
                }

                const { data, error } = await query.order('sort_order', { ascending: true })

                if (error) throw error
                setInterests(data || [])
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred')
            } finally {
                setLoading(false)
            }
        }

        fetchInterests()
    }, [featured])

    return { interests, loading, error }
}

// Combined hook for all portfolio data
export function usePortfolioData() {
    const profileData = useProfile()
    const experienceData = useExperience()
    const educationData = useEducation()
    const skillsData = useSkills(true) // Only featured skills for main page
    const projectsData = useProjects(true) // Only featured projects for main page
    const interestsData = useInterests(true) // Only featured interests for main page

    // Use useMemo to prevent unnecessary recalculations
    const loading = useMemo(() => (
        profileData.loading ||
        experienceData.loading ||
        educationData.loading ||
        skillsData.loading ||
        projectsData.loading ||
        interestsData.loading
    ), [
        profileData.loading,
        experienceData.loading,
        educationData.loading,
        skillsData.loading,
        projectsData.loading,
        interestsData.loading
    ])

    const error = useMemo(() => (
        profileData.error ||
        experienceData.error ||
        educationData.error ||
        skillsData.error ||
        projectsData.error ||
        interestsData.error
    ), [
        profileData.error,
        experienceData.error,
        educationData.error,
        skillsData.error,
        projectsData.error,
        interestsData.error
    ])

    return {
        profile: profileData.profile,
        experience: experienceData.experience,
        education: educationData.education,
        skills: skillsData.skills,
        projects: projectsData.projects,
        interests: interestsData.interests,
        loading,
        error
    }
} 