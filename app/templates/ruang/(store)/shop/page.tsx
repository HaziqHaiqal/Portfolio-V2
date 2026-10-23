import type { Metadata } from 'next';
import ShopGrid from '@components/Templates/ruang/ShopGrid';
import { CATEGORIES } from '@components/Templates/ruang/data';

export const metadata: Metadata = { title: 'Shop' };

export default async function RuangShop({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    q?: string;
    sale?: string;
    saved?: string;
  }>;
}) {
  const { category, q, sale, saved } = await searchParams;
  const initial = {
    category: CATEGORIES.find((item) => item.id === category)?.id ?? null,
    query: q ?? '',
    saleOnly: sale === '1',
    savedOnly: saved === '1',
  };

  return (
    <ShopGrid
      key={[initial.category, initial.query, sale, saved].join('|')}
      initial={initial}
    />
  );
}
