'use client';

import Link from 'next/link';
import { BASE_PATH } from './data';
import { useCatalogueReady, useItemBySlug } from './catalogue';
import ProductDetail from './ProductDetail';

/** Pieces added in the admin portal live in this browser, so their pages render here. */
export default function LocalProduct({ slug }: { slug: string }) {
  const ready = useCatalogueReady();
  const item = useItemBySlug(slug);

  if (item) return <ProductDetail item={item} />;
  if (!ready) return <div className="min-h-[70svh]" aria-busy="true" />;
  return (
    <section className="mx-auto max-w-[90rem] px-4 pb-24 pt-10 md:px-8">
      <h1 className="text-4xl font-extrabold tracking-[-0.05em] md:text-6xl">
        Not on the line
      </h1>
      <p className="mt-4 max-w-md text-tpl-ink/70">
        This piece was taken down, or it was added in another browser.
      </p>
      <Link href={BASE_PATH} className="gaya-btn mt-8 !w-auto px-6">
        Back to the shop
      </Link>
    </section>
  );
}
