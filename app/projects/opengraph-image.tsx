import { getCachedPortfolio } from '@lib/data';
import { pageCard } from '@lib/og';

export { size, contentType } from '@lib/og';
export const alt = 'Projects by Haziq Haiqal';

export default async function Image() {
  const { projects } = await getCachedPortfolio().catch(() => ({
    projects: [],
  }));

  return pageCard({
    title: 'Projects',
    shots: projects.slice(0, 3).map((p) => p.thumbnail_url),
  });
}
