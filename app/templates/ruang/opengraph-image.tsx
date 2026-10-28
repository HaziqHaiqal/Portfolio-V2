import { templateCard } from '@lib/og';

export { size, contentType } from '@lib/og';
export const alt = 'Ruang template demo';

export default function Image() {
  return templateCard('ruang');
}
