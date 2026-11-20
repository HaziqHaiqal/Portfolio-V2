'use client';

import type { CSSProperties } from 'react';
import { rm } from '@components/Templates/Bag';
import { artOf, shadowFor, type Item, type ListSlug } from '../data';
import { useLists } from '../catalogue';
import { Rope } from '../ShopAll';
import type { Cut } from '../cutout';

const RATIO = 687 / 944;

function Hanging({
  cut,
  shadow,
  offset,
  sag,
  label,
}: {
  cut: string;
  shadow?: string;
  offset: number;
  sag: number;
  label: string;
}) {
  return (
    <div
      className="gaya-adm-piece"
      style={
        {
          width: `calc(var(--ph) * ${RATIO})`,
          height: 'var(--ph)',
          left: `calc(50% - var(--ph) * ${RATIO / 2} + var(--ph) * ${offset})`,
          top: `calc(${22 + 14 * sag}px - var(--ph) * 0.035)`,
        } as CSSProperties
      }
    >
      {shadow && (
        // eslint-disable-next-line @next/next/no-img-element -- data URLs from the cut-out
        <img
          src={shadow}
          alt=""
          className="gaya-adm-shadow"
          style={{
            left: 'calc(var(--ph) * -0.1483)',
            top: 'calc(var(--ph) * -0.1483)',
            width: 'calc(var(--ph) * 1.0244)',
          }}
        />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element -- data URLs from the cut-out */}
      <img src={cut} alt={label} className="gaya-adm-cloth" />
    </div>
  );
}

function Standing({
  src,
  offset,
  label,
}: {
  src: string;
  offset: number;
  label: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- data URLs from the cut-out
    <img
      src={src}
      alt={label}
      className="gaya-adm-shoe"
      style={{
        width: 'var(--sw)',
        left: `calc(50% - var(--sw) / 2 + var(--sw) * ${offset})`,
        bottom: '17%',
      }}
    />
  );
}

/** The new piece on a short stretch of its line, between two pieces already there. */
export default function LinePreview({
  slug,
  cut,
  name,
  price,
}: {
  slug: ListSlug;
  cut: Cut;
  name: string;
  price: number | null;
}) {
  const list = useLists().find((other) => other.slug === slug)!;
  const [a, b] = list.items.filter((item: Item) => !item.images);
  const tag = `New${name ? `: ${name}` : ''}${price ? ` · ${rm(price)}` : ''}`;

  return (
    <div
      className={`gaya-adm-wall ${slug === 'shoes' ? 'h-[300px] md:h-[380px]' : 'h-[440px] md:h-[600px]'} [--ph:330px] [--sw:210px] md:[--ph:460px] md:[--sw:280px]`}
    >
      {slug === 'shoes' ? (
        <>
          <span className="gaya-adm-floor" aria-hidden="true" />
          <Standing src={artOf(a)} offset={-1.08} label={`${a.name}, ${a.colour}`} />
          <Standing src={artOf(b)} offset={1.08} label={`${b.name}, ${b.colour}`} />
          <Standing src={cut.cut} offset={0} label={`${name || 'New piece'}, cut out from your photo`} />
        </>
      ) : (
        <>
          <Rope />
          <Hanging
            cut={artOf(a)}
            shadow={shadowFor(a)}
            offset={-(RATIO + 0.02)}
            sag={0.9}
            label={`${a.name}, ${a.colour}`}
          />
          <Hanging
            cut={artOf(b)}
            shadow={shadowFor(b)}
            offset={RATIO + 0.02}
            sag={0.9}
            label={`${b.name}, ${b.colour}`}
          />
          <Hanging
            cut={cut.cut}
            shadow={cut.shadow}
            offset={0}
            sag={1}
            label={`${name || 'New piece'}, cut out from your photo`}
          />
        </>
      )}
      <span className="absolute bottom-5 left-1/2 z-[3] -translate-x-1/2 whitespace-nowrap rounded-[2px] bg-tpl-accent px-2.5 py-1.5 text-xs font-semibold text-tpl-on-accent">
        {tag}
      </span>
    </div>
  );
}
