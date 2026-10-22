import type { Metadata } from 'next';
import ShopGrid from '@components/Templates/atelier-nura/ShopGrid';
import {
  CATEGORIES,
  type Category,
} from '@components/Templates/atelier-nura/data';

export const metadata: Metadata = { title: 'Shop' };

export default async function AtelierNuraShop({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const initial = CATEGORIES.find((item) => item === category) as
    Category | undefined;

  return (
    <section className="mx-auto max-w-[90rem] px-4 pt-10 md:px-8 md:pt-14">
      <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
        {initial ?? 'Shop all'}
      </h1>
      <p className="mt-3 max-w-lg text-tpl-muted">
        Free alteration on sleeve and length. Exchange within 7 days.
      </p>
      <div className="mt-10">
        <ShopGrid key={initial ?? 'all'} initialCategory={initial} />
      </div>
    </section>
  );
}
