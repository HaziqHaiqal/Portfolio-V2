import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductDetail from '@components/Templates/ruang/ProductDetail';
import { PRODUCTS, productBySlug } from '@components/Templates/ruang/data';

export function generateStaticParams() {
  return PRODUCTS.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const product = productBySlug((await params).slug);
  return product
    ? { title: product.name, description: product.blurb }
    : { title: 'Not found' };
}

export default async function RuangProduct({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const product = productBySlug((await params).slug);
  if (!product) notFound();
  return <ProductDetail key={product.slug} product={product} />;
}
