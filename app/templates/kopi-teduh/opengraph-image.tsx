import { templateCard } from '@lib/og';

export { size, contentType } from '@lib/og';
export const alt = 'Kopi Teduh template demo';

export default function Image() {
  return templateCard('kopi-teduh');
}
