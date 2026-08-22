import { unstable_cache } from 'next/cache';
import type {
  Profile,
  Experience,
  Education,
  Skill,
  Interest,
} from '@lib/supabase';
import type { ProjectProps } from 'types/portfolio';
import type { DB } from './types';
import { getProfile } from './profile';
import { getExperience } from './experience';
import { getEducation } from './education';
import { getSkills } from './skills';
import { getProjectsWithImages } from './projects';
import { getInterests } from './interests';

export interface PortfolioData {
  profile: Profile | null;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  projects: ProjectProps[];
  interests: Interest[];
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
  ]);

  const [skills, projects, interests] = await Promise.all([
    getSkills(db),
    getProjectsWithImages(db),
    getInterests(db),
  ]);

  return { profile, experience, education, skills, projects, interests };
}

/** Cache tag for the public portfolio dataset. */
export const PORTFOLIO_TAG = 'portfolio';

/**
 * Cached read of the public portfolio dataset, shared across all visitors.
 *
 * Builds its own cookieless client because `unstable_cache` forbids reading
 * `cookies()`/`headers()` inside the cache scope. Admin mutations invalidate
 * this via `revalidateTag(PORTFOLIO_TAG, 'max')`, so the one-hour window is
 * only a backstop against a missed invalidation.
 */
export const getCachedPortfolio = unstable_cache(
  async (): Promise<PortfolioData> => {
    const { createPublicSupabase } = await import('@lib/supabase/public');
    return getPortfolio(createPublicSupabase());
  },
  ['portfolio-data'],
  { tags: [PORTFOLIO_TAG], revalidate: 3600 }
);
