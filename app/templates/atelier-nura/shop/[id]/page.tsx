import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductCard from '@components/Templates/atelier-nura/ProductCard';
import ProductDetail from '@components/Templates/atelier-nura/ProductDetail';
import { PRODUCTS, findProduct } from '@components/Templates/atelier-nura/data';

export function generateStaticParams() {
  return PRODUCTS.map((product) => ({ id: product.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return { title: findProduct(id)?.name ?? 'Product' };
}

export default async function AtelierNuraProduct({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = findProduct(id);
  if (!product) notFound();

  const related = PRODUCTS.filter(
    (item) => item.category === product.category && item.id !== product.id
  ).slice(0, 4);

  return (
    <>
      <section className="pt-0 md:pt-8">
        <ProductDetail product={product} />
      </section>
      {related.length > 0 && (
        <section className="mx-auto max-w-[90rem] px-4 pt-20 md:px-8 md:pt-28">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
            You may also like
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-10 md:gap-x-5 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
