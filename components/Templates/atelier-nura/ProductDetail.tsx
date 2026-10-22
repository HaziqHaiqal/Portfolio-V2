'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  Ruler,
  RefreshCw,
  Scissors,
  Truck,
  X,
} from 'lucide-react';
import Photo from '@components/Templates/Photo';
import { rm, useBag } from '@components/Templates/Bag';
import WhatsAppButton from '@components/Templates/WhatsAppButton';
import { BASE_PATH, BRAND, SIZE_GUIDE, type Product } from './data';

function SizeGuide({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center md:items-center">
      <button
        type="button"
        aria-label="Close size guide"
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="an-size-title"
        data-lenis-prevent
        onKeyDown={(event) => event.key === 'Escape' && onClose()}
        className="relative w-full max-w-lg animate-[tpl-rise_300ms_ease-out] bg-tpl-bg p-6 text-tpl-ink sm:p-8"
      >
        <div className="flex items-center justify-between">
          <h2 id="an-size-title" className="text-xl font-semibold">
            Size guide
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close size guide"
            autoFocus
            className="-mr-2 flex h-10 w-10 items-center justify-center"
          >
            <X size={20} />
          </button>
        </div>
        <p className="mt-2 text-sm text-tpl-muted">
          Measurements in inches. Our cuts are loose, so take the smaller size
          if you are in between.
        </p>
        <table className="mt-6 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-tpl-ink">
              {['Size', 'Bust', 'Length', 'Fits UK'].map((label) => (
                <th key={label} scope="col" className="pb-2 font-medium">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-tpl-line">
            {SIZE_GUIDE.map((row) => (
              <tr key={row.size}>
                <th scope="row" className="py-3 font-medium">
                  {row.size}
                </th>
                <td className="py-3 tabular-nums">{row.bust}</td>
                <td className="py-3 tabular-nums">{row.length}</td>
                <td className="py-3">{row.fits}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ProductDetail({ product }: { product: Product }) {
  const { add } = useBag();
  const [colourIndex, setColourIndex] = useState(0);
  const [size, setSize] = useState(
    product.sizes.length === 1 ? product.sizes[0] : ''
  );
  const [needSize, setNeedSize] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [slide, setSlide] = useState(0);
  const sizesRef = useRef<HTMLFieldSetElement>(null);

  const colour = product.colours[colourIndex];
  const addToBag = () => {
    if (!size) {
      setNeedSize(true);
      sizesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    add(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        image: colour.images[0],
      },
      `${colour.name}, ${size}`
    );
  };

  return (
    <div className="mx-auto grid max-w-[90rem] gap-8 md:px-8 lg:grid-cols-[1.35fr_1fr] lg:gap-14">
      <div>
        <div
          onScroll={(event) => {
            const el = event.currentTarget;
            setSlide(Math.round(el.scrollLeft / el.clientWidth));
          }}
          className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] md:grid md:grid-cols-2 md:gap-2 md:overflow-visible"
        >
          {colour.images.map((image, index) => (
            <div
              key={image}
              className={`relative aspect-[3/4] w-full shrink-0 snap-center bg-tpl-tint ${
                colour.images.length % 2 && index === 0
                  ? 'md:col-span-2 md:aspect-[4/5]'
                  : ''
              }`}
            >
              <Photo
                src={image}
                alt={
                  index === 0
                    ? `${product.name} in ${colour.name.toLowerCase()}`
                    : ''
                }
                fill
                priority={index === 0}
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
        {colour.images.length > 1 && (
          <div
            className="mt-3 flex justify-center gap-1.5 md:hidden"
            aria-hidden="true"
          >
            {colour.images.map((image, index) => (
              <span
                key={image}
                className={`h-1.5 rounded-full transition-all ${
                  slide === index ? 'w-6 bg-tpl-ink' : 'w-1.5 bg-tpl-line'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="px-4 md:px-0">
        <div className="lg:sticky lg:top-36">
          <nav aria-label="Breadcrumb" className="text-xs text-tpl-muted">
            <Link href={`${BASE_PATH}/shop`} className="hover:text-tpl-ink">
              Shop
            </Link>
            <span className="mx-2">/</span>
            <Link
              href={`${BASE_PATH}/shop?category=${product.category}`}
              className="hover:text-tpl-ink"
            >
              {product.category}
            </Link>
          </nav>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
            {product.name}
          </h1>
          <p className="mt-2 text-xl tabular-nums">{rm(product.price)}</p>

          <div className="mt-8">
            <p className="text-sm">
              Colour: <span className="font-medium">{colour.name}</span>
            </p>
            {product.colours.length > 1 && (
              <div role="group" aria-label="Colour" className="mt-3 flex gap-2">
                {product.colours.map((item, index) => (
                  <button
                    key={item.name}
                    type="button"
                    aria-pressed={index === colourIndex}
                    aria-label={item.name}
                    onClick={() => {
                      setColourIndex(index);
                      setSlide(0);
                    }}
                    className={`h-9 w-9 rounded-full ring-offset-2 ring-offset-tpl-bg transition-shadow ${
                      index === colourIndex
                        ? 'ring-2 ring-tpl-ink'
                        : 'ring-1 ring-tpl-line'
                    }`}
                    style={{ background: item.hex }}
                  />
                ))}
              </div>
            )}
          </div>

          {product.sizes.length > 1 && (
            <fieldset ref={sizesRef} className="mt-7">
              <div className="flex items-center justify-between">
                <legend className="text-sm">
                  Size{size && <span className="font-medium">: {size}</span>}
                </legend>
                <button
                  type="button"
                  onClick={() => setGuideOpen(true)}
                  className="flex items-center gap-1.5 text-sm underline underline-offset-4"
                >
                  <Ruler size={15} aria-hidden="true" />
                  Size guide
                </button>
              </div>
              <div className="mt-3 grid grid-cols-5 gap-2">
                {product.sizes.map((option) => (
                  <label
                    key={option}
                    className={`flex h-12 cursor-pointer items-center justify-center border text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-tpl-accent ${
                      size === option
                        ? 'border-tpl-ink bg-tpl-ink text-tpl-bg'
                        : needSize
                          ? 'border-red-400'
                          : 'border-tpl-line hover:border-tpl-ink'
                    }`}
                  >
                    <input
                      type="radio"
                      name="size"
                      value={option}
                      checked={size === option}
                      onChange={() => {
                        setSize(option);
                        setNeedSize(false);
                      }}
                      className="sr-only"
                    />
                    {option}
                  </label>
                ))}
              </div>
              {needSize && (
                <p className="mt-2 text-sm text-red-600" role="alert">
                  Choose a size to add this piece to your bag.
                </p>
              )}
            </fieldset>
          )}

          <div className="mt-7 grid gap-3">
            <button
              type="button"
              onClick={addToBag}
              className="h-14 bg-tpl-accent text-sm font-semibold text-tpl-on-accent transition-opacity hover:opacity-90"
            >
              Add to bag
            </button>
            <WhatsAppButton
              message={`Hi ${BRAND}! I have a question about the ${product.name} (${colour.name}).`}
              className="flex h-14 items-center justify-center gap-2 border border-tpl-line text-sm font-semibold transition-colors hover:border-tpl-ink"
            >
              Ask about this piece
            </WhatsAppButton>
          </div>

          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-tpl-muted">
            {[
              { icon: Scissors, text: 'Free alteration' },
              { icon: RefreshCw, text: '7-day exchange' },
              { icon: Truck, text: 'Posted in 2 days' },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-2">
                <Icon size={16} aria-hidden="true" className="text-tpl-ink" />
                {text}
              </li>
            ))}
          </ul>

          <div className="mt-8 divide-y divide-tpl-line border-y border-tpl-line">
            {[
              { title: 'Description', text: product.description },
              { title: 'Fabric and care', text: product.fabric },
              {
                title: 'Delivery and exchange',
                text: 'Posted within 2 working days with tracking. Exchange unworn pieces with tags within 7 days of delivery.',
              },
            ].map((item, index) => (
              <details key={item.title} open={index === 0} className="group">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between text-sm font-medium [&::-webkit-details-marker]:hidden">
                  {item.title}
                  <ChevronDown
                    size={18}
                    aria-hidden="true"
                    className="transition-transform group-open:rotate-180"
                  />
                </summary>
                <p className="pb-5 text-sm leading-relaxed text-tpl-muted">
                  {item.text}
                </p>
              </details>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-tpl-line bg-tpl-bg/95 p-3 backdrop-blur md:hidden">
        <div className="min-w-0 flex-1 pl-1">
          <p className="truncate text-sm font-medium">{product.name}</p>
          <p className="text-sm tabular-nums text-tpl-muted">
            {rm(product.price)}
          </p>
        </div>
        <button
          type="button"
          onClick={addToBag}
          className="h-12 shrink-0 bg-tpl-accent px-6 text-sm font-semibold text-tpl-on-accent"
        >
          {size ? 'Add to bag' : 'Choose size'}
        </button>
      </div>

      {guideOpen && <SizeGuide onClose={() => setGuideOpen(false)} />}
    </div>
  );
}
