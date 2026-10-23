'use client';

import { useState } from 'react';
import { Check, ShoppingBag } from 'lucide-react';
import Photo from '@components/Templates/Photo';
import { rm } from '@components/Templates/Bag';
import { lineKey, productBySlug, unitPrice } from './data';
import { availableFrom, useHydrated, useStore } from './store';
import { BUTTON_DARK, CONTAINER, SectionHeader } from './ui';

type PlateGlaze = 'Chalk' | 'Storm';
type CupGlaze = 'Oat' | 'Rust';
type Linen = 'Clay' | 'Pastel mix';
type Guests = 2 | 4;

interface Table {
  guests: Guests;
  plates: PlateGlaze;
  cups: CupGlaze;
  napkins: Linen;
  glasses: boolean;
}

interface Piece {
  slug: string;
  values: string[];
  qty: number;
  label: string;
}

const piecesFor = (table: Table): Piece[] => [
  {
    slug: 'rim-dinner-plate',
    values: [table.plates, '27 cm'],
    qty: table.guests,
    label: 'Dinner plates',
  },
  {
    slug: 'speckled-cup',
    values: [table.cups, 'Single'],
    qty: table.guests,
    label: 'Speckled cups',
  },
  {
    slug: 'washed-linen-napkins',
    values: [table.napkins],
    qty: 1,
    label: 'Linen napkins, set of 4',
  },
  {
    slug: 'speckled-serving-bowl',
    values: ['18 cm'],
    qty: 1,
    label: 'Serving bowl',
  },
  ...(table.glasses
    ? [
        {
          slug: 'ribbed-tumblers',
          values: ['Low, 220 ml'],
          qty: 1,
          label: 'Ribbed tumblers, set of 4',
        },
      ]
    : []),
];

/** The photo for the option a piece is set to, from its product. */
function imageFor(piece: Piece) {
  const product = productBySlug(piece.slug);
  if (!product) return '';
  const chosen = product.options
    .flatMap((option, index) =>
      option.values.filter((value) => value.label === piece.values[index])
    )
    .find((value) => value.image !== undefined);
  return product.images[chosen?.image ?? 0];
}

function swatchesOf(slug: string, name: string) {
  return (
    productBySlug(slug)
      ?.options.find((option) => option.name === name)
      ?.values.map((value) => ({
        label: value.label,
        colour: value.swatch ?? '#ddd',
      })) ?? []
  );
}

function Choice<T extends string>({
  name,
  value,
  options,
  onChange,
}: {
  name: string;
  value: T;
  options: { label: string; colour: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div>
      <p className="text-sm text-tpl-muted">
        {name}: <span className="text-tpl-ink">{value}</span>
      </p>
      <div role="radiogroup" aria-label={name} className="mt-2 flex gap-2">
        {options.map((option) => {
          const selected = option.label === value;
          return (
            <button
              key={option.label}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(option.label as T)}
              className={`flex h-11 items-center gap-2 rounded-full border pl-1.5 pr-4 text-sm transition-colors ${
                selected
                  ? 'border-tpl-ink bg-tpl-ink text-tpl-surface'
                  : 'border-tpl-line bg-tpl-surface hover:border-tpl-ink/40'
              }`}
            >
              <span
                style={{ background: option.colour }}
                className="h-8 w-8 rounded-full ring-1 ring-inset ring-black/10"
              />
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function TableBuilder() {
  const hydrated = useHydrated();
  const sold = useStore((state) => state.sold);
  const addToCart = useStore((state) => state.addToCart);
  const setCartOpen = useStore((state) => state.setCartOpen);
  const [table, setTable] = useState<Table>({
    guests: 2,
    plates: 'Chalk',
    cups: 'Rust',
    napkins: 'Clay',
    glasses: true,
  });
  const [added, setAdded] = useState(false);

  const set = <K extends keyof Table>(key: K, value: Table[K]) => {
    setTable((prev) => ({ ...prev, [key]: value }));
    setAdded(false);
  };

  const lines = piecesFor(table).flatMap((piece) => {
    const product = productBySlug(piece.slug);
    if (!product) return [];
    return [
      {
        ...piece,
        image: imageFor(piece),
        unit: unitPrice(product, piece.values),
        left: availableFrom(sold, lineKey(piece.slug, piece.values)),
      },
    ];
  });
  const total = lines.reduce((sum, line) => sum + line.unit * line.qty, 0);
  const short = hydrated ? lines.find((line) => line.qty > line.left) : null;

  const addTable = () => {
    for (const line of lines) addToCart(line.slug, line.values, line.qty);
    setAdded(true);
    setCartOpen(true);
  };

  return (
    <section className={`${CONTAINER} mt-20 md:mt-28`}>
      <SectionHeader
        title="Build Your Table Set"
        text="Pick the glazes and linen you like. The whole set goes into your bag in one tap."
      />
      <div className="mt-8 grid gap-3 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:h-full lg:grid-rows-[minmax(0,1fr)_auto]">
          {lines.map((line, index) => (
            <li
              key={line.slug}
              className={`relative overflow-hidden rounded-[24px] bg-tpl-tint ${
                index === 0
                  ? 'col-span-2 aspect-[4/3] md:col-span-4 lg:aspect-auto lg:min-h-[22rem]'
                  : 'aspect-square'
              }`}
            >
              <Photo
                key={line.image}
                src={line.image}
                alt={`${line.label}, ${line.values[0]}`}
                fill
                sizes={
                  index === 0
                    ? '(min-width: 1024px) 55vw, 100vw'
                    : '(min-width: 1024px) 14vw, (min-width: 768px) 25vw, 50vw'
                }
                className="animate-[tpl-rise_450ms_ease-out] object-cover"
              />
              <span className="absolute bottom-2.5 left-2.5 max-w-[calc(100%-1.25rem)] truncate rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-[#141414] backdrop-blur">
                {line.qty} × {line.label.split(',')[0]}
              </span>
            </li>
          ))}
          {!table.glasses && (
            <li className="aspect-square">
              <button
                type="button"
                onClick={() => set('glasses', true)}
                className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-[24px] border-2 border-dashed border-tpl-line text-sm text-tpl-muted transition-colors hover:border-tpl-ink/40 hover:text-tpl-ink"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-tpl-surface text-xl">
                  +
                </span>
                Add ribbed glasses
              </button>
            </li>
          )}
        </ul>

        <div className="flex flex-col rounded-[28px] bg-tpl-surface p-6 md:p-7">
          <div className="flex items-center justify-between gap-4">
            <p className="font-semibold">Table for</p>
            <div
              role="radiogroup"
              aria-label="Guests"
              className="flex rounded-full bg-tpl-tint p-1"
            >
              {([2, 4] as const).map((guests) => (
                <button
                  key={guests}
                  type="button"
                  role="radio"
                  aria-checked={table.guests === guests}
                  onClick={() => set('guests', guests)}
                  className={`h-9 rounded-full px-5 text-sm font-medium transition-colors ${
                    table.guests === guests
                      ? 'bg-tpl-ink text-tpl-surface'
                      : 'text-tpl-muted'
                  }`}
                >
                  {guests} guests
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 space-y-5">
            <Choice
              name="Dinner plates"
              value={table.plates}
              options={swatchesOf('rim-dinner-plate', 'Glaze')}
              onChange={(value: PlateGlaze) => set('plates', value)}
            />
            <Choice
              name="Cups"
              value={table.cups}
              options={swatchesOf('speckled-cup', 'Glaze')}
              onChange={(value: CupGlaze) => set('cups', value)}
            />
            <Choice
              name="Napkins"
              value={table.napkins}
              options={swatchesOf('washed-linen-napkins', 'Colour')}
              onChange={(value: Linen) => set('napkins', value)}
            />
            <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl bg-tpl-tint px-4 py-3">
              <span className="text-sm">Add ribbed glasses</span>
              <input
                type="checkbox"
                checked={table.glasses}
                onChange={(event) => set('glasses', event.target.checked)}
                className="peer sr-only"
              />
              <span
                aria-hidden="true"
                className="relative h-7 w-12 rounded-full bg-tpl-line transition-colors after:absolute after:left-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:bg-tpl-ink peer-checked:after:translate-x-5 peer-focus-visible:ring-4 peer-focus-visible:ring-tpl-ink/15"
              />
            </label>
          </div>

          <ul className="mt-6 space-y-1.5 border-t border-tpl-line pt-4 text-sm text-tpl-muted">
            {lines.map((line) => (
              <li key={line.slug} className="flex justify-between gap-3">
                <span>
                  {line.qty} × {line.label}
                </span>
                <span className="tabular-nums text-tpl-ink">
                  {rm(line.unit * line.qty)}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 flex items-baseline justify-between border-t border-tpl-line pt-4">
            <span className="font-semibold">Set total</span>
            <span className="text-3xl font-semibold tabular-nums tracking-[-0.02em]">
              {rm(total)}
            </span>
          </p>
          {short && (
            <p role="alert" className="mt-2 text-xs text-orange-700">
              Only {short.left} {short.values[0]} {short.label.toLowerCase()}{' '}
              left.{' '}
              {table.guests === 4
                ? 'Try another glaze or a table for 2.'
                : 'Try another glaze.'}
            </p>
          )}
          <button
            type="button"
            onClick={addTable}
            disabled={!hydrated || Boolean(short)}
            className={`${BUTTON_DARK} mt-5 w-full`}
          >
            {added ? (
              <>
                <Check size={17} aria-hidden="true" />
                Added. Add another set
              </>
            ) : (
              <>
                <ShoppingBag size={17} aria-hidden="true" />
                Add the set to bag
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
