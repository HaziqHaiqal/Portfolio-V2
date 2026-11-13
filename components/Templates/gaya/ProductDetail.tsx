'use client';

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Ruler } from 'lucide-react';
import { rm, useBag } from '@components/Templates/Bag';
import {
  BASE_PATH,
  bagProduct,
  FREE_POSTAGE_AT,
  hrefOf,
  hungOf,
  imageOf,
  ITEMS,
  listHref,
  listOf,
  variantOf,
  type Item,
} from './data';
import {
  careOf,
  fmtCm,
  linesOf,
  measuresOf,
  middleSize,
  specOf,
  styleOf,
  type Pt,
} from './sheet';
import Figure from './Figure';

export const sizeWord = (item: Item) =>
  item.kind === 'shoes'
    ? 'EU'
    : item.category === 'Bottoms'
      ? 'Waist'
      : 'Size';

function useWidth(ref: RefObject<HTMLElement | null>, fallback: number) {
  const [width, setWidth] = useState(fallback);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) =>
      setWidth(entry.contentRect.width)
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return width;
}

export function Sheet({
  item,
  size,
  on,
}: {
  item: Item;
  size: string | null;
  on: boolean;
}) {
  const shoe = item.kind === 'shoes';
  const W = shoe ? 804 : 687;
  const H = shoe ? 500 : 944;
  const spec = specOf(item);
  const frame = useRef<HTMLDivElement>(null);
  const width = useWidth(frame, shoe ? 640 : 500);
  const [note, setNote] = useState<number | null>(null);
  const u = W / Math.max(width, 1);
  const measures = measuresOf(item, size ?? middleSize(item));
  const at = ([x, y]: Pt): CSSProperties => ({
    left: `${(x / W) * 100}%`,
    top: `${(y / H) * 100}%`,
  });

  return (
    <div
      className={`gaya-p2-sheet${shoe ? ' is-shoe' : ''}`}
      data-on={on}
    >
      <div className="gaya-p2-head" aria-hidden={!on}>
        <span>{shoe ? 'OUTSIDE, SIDE ON' : 'FRONT, LAID FLAT'}</span>
        <span>
          {size
            ? `DRAWN AT ${sizeWord(item).toUpperCase()} ${size} · CM`
            : 'PICK A SIZE'}
        </span>
      </div>
      <div className="gaya-p2-stage">
        <div ref={frame} className="gaya-p2-frame">
          <div className="gaya-p2-art">
            <Image
              src={shoe ? imageOf(item.id) : hungOf(item.id)}
              alt={`${item.name}, ${item.colour}`}
              fill
              priority
              unoptimized
              sizes="(max-width: 1024px) 90vw, 640px"
              className="object-contain"
            />
          </div>
          <div className="gaya-p2-over" inert={!on}>
            <svg viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
              {spec.draw.dims.map((dim, i) => {
                const g = linesOf(dim, 7 * u);
                return (
                  <g key={i} style={{ '--d': `${i * 0.14}s` } as CSSProperties}>
                    {g.ext.map(([x1, y1, x2, y2], j) => (
                      <line
                        key={j}
                        className="gaya-p2-ext"
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        strokeWidth={1.2 * u}
                        strokeDasharray={`${4 * u} ${4 * u}`}
                      />
                    ))}
                    <path
                      className="gaya-p2-dim"
                      d={`M${g.main[0]} ${g.main[1]}L${g.main[2]} ${g.main[3]}`}
                      pathLength={1}
                      strokeWidth={2 * u}
                    />
                    {g.ticks.map(([x1, y1, x2, y2], j) => (
                      <line
                        key={j}
                        className="gaya-p2-tick"
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        strokeWidth={2 * u}
                      />
                    ))}
                  </g>
                );
              })}
            </svg>
            {spec.draw.dims.map((dim, i) => (
              <span
                key={i}
                className="gaya-p2-label"
                style={
                  {
                    ...at(linesOf(dim, 0).mid),
                    '--d': `${0.3 + i * 0.14}s`,
                  } as CSSProperties
                }
              >
                {measures[i].key}
                {size && (
                  <span key={measures[i].cm} className="gaya-p2-cm">
                    {fmtCm(measures[i].cm)} cm
                  </span>
                )}
              </span>
            ))}
            {spec.draw.dots.map((p, i) => (
              <span key={i} style={at(p)} className="gaya-p2-pin">
                <button
                  type="button"
                  className="gaya-p2-dot"
                  style={{ '--d': `${0.5 + i * 0.08}s` } as CSSProperties}
                  aria-label={`${i + 1}. ${spec.notes[i]}`}
                  aria-expanded={note === i}
                  onPointerEnter={(e) => e.pointerType === 'mouse' && setNote(i)}
                  onPointerLeave={(e) =>
                    e.pointerType === 'mouse' && setNote(null)
                  }
                  onFocus={() => setNote(i)}
                  onBlur={() => setNote(null)}
                  onClick={() => setNote(i)}
                >
                  {i + 1}
                </button>
                <span
                  className={`gaya-p2-note${p[0] / W > 0.55 ? ' is-left' : ''}`}
                  data-open={note === i}
                  aria-hidden="true"
                >
                  {spec.notes[i]}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="gaya-p2-foot" inert={!on}>
        <ul className="gaya-p2-key">
          {measures.map((m) => (
            <li key={m.key}>
              <b>{m.key}</b>
              {m.name}
            </li>
          ))}
        </ul>
        <dl className="gaya-p2-block">
          {[
            ['STYLE', styleOf(item)],
            ['NAME', item.name],
            ['COLOUR', item.colour],
            ['FABRIC', spec.fabric],
            ['FIT', spec.fit],
            ['SHEET', '1 of 1'],
          ].map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

const MAX_QTY = 10;

export default function ProductDetail({ item }: { item: Item }) {
  const { add } = useBag();
  const [size, setSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [draft, setDraft] = useState('1');
  const [measure, setMeasure] = useState(false);
  const [added, setAdded] = useState(false);
  const [missing, setMissing] = useState(false);
  const [nudge, setNudge] = useState(0);
  const sizesRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const shoe = item.kind === 'shoes';
  const spec = specOf(item);
  const word = shoe ? 'Size (EU)' : sizeWord(item);
  const more = ITEMS.filter(
    (other) => other.category === item.category && other.id !== item.id
  ).slice(0, 5);

  useEffect(() => () => clearTimeout(timer.current), []);

  const setQuantity = (n: number) => {
    const next = Math.min(MAX_QTY, Math.max(1, n));
    setQty(next);
    setDraft(String(next));
    setAdded(false);
  };

  const addToBag = () => {
    if (!size) {
      setMissing(true);
      setNudge((n) => n + 1);
      sizesRef.current?.querySelector('button')?.focus({ preventScroll: true });
      return;
    }
    add(bagProduct(item), variantOf(item, size), qty);
    setAdded(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1800);
  };

  return (
    <section className="gaya-p2 mx-auto grid max-w-[90rem] gap-x-14 gap-y-10 px-4 pb-14 pt-4 md:px-8 md:pt-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:grid-rows-[auto_1fr]">
      <div className="min-w-0 lg:col-start-1 lg:row-start-1">
        <div className="gaya-p2-bar">
          <p className="gaya-p2-crumb">
            <Link href={BASE_PATH}>Home</Link> /{' '}
            <Link href={listHref(listOf(item).slug)}>{listOf(item).name}</Link>
          </p>
          <button
            type="button"
            role="switch"
            aria-checked={measure}
            className="gaya-p2-switch"
            onClick={() => setMeasure((on) => !on)}
          >
            <Ruler size={17} strokeWidth={1.8} aria-hidden="true" />
            Measurements
            <span className="gaya-p2-track" aria-hidden="true" />
          </button>
        </div>
        <Sheet item={item} size={size} on={measure} />
      </div>

      <div className="gaya-p2-buy min-w-0 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start">
        <h1 className="gaya-p2-title">{item.name}</h1>
        <p className="gaya-p2-price">{rm(item.price)}</p>
        <p className="gaya-p2-colour">{item.colour}</p>

        <div className="gaya-p2-field">
          <p className="gaya-p2-label-row">
            <span>{word}</span>
            <span className="gaya-p2-missing" aria-live="polite">
              {missing && !size ? 'Pick a size first' : ''}
            </span>
          </p>
          <div
            ref={sizesRef}
            className="gaya-p2-sizes"
            role="group"
            aria-label={word}
            data-missing={missing && !size}
            style={{
              animationName: nudge
                ? nudge % 2
                  ? 'gaya-p2-nudge-a'
                  : 'gaya-p2-nudge-b'
                : 'none',
            }}
          >
            {item.sizes.map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={size === s}
                aria-label={`${sizeWord(item)} ${s}`}
                onClick={() => {
                  setSize(s);
                  setMissing(false);
                  setAdded(false);
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="gaya-p2-field">
          <p className="gaya-p2-label-row">
            <label htmlFor="gaya-qty">Quantity</label>
          </p>
          <div className="gaya-p2-qty">
            <button
              type="button"
              aria-label="One less"
              disabled={qty <= 1}
              onClick={() => setQuantity(qty - 1)}
            >
              <Minus size={22} strokeWidth={2} aria-hidden="true" />
            </button>
            <input
              id="gaya-qty"
              inputMode="numeric"
              autoComplete="off"
              value={draft}
              style={{ width: `calc(${Math.max(1, draft.length)}ch + 0.1em)` }}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, '').slice(0, 2);
                setDraft(digits);
                if (digits) setQuantity(Number(digits));
              }}
              onBlur={() => setDraft(String(qty))}
            />
            <button
              type="button"
              aria-label="One more"
              disabled={qty >= MAX_QTY}
              onClick={() => setQuantity(qty + 1)}
            >
              <Plus size={22} strokeWidth={2} aria-hidden="true" />
            </button>
          </div>
        </div>

        <button type="button" className="gaya-btn gaya-p2-add" onClick={addToBag}>
          <span>{added ? 'Added to bag' : 'Add to bag'}</span>
          <span>{rm(item.price * qty)}</span>
        </button>
        <p className="gaya-p2-note-line">
          Free postage above {rm(FREE_POSTAGE_AT)}. Exchange within 14 days.
        </p>

        <div className="gaya-p2-details">
          <p>{item.details}</p>
          <dl>
            <dt>Fabric</dt>
            <dd>{spec.fabric}</dd>
            <dt>Fit</dt>
            <dd>{spec.fit}</dd>
            <dt>Care</dt>
            <dd>{careOf(item)}</dd>
          </dl>
        </div>
      </div>

      {more.length > 0 && (
        <div className="min-w-0 lg:col-start-1 lg:row-start-2">
          <p className="text-sm text-tpl-muted">
            More {item.category.toLowerCase()}
          </p>
          <ul className="mt-3 flex gap-3 overflow-x-auto pb-2">
            {more.map((other) => (
              <li
                key={other.id}
                className={`shrink-0 ${shoe ? 'w-36 md:w-44' : 'w-24 md:w-28'}`}
              >
                <Link href={hrefOf(other)} className="block">
                  <Figure
                    id={other.id}
                    alt={`${other.name}, ${other.colour}`}
                    sizes="176px"
                  />
                  <span className="mt-1 block truncate text-xs">
                    {other.name}
                  </span>
                  <span className="block text-xs text-tpl-muted">
                    {other.colour}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
