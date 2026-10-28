import { getCachedTemplates } from '@lib/data';
import { pageCard } from '@lib/og';

export { size, contentType } from '@lib/og';
export const alt = 'Live website demos by Haziq Haiqal';

export default async function Image() {
  const templates = await getCachedTemplates().catch(() => []);

  return pageCard({
    title: 'Live demos',
    shots: templates.slice(-3).map((t) => t.preview_image_url),
  });
}
