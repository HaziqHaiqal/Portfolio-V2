import { templateCard } from '@lib/og';

export { size, contentType } from '@lib/og';
export const alt = 'Teras Bina template demo';

export default function Image() {
  return templateCard('teras-bina');
}
