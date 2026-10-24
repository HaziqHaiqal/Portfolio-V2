'use client';

import { useState, type FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BASE_PATH,
  colourway,
  DELIVERY,
  deliveryFee,
  DISCOUNT,
  PAY_METHODS,
  rm,
  type DeliveryId,
  type PayMethod,
} from './data';
import PayDialog from './PayDialog';
import {
  resolveLines,
  totalsFor,
  useHydrated,
  useStore,
  type Details,
  type Order,
} from './store';
import { BUTTON_ACCENT, CONTAINER, DISPLAY } from './ui';

const DEMO: Omit<Details, 'deliveryId' | 'method'> = {
  name: 'Aina Rahman',
  email: 'aina@example.com',
  phone: '012-345 6789',
  address: '12, Jalan Telawi 3, Bangsar Baru',
  postcode: '59100',
  city: 'Kuala Lumpur',
};

const FIELD =
  'h-12 w-full rounded-2xl border border-tpl-line bg-tpl-surface px-4 text-sm text-tpl-ink outline-none transition-colors placeholder:text-tpl-muted focus:border-tpl-accent';

export default function Checkout() {
  const router = useRouter();
  const hydrated = useHydrated();
  const cart = useStore((state) => state.cart);
  const placeOrder = useStore((state) => state.placeOrder);
  const markPaid = useStore((state) => state.markPaid);
  const markFailed = useStore((state) => state.markFailed);
  const [details, setDetails] = useState(() => ({
    name: '',
    email: '',
    phone: '',
    address: '',
    postcode: '',
    city: '',
  }));
  const [deliveryId, setDeliveryId] = useState<DeliveryId>('standard');
  const [method, setMethod] = useState<PayMethod>('fpx');
  const [code, setCode] = useState('');
  const [applied, setApplied] = useState<string | null>(null);
  const [paying, setPaying] = useState<Order | null>(null);

  const lines = hydrated ? resolveLines(cart) : [];
  const totals = totalsFor(cart, deliveryId, applied);

  if (hydrated && lines.length === 0 && !paying)
    return (
      <div className={`${CONTAINER} py-24 text-center`}>
        <h1 className={`${DISPLAY} text-5xl`}>Your bag is empty</h1>
        <Link href={`${BASE_PATH}/shop`} className={`${BUTTON_ACCENT} mt-8`}>
          Shop the Strider
        </Link>
      </div>
    );

  const field = (key: keyof typeof details, label: string, type = 'text') => (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-tpl-muted">
        {label}
      </span>
      <input
        type={type}
        required
        value={details[key]}
        onChange={(event) =>
          setDetails({ ...details, [key]: event.target.value })
        }
        className={FIELD}
      />
    </label>
  );

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setPaying(placeOrder({ ...details, deliveryId, method }, applied));
  };

  return (
    <div className={`${CONTAINER} pb-24 pt-10`}>
      <h1 className={`${DISPLAY} text-[clamp(2.6rem,7vw,5rem)] leading-[0.9]`}>
        Checkout
      </h1>
      <form
        onSubmit={submit}
        className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]"
      >
        <div className="space-y-8">
          <section>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Your details</h2>
              <button
                type="button"
                onClick={() => setDetails(DEMO)}
                className="text-sm font-semibold text-tpl-accent underline-offset-4 hover:underline"
              >
                Fill demo details
              </button>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {field('name', 'Full name')}
              {field('phone', 'Phone', 'tel')}
              <div className="sm:col-span-2">
                {field('email', 'Email', 'email')}
              </div>
              <div className="sm:col-span-2">{field('address', 'Address')}</div>
              {field('postcode', 'Postcode')}
              {field('city', 'City')}
            </div>
          </section>

          <fieldset>
            <legend className="text-lg font-bold">Delivery</legend>
            <div className="mt-4 grid gap-2">
              {DELIVERY.map((option) => (
                <label
                  key={option.id}
                  className={`relative flex cursor-pointer items-center justify-between gap-3 rounded-2xl border p-4 transition-colors ${
                    deliveryId === option.id
                      ? 'border-tpl-accent bg-tpl-surface'
                      : 'border-tpl-line'
                  }`}
                >
                  <input
                    type="radio"
                    name="delivery"
                    checked={deliveryId === option.id}
                    onChange={() => setDeliveryId(option.id)}
                    className="sr-only"
                  />
                  <span>
                    <span className="block text-sm font-bold">
                      {option.name}
                    </span>
                    <span className="block text-xs text-tpl-muted">
                      {option.detail}
                    </span>
                  </span>
                  <span className="text-sm font-bold tabular-nums">
                    {deliveryFee(option.id, totals.subtotal)
                      ? rm(deliveryFee(option.id, totals.subtotal))
                      : 'Free'}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-lg font-bold">Payment</legend>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {PAY_METHODS.map((option) => (
                <label
                  key={option.id}
                  className={`relative flex cursor-pointer items-center rounded-2xl border p-4 text-sm font-bold transition-colors ${
                    method === option.id
                      ? 'border-tpl-accent bg-tpl-surface'
                      : 'border-tpl-line'
                  }`}
                >
                  <input
                    type="radio"
                    name="method"
                    checked={method === option.id}
                    onChange={() => setMethod(option.id)}
                    className="sr-only"
                  />
                  {option.name}
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <aside className="self-start rounded-[28px] bg-tpl-surface p-5 lg:sticky lg:top-[calc(var(--demo-bar)+5rem)]">
          <h2 className="text-lg font-bold">Order summary</h2>
          <ul className="mt-4 space-y-3">
            {lines.map((line) => (
              <li key={line.key} className="flex items-center gap-3">
                <span className="relative h-14 w-16 shrink-0 overflow-hidden rounded-[14px] bg-white">
                  <Image
                    src={colourway(line.colour).image}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-contain"
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold">
                    {line.product.name}
                  </span>
                  <span className="block text-xs text-tpl-muted">
                    {colourway(line.colour).name}, UK {line.size} × {line.qty}
                  </span>
                </span>
                <span className="text-sm font-bold tabular-nums">
                  {rm(line.unit * line.qty)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex gap-2">
            <label htmlFor="langkah-code" className="sr-only">
              Discount code
            </label>
            <input
              id="langkah-code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder={`Try ${DISCOUNT.code}`}
              className={`${FIELD} h-11 uppercase`}
            />
            <button
              type="button"
              onClick={() => setApplied(code.trim() || null)}
              className="h-11 shrink-0 rounded-2xl bg-tpl-tint px-4 text-sm font-bold"
            >
              Apply
            </button>
          </div>
          {applied && !totals.discount && (
            <p className="mt-2 text-xs text-red-400">
              {applied.toUpperCase() === DISCOUNT.code
                ? `Spend ${rm(DISCOUNT.minSpend)} to use this code.`
                : 'That code is not valid.'}
            </p>
          )}
          <dl className="mt-5 space-y-2 border-t border-tpl-line pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-tpl-muted">Subtotal</dt>
              <dd className="tabular-nums">{rm(totals.subtotal)}</dd>
            </div>
            {totals.discount > 0 && (
              <div className="flex justify-between text-tpl-accent">
                <dt>Discount</dt>
                <dd className="tabular-nums">-{rm(totals.discount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-tpl-muted">Delivery</dt>
              <dd className="tabular-nums">
                {totals.delivery ? rm(totals.delivery) : 'Free'}
              </dd>
            </div>
            <div className="flex items-baseline justify-between pt-2 text-lg font-extrabold">
              <dt>Total</dt>
              <dd className="tabular-nums">{rm(totals.total)}</dd>
            </div>
          </dl>
          <button
            type="submit"
            disabled={!lines.length}
            className={`${BUTTON_ACCENT} mt-5 h-14 w-full text-base`}
          >
            Pay {rm(totals.total)}
          </button>
          <p className="mt-3 text-center text-xs text-tpl-muted">
            Demo checkout. No real payment is taken.
          </p>
        </aside>
      </form>

      {paying && (
        <PayDialog
          order={paying}
          onClose={() => setPaying(null)}
          onApprove={() => {
            markPaid(paying.id);
            router.push(`${BASE_PATH}/order?id=${paying.id}`);
          }}
          onDecline={(reason) => {
            markFailed(paying.id, reason);
            router.push(`${BASE_PATH}/order?id=${paying.id}`);
          }}
        />
      )}
    </div>
  );
}
