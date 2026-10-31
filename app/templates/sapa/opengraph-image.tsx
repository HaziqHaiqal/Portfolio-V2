import { templateCard } from '@lib/og';

export { size, contentType } from '@lib/og';
export const alt = 'Sapa template demo';

export default function Image() {
  return templateCard('sapa');
}
