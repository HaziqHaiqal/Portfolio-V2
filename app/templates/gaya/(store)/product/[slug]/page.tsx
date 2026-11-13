import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductDetail from '@components/Templates/gaya/ProductDetail';
import { findBySlug, ITEMS, slugOf } from '@components/Templates/gaya/data';

export function generateStaticParams() {
  return ITEMS.map((item) => ({ slug: slugOf(item) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = findBySlug(slug);
  return { title: item ? `${item.name}, ${item.colour}` : 'Product' };
}

export default async function GayaProduct({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = findBySlug(slug);
  if (!item) notFound();
  return <ProductDetail item={item} />;
}
