'use client';

import Link from 'next/link';
import Photo from '@components/Templates/Photo';
import { rm, useBag } from '@components/Templates/Bag';
import { BASE_PATH, type Product } from './data';

export default function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  const { add } = useBag();
  const colour = product.colours[0];
  const [main, second] = colour.images;
  const href = `${BASE_PATH}/shop/${product.id}`;

  return (
    <article className="group">
      <div className="relative aspect-[3/4] overflow-hidden bg-tpl-tint">
        <Link
          href={href}
          aria-label={product.name}
          className="absolute inset-0"
        >
          <Photo
            src={main}
            alt={`${product.name} in ${colour.name.toLowerCase()}`}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
          {second && (
            <Photo
              src={second}
              alt=""
              fill
              sizes="(min-width: 1024px) 25vw, 50vw"
              className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
          )}
        </Link>
        {product.isNew && (
          <span className="pointer-events-none absolute left-3 top-3 bg-tpl-bg px-2 py-1 text-[11px] font-medium">
            New
          </span>
        )}
        <div className="absolute inset-x-3 bottom-3 hidden translate-y-2 bg-tpl-bg/95 p-3 opacity-0 backdrop-blur transition-all duration-300 group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 md:block">
          <p className="text-xs font-medium text-tpl-muted">Quick add</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {product.sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() =>
                  add(
                    {
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      image: main,
                    },
                    `${colour.name}, ${size}`
                  )
                }
                className="h-8 min-w-9 border border-tpl-line px-2 text-xs font-medium transition-colors hover:border-tpl-ink hover:bg-tpl-ink hover:text-tpl-bg"
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </div>
      <Link href={href} className="mt-3 block">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-sm font-medium">{product.name}</h3>
          <p className="text-sm tabular-nums">{rm(product.price)}</p>
        </div>
        <div className="mt-2 flex items-center gap-1.5">
          {product.colours.map((item) => (
            <span
              key={item.name}
              title={item.name}
              className="h-3 w-3 rounded-full ring-1 ring-tpl-line"
              style={{ background: item.hex }}
            />
          ))}
          <span className="ml-1 text-xs text-tpl-muted">
            {product.colours.length > 1
              ? `${product.colours.length} colours`
              : colour.name}
          </span>
        </div>
      </Link>
    </article>
  );
}
