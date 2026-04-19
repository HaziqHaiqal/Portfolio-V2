import type {
  Profile,
  Experience,
  Education,
  Skill,
  Interest,
} from '@lib/supabase'
import type { ProjectProps } from 'types/portfolio'
import type { DB } from './types'
import { getProfile } from './profile'
import { getExperience } from './experience'
import { getEducation } from './education'
import { getSkills } from './skills'
import { getProjectsWithImages } from './projects'
import { getInterests } from './interests'

export interface PortfolioData {
  profile: Profile | null
  experience: Experience[]
  education: Education[]
  skills: Skill[]
  projects: ProjectProps[]
  interests: Interest[]
}

/**
 * Fetches the complete public portfolio dataset.
 *
 * Two sequential batches (3 + 3) keep cold HTTP/2 stream concurrency low
 * while still running most queries in parallel. Safe for use from both
 * Server Components and client code.
 */
export async function getPortfolio(db: DB): Promise<PortfolioData> {
  const [profile, experience, education] = await Promise.all([
    getProfile(db),
    getExperience(db),
    getEducation(db),
  ])

  const [skills, projects, interests] = await Promise.all([
    getSkills(db),
    getProjectsWithImages(db),
    getInterests(db),
  ])

  return { profile, experience, education, skills, projects, interests }
}
