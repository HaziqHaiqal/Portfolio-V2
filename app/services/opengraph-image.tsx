import { pageCard } from '@lib/og';

export { size, contentType } from '@lib/og';
export const alt = 'Services by Haziq Haiqal';

export default function Image() {
  return pageCard('services', 'Services', 'Clear prices and a free quote');
}
