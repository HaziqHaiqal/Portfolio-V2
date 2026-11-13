'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { rm } from '@components/Templates/Bag';
import {
  BASE_PATH,
  hrefOf,
  hungOf,
  imageOf,
  listBySlug,
  shadowOf,
  typeOf,
  type Item,
  type ListSlug,
} from './data';

const SORTS = [
  { id: 'new', label: 'Newest' },
  { id: 'low', label: 'Price, low to high' },
  { id: 'high', label: 'Price, high to low' },
];

function Rails({ items }: { items: Item[] }) {
  return (
    <div className="gaya-rails-wrap">
      <div className="gaya-rails">
        {items.map((item, i) => (
          <Link key={item.id} href={hrefOf(item)} className="gaya-rail-cell">
            <span className="gaya-rail-hang" aria-hidden="true">
              <span className="gaya-rail-swing">
                <Image
                  src={shadowOf(item.id)}
                  alt=""
                  width={967}
                  height={1224}
                  unoptimized
                  loading={i < 4 ? 'eager' : 'lazy'}
                  className="gaya-rail-shadow"
                />
                <Image
                  src={hungOf(item.id)}
                  alt=""
                  width={687}
                  height={944}
                  unoptimized
                  loading={i < 4 ? 'eager' : 'lazy'}
                  className="gaya-rail-cloth"
                />
              </span>
            </span>
            <span className="gaya-rail-meta">
              <b>{item.name}</b>
              <small>{item.colour}</small>
              <i>{rm(item.price)}</i>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Rak({ items }: { items: Item[] }) {
  return (
    <div className="gaya-rak">
      <div className="gaya-rak-tiers">
        {items.map((item, i) => (
          <Link key={item.id} href={hrefOf(item)} className="gaya-rak-slot">
            <span className="gaya-rak-contact" aria-hidden="true" />
            <Image
              src={imageOf(item.id)}
              alt=""
              width={804}
              height={500}
              unoptimized
              loading={i < 3 ? 'eager' : 'lazy'}
              className="gaya-rak-shoe"
            />
            <span className="gaya-rak-plank" aria-hidden="true" />
            <span className="gaya-rak-tag">
              <small>
                {item.name}, {item.colour}
              </small>
              <b>{rm(item.price)}</b>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function ListPage({ slug }: { slug: ListSlug }) {
  const list = listBySlug(slug);
  const types = [...new Set(list.items.map(typeOf).filter(Boolean))];
  const [type, setType] = useState('All');
  const [sort, setSort] = useState('new');

  const items = useMemo(() => {
    const shown = list.items.filter(
      (item) => type === 'All' || typeOf(item) === type
    );
    if (sort === 'low') return [...shown].sort((a, b) => a.price - b.price);
    if (sort === 'high') return [...shown].sort((a, b) => b.price - a.price);
    return shown;
  }, [list, type, sort]);

  return (
    <section className="gaya-list">
      <p className="gaya-list-crumb">
        <Link href={BASE_PATH}>Home</Link> / {list.name}
      </p>
      <h1 className="gaya-list-title">
        {list.name}
        <span>
          {list.items.length} {list.unit}
        </span>
      </h1>
      <div className="gaya-list-bar">
        {types.length > 1 ? (
          <div className="gaya-chips" role="group" aria-label="Type">
            {['All', ...types].map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={t === type}
                onClick={() => setType(t)}
              >
                {t}
                <span>
                  {t === 'All'
                    ? list.items.length
                    : list.items.filter((item) => typeOf(item) === t).length}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <span />
        )}
        <label className="gaya-sort">
          <span>Sort</span>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            {SORTS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown size={14} strokeWidth={2} aria-hidden="true" />
        </label>
      </div>
      {slug === 'shoes' ? <Rak items={items} /> : <Rails items={items} />}
    </section>
  );
}
