import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductDetail from '@components/Templates/langkah/ProductDetail';
import { PRODUCTS, productBySlug } from '@components/Templates/langkah/data';

export function generateStaticParams() {
  return PRODUCTS.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = productBySlug(slug);
  return { title: product?.name ?? 'Product' };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = productBySlug(slug);
  if (!product) notFound();
  return <ProductDetail key={product.slug} product={product} />;
}
