import { getCachedTemplates } from '@lib/data';
import { pageCard } from '@lib/og';

export { size, contentType } from '@lib/og';
export const alt = 'Services by Haziq Haiqal';

export default async function Image() {
  const templates = await getCachedTemplates().catch(() => []);

  return pageCard({
    title: 'Services',
    shots: templates.slice(0, 3).map((t) => t.preview_image_url),
  });
}
