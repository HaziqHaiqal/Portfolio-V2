'use client';

import { COLOURWAYS, lineKey, SIZES, type Colourway } from './data';
import { availableFrom, useHydrated, useStore } from './store';

/** A colour chip that shows the knit, the side pads and the sole. */
export const swatchFill = (item: Colourway) =>
  `linear-gradient(135deg, ${item.swatch} 0 56%, ${item.accent} 56% 70%, ${item.sole} 70%)`;

export function ColourPicker({
  value,
  onChange,
  small = false,
}: {
  value: string;
  onChange: (id: string) => void;
  small?: boolean;
}) {
  return (
    <div role="group" aria-label="Colour" className="flex gap-2.5">
      {COLOURWAYS.map((item) => (
        <button
          key={item.id}
          type="button"
          aria-pressed={value === item.id}
          aria-label={`${item.name}, ${item.note}`}
          title={item.name}
          onClick={() => onChange(item.id)}
          style={{ backgroundImage: swatchFill(item) }}
          className={`${small ? 'h-9 w-9' : 'h-11 w-11'} rounded-full ring-offset-2 ring-offset-tpl-bg transition-transform hover:scale-105 ${
            value === item.id ? 'ring-2 ring-tpl-ink' : 'ring-1 ring-tpl-line'
          }`}
        />
      ))}
    </div>
  );
}

/** UK sizes with live stock: sold-out sizes are struck through. */
export function SizeGrid({
  slug,
  colour,
  value,
  onChange,
}: {
  slug: string;
  colour: string;
  value: string | null;
  onChange: (size: string) => void;
}) {
  const hydrated = useHydrated();
  const sold = useStore((state) => state.sold);

  return (
    <fieldset>
      <legend className="text-sm font-bold">
        Size <span className="font-normal text-tpl-muted">UK</span>
      </legend>
      <div className="mt-3 grid grid-cols-6 gap-2">
        {SIZES.map((size) => {
          const stock = hydrated
            ? availableFrom(sold, lineKey(slug, colour, size))
            : 0;
          const out = hydrated && stock === 0;
          return (
            <button
              key={size}
              type="button"
              aria-pressed={value === size}
              disabled={out}
              onClick={() => onChange(size)}
              className={`relative h-12 rounded-2xl text-sm font-bold tabular-nums transition-colors disabled:cursor-not-allowed disabled:line-through disabled:opacity-35 ${
                value === size
                  ? 'bg-tpl-ink text-tpl-bg'
                  : 'bg-tpl-surface text-tpl-ink ring-1 ring-tpl-line hover:bg-tpl-tint'
              }`}
            >
              {size}
              {hydrated && stock > 0 && stock <= 3 && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-tpl-ink px-1.5 text-[10px] text-tpl-bg">
                  {stock} left
                </span>
              )}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
