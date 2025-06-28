import { ProjectProps } from 'types/portfolio'
import { create } from 'zustand'
import { createClient } from '@utils/supabase/client'
import { Profile, Experience, Education, Skill, Project, Interest } from '@lib/supabase'

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
      const supabase = createClient();
      const [
        profileRes,
        experienceRes,
        educationRes,
        skillsRes,
        projectsRes,
        interestsRes,
      ] = await Promise.all([
        supabase.from('profile').select('*').single(),
        supabase.from('experience').select('*').order('sort_order'),
        supabase.from('education').select('*').order('sort_order'),
        supabase.from('skills').select('*').order('sort_order'),
        supabase.from('projects').select('*').order('sort_order'),
        supabase.from('interests').select('*').order('sort_order'),
      ]);

      if (profileRes.error) throw profileRes.error;
      // ... check other errors

      // Get project images from uploads table
      const projectImages = await Promise.all(
        (projectsRes.data || []).map(async (p: any) => {
          const { data: images } = await supabase
            .from('uploads')
            .select('id, file_url, alt_text, caption')
            .eq('entity_type', 'project')
            .eq('entity_id', p.id)
            .eq('field_name', 'image')
            .order('sort_order');

          return {
            projectId: p.id,
            images: (images || []).map(img => ({
              id: img.id,
              url: img.file_url,
              alt: img.alt_text || 'Project image',
              caption: img.caption
            }))
          };
        })
      );

      const mappedProjects = (projectsRes.data || []).map((p: any) => {
        const projectImageData = projectImages.find(pi => pi.projectId === p.id);

        return {
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
          images: projectImageData?.images || [],
          thumbnail_url: p.thumbnail_url,
        };
      });

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