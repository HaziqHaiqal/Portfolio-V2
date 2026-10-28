import { templateCard } from '@lib/og';

export { size, contentType } from '@lib/og';
export const alt = 'Atelier Nura template demo';

export default function Image() {
  return templateCard('atelier-nura');
}
