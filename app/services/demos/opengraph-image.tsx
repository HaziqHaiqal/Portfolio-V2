import { pageCard } from '@lib/og';

export { size, contentType } from '@lib/og';
export const alt = 'Live website demos by Haziq Haiqal';

export default function Image() {
  return pageCard('demos', 'Live demos', 'Try every template first');
}
