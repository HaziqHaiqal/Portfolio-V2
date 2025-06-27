import { ProjectProps } from 'types/portfolio'
import { create } from 'zustand'
import { createClient } from '@utils/supabase/client'
import { Profile, Experience, Education, Skill, Project, Interest } from '@lib/supabase'

const supabaseClient = createClient()

interface PortfolioState {
  profile: Profile | null;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  projects: ProjectProps[];
  interests: Interest[];
  loading: boolean;
  error: string | null;
  fetchData: () => Promise<void>;
}

export const usePortfolioDataStore = create<PortfolioState>((set) => ({
  profile: null,
  experience: [],
  education: [],
  skills: [],
  projects: [],
  interests: [],
  loading: true,
  error: null,
  fetchData: async () => {
    set({ loading: true, error: null });
    try {
      const [
        profileRes,
        experienceRes,
        educationRes,
        skillsRes,
        projectsRes,
        interestsRes,
      ] = await Promise.all([
        supabaseClient.from('profile').select('*').single(),
        supabaseClient.from('experience').select('*').order('sort_order'),
        supabaseClient.from('education').select('*').order('sort_order'),
        supabaseClient.from('skills').select('*').order('sort_order'),
        supabaseClient.from('projects').select('*, images:project_images(*)').order('sort_order'),
        supabaseClient.from('interests').select('*').order('sort_order'),
      ]);

      if (profileRes.error) throw profileRes.error;
      // ... check other errors

      const mappedProjects = (projectsRes.data || []).map((p: any) => ({
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
      }));

      set({
        profile: profileRes.data,
        experience: experienceRes.data || [],
        education: educationRes.data || [],
        skills: skillsRes.data || [],
        projects: mappedProjects,
        interests: interestsRes.data || [],
        loading: false,
      });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'An unknown error occurred', loading: false });
    }
  },
}));

// The old hook below will be removed. 