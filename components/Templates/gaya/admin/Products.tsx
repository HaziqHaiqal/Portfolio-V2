'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { artOf, hrefOf, LOW_STOCK, stockKey, type Item } from '../data';
import {
  MAX_ADDED,
  useCatalogue,
  useCatalogueReady,
  useLists,
} from '../catalogue';
import { soldOf, useOrders, useStockLeft } from '../orders';
import { ADMIN } from './AdminShell';

function NumberCell({
  label,
  value,
  onCommit,
  className = '',
  prefix,
}: {
  label: string;
  value: number;
  onCommit: (n: number) => void;
  className?: string;
  prefix?: string;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  return (
    <label className={`gaya-adm-cell ${className}`}>
      <span>{label}</span>
      <span className="flex items-baseline">
        {prefix && <span className="pl-2.5 text-[13px]">{prefix}</span>}
        <input
          inputMode="numeric"
          autoComplete="off"
          value={draft ?? String(value)}
          aria-invalid={value === 0 && !prefix}
          onFocus={(e) => {
            setDraft(String(value));
            e.currentTarget.select();
          }}
          onChange={(e) => {
            const next = e.target.value.replace(/\D/g, '').slice(0, 4);
            setDraft(next);
            if (next) onCommit(Number(next));
          }}
          onBlur={() => setDraft(null)}
          className={value === 0 && !prefix ? 'text-[rgb(var(--gaya-error))]' : ''}
        />
      </span>
    </label>
  );
}

function Row({
  item,
  own,
  left,
  sold,
}: {
  item: Item;
  own: boolean;
  left: (key: string) => number;
  sold: Record<string, number>;
}) {
  const setPrice = useCatalogue((state) => state.setPrice);
  const setStock = useCatalogue((state) => state.setStock);
  const remove = useCatalogue((state) => state.remove);
  const [asking, setAsking] = useState(false);
  const low = item.sizes.filter((size) => {
    const n = left(stockKey(item, size));
    return n > 0 && n <= LOW_STOCK;
  });
  const out = item.sizes.filter((size) => left(stockKey(item, size)) === 0);

  return (
    <li className="flex flex-wrap items-start gap-x-6 gap-y-4 border-b border-tpl-line py-5">
      <div className="flex min-w-0 flex-1 basis-64 items-start gap-4">
        <span
          className={`relative shrink-0 bg-tpl-tint ${item.kind === 'shoes' ? 'h-14 w-20' : 'h-20 w-16'}`}
        >
          <Image
            src={artOf(item)}
            alt=""
            fill
            sizes="80px"
            unoptimized
            className={`object-contain p-1 ${item.kind === 'shoes' ? '-scale-x-100' : ''}`}
          />
        </span>
        <div className="min-w-0">
          <p className="font-semibold">
            {item.name}
            {own && (
              <span className="ml-2 inline-block bg-tpl-ink px-1.5 py-0.5 align-[2px] text-[11px] font-semibold text-tpl-bg">
                Added by you
              </span>
            )}
          </p>
          <p className="text-sm text-tpl-ink/70">{item.colour}</p>
          <p className="mt-1.5 text-[13px]">
            {out.length > 0 && (
              <span className="text-[rgb(var(--gaya-error))]">
                Sold out: {out.join(', ')}
              </span>
            )}
            {out.length > 0 && low.length > 0 && <span> · </span>}
            {low.length > 0 && <span>Low: {low.join(', ')}</span>}
          </p>
          <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[13px]">
            <Link href={hrefOf(item)} className="gaya-adm-link">
              View in store
            </Link>
            {own &&
              (asking ? (
                <span>
                  Take it down?{' '}
                  <button
                    type="button"
                    onClick={() => remove(item.id)}
                    className="gaya-adm-link text-[rgb(var(--gaya-error))]"
                  >
                    Yes
                  </button>{' '}
                  <button
                    type="button"
                    onClick={() => setAsking(false)}
                    className="gaya-adm-link"
                  >
                    Keep
                  </button>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setAsking(true)}
                  className="gaya-adm-link"
                >
                  Take down
                </button>
              ))}
          </p>
        </div>
      </div>
      <NumberCell
        label="Price"
        prefix="RM"
        value={item.price}
        onCommit={(n) => n > 0 && setPrice(item.id, n)}
        className="w-28"
      />
      <fieldset className="min-w-0 basis-full sm:basis-auto">
        <legend className="sr-only">Stock of {item.name}</legend>
        <div className="flex flex-wrap gap-1.5">
          {item.sizes.map((size) => {
            const key = stockKey(item, size);
            return (
              <NumberCell
                key={size}
                label={size}
                value={left(key)}
                onCommit={(n) => setStock(key, n, sold[key] ?? 0)}
                className="w-[3.75rem]"
              />
            );
          })}
        </div>
      </fieldset>
    </li>
  );
}

export default function Products() {
  const ready = useCatalogueReady();
  const lists = useLists();
  const added = useCatalogue((state) => state.added);
  const orders = useOrders((state) => state.orders);
  const left = useStockLeft();
  const sold = soldOf(orders);
  const full = added.length >= MAX_ADDED;
  const own = new Set(added.map((item) => item.id));

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="gaya-adm-title">Products</h1>
          <p className="gaya-adm-sub">
            Change a price or a stock count and the store updates straight
            away.
          </p>
        </div>
        {full ? (
          <p className="max-w-xs text-sm text-tpl-ink/70">
            This demo holds {MAX_ADDED} added pieces. Take one down to add
            another.
          </p>
        ) : (
          <Link href={`${ADMIN}/products/new`} className="gaya-btn !w-auto px-5">
            <Plus size={16} aria-hidden="true" />
            Add product
          </Link>
        )}
      </div>

      {!ready ? (
        <div className="mt-10 h-64 bg-tpl-tint" aria-busy="true" />
      ) : (
        lists.map((list) => (
          <section key={list.slug} className="mt-12">
            <h2 className="flex items-baseline gap-2 border-b border-tpl-ink pb-3 text-xl font-extrabold tracking-[-0.03em]">
              {list.name}
              <span className="text-sm font-semibold tabular-nums text-tpl-ink/70">
                {list.items.length}
              </span>
            </h2>
            <ul>
              {list.items.map((item) => (
                <Row
                  key={item.id}
                  item={item}
                  own={own.has(item.id)}
                  left={left}
                  sold={sold}
                />
              ))}
            </ul>
          </section>
        ))
      )}
    </>
  );
}
