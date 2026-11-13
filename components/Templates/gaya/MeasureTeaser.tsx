'use client';

import { useState } from 'react';
import { ITEMS } from './data';
import { fitLine } from './sheet';
import { Sheet, sizeWord } from './ProductDetail';

const ITEM = ITEMS.find((item) => item.id === 'hoodie-grey')!;

export default function MeasureTeaser() {
  const [size, setSize] = useState('M');
  return (
    <section className="gaya-p2 gaya-meas">
      <div className="gaya-meas-copy">
        <h2>Measure before you buy</h2>
        <p className="gaya-meas-sub">
          Every piece comes with its own sheet, measured flat with a ruler.
          Pick a size and the numbers change.
        </p>
        <div className="gaya-p2-field">
          <p className="gaya-p2-label-row">
            <span>Size</span>
          </p>
          <div className="gaya-p2-sizes" role="group" aria-label="Size">
            {ITEM.sizes.map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={size === s}
                aria-label={`${sizeWord(ITEM)} ${s}`}
                onClick={() => setSize(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <p className="gaya-meas-read" aria-live="polite">
          {ITEM.name}, size {size}. {fitLine(ITEM, size)}.
        </p>
      </div>
      <div className="gaya-meas-sheet">
        <Sheet item={ITEM} size={size} on />
      </div>
    </section>
  );
}
