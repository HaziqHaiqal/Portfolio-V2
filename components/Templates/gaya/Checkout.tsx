'use client';

import { useState, type InputHTMLAttributes, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronDown, Lock } from 'lucide-react';
import { rm, useBag } from '@components/Templates/Bag';
import { MY_STATES, PAY_METHODS } from '@components/Templates/pay/data';
import {
  arrivalDate,
  BASE_PATH,
  DELIVERY,
  deliveryFee,
  deliveryOf,
  DEMO_DETAILS,
  type DeliveryId,
} from './data';
import {
  totalsFor,
  useOrders,
  useOrdersReady,
  useStockLeft,
  type Details,
  type OrderLine,
} from './orders';
import { useThumb } from './garment';

const EMPTY: Details = {
  name: '',
  email: '',
  phone: '',
  address1: '',
  address2: '',
  postcode: '',
  city: '',
  state: '',
  deliveryId: 'standard',
  method: 'fpx',
};

type Errors = Partial<Record<keyof Details, string>>;

function errorsOf(form: Details): Errors {
  const errors: Errors = {};
  if (!form.name.trim()) errors.name = 'Enter your name.';
  if (!/^\S+@\S+\.\S+$/.test(form.email.trim()))
    errors.email = 'Enter an email like name@example.com.';
  if (!/^01\d{8,9}$/.test(form.phone.replace(/[\s-]/g, '')))
    errors.phone = 'Enter a Malaysian mobile number, like 012-345 6789.';
  if (form.deliveryId === 'pickup') return errors;
  if (!form.address1.trim()) errors.address1 = 'Enter your street address.';
  if (!/^\d{5}$/.test(form.postcode.trim()))
    errors.postcode = 'Postcodes have 5 digits.';
  if (!form.city.trim()) errors.city = 'Enter your city.';
  if (!form.state) errors.state = 'Choose your state.';
  return errors;
}

export function Summary({
  lines,
  subtotal,
  delivery,
  total,
  deliveryId,
  from,
  action,
  eta = true,
}: {
  lines: OrderLine[];
  subtotal: number;
  delivery: number;
  total: number;
  deliveryId: DeliveryId;
  from: number;
  action?: ReactNode;
  eta?: boolean;
}) {
  const thumb = useThumb();
  return (
    <div className="gaya-sum">
      <div className="gaya-sum-head">
        <h2>Order summary</h2>
        {action}
      </div>
      <ul>
        {lines.map((line) => (
          <li key={line.key}>
            <span className="gaya-sum-img">
              <Image
                src={thumb(line.image)}
                alt=""
                fill
                sizes="64px"
                unoptimized
                className={line.fit === 'contain' ? 'is-contain' : ''}
              />
            </span>
            <span className="gaya-sum-name">
              <b>{line.name}</b>
              <small>
                {[line.variant, line.qty > 1 ? `Qty ${line.qty}` : '']
                  .filter(Boolean)
                  .join(', ')}
              </small>
            </span>
            <span className="gaya-sum-price">{rm(line.unit * line.qty)}</span>
          </li>
        ))}
      </ul>
      <dl>
        <div>
          <dt>Subtotal</dt>
          <dd>{rm(subtotal)}</dd>
        </div>
        <div>
          <dt>{deliveryOf(deliveryId).label}</dt>
          <dd>{delivery ? rm(delivery) : 'Free'}</dd>
        </div>
        <div className="gaya-sum-total">
          <dt>Total</dt>
          <dd>{rm(total)}</dd>
        </div>
      </dl>
      {eta && (
        <p className="gaya-sum-eta">
          {deliveryId === 'pickup'
            ? 'Ready to collect today'
            : from
              ? `Arrives by ${arrivalDate(deliveryId, from)}`
              : ''}
        </p>
      )}
    </div>
  );
}

function Field({
  id,
  label,
  error,
  wide = false,
  ...input
}: InputHTMLAttributes<HTMLInputElement> & {
  id: keyof Details;
  label: string;
  error?: string;
  wide?: boolean;
}) {
  return (
    <div className={`gaya-co-field ${wide ? 'is-wide' : ''}`}>
      <label htmlFor={`co-${id}`}>{label}</label>
      <input
        id={`co-${id}`}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `co-${id}-error` : undefined}
        {...input}
      />
      {error && (
        <p id={`co-${id}-error`} className="gaya-co-err">
          {error}
        </p>
      )}
    </div>
  );
}

function Option({
  name,
  checked,
  onChange,
  title,
  note,
  side,
}: {
  name: string;
  checked: boolean;
  onChange: () => void;
  title: string;
  note: string;
  side?: string;
}) {
  return (
    <label className="gaya-co-opt">
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <span className="gaya-co-dot" aria-hidden="true" />
      <span>
        <b>{title}</b>
        <small>{note}</small>
      </span>
      {side && <i>{side}</i>}
    </label>
  );
}

function CheckoutForm({ initial }: { initial: Details | null }) {
  const router = useRouter();
  const { lines, clear, openBag } = useBag();
  const placeOrder = useOrders((state) => state.placeOrder);
  const stockLeft = useStockLeft();
  const [form, setForm] = useState<Details>(initial ?? EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [now] = useState(() => Date.now());

  const totals = totalsFor(lines, form.deliveryId);
  const short = lines.find((line) => line.qty > stockLeft(line.key));
  const shortName = short
    ? `${short.product.name}${short.variant ? ` (${short.variant})` : ''}`
    : '';
  const pickup = form.deliveryId === 'pickup';
  const cod = form.method === 'cod';

  const set = <K extends keyof Details>(key: K, value: Details[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const submit = () => {
    const found = errorsOf(form);
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) {
      document.getElementById(`co-${first}`)?.focus();
      return;
    }
    if (short) return;
    setSubmitting(true);
    const order = placeOrder(lines, form);
    if (cod) {
      clear();
      router.push(`${BASE_PATH}/order?id=${order.id}`);
    } else router.push(`${BASE_PATH}/pay?order=${order.id}`);
  };

  if (!lines.length && !submitting)
    return (
      <div className="gaya-co-empty">
        <p>Your bag is empty. Add something first, then come back.</p>
        <Link href={BASE_PATH} className="gaya-btn">
          Back to the shop
        </Link>
      </div>
    );

  const summaryLines: OrderLine[] = lines.map((line) => ({
    key: line.key,
    name: line.product.name,
    variant: line.variant,
    image: line.product.image,
    fit: line.product.fit,
    unit: line.product.price,
    qty: line.qty,
  }));
  const summary = (
    <Summary
      lines={summaryLines}
      {...totals}
      deliveryId={form.deliveryId}
      from={now}
      action={
        <button type="button" onClick={openBag}>
          Edit bag
        </button>
      }
    />
  );

  return (
    <div className="gaya-co-grid">
      <div>
        <details className="gaya-co-mob">
          <summary>
            <span>
              Order summary
              <ChevronDown size={16} aria-hidden="true" />
            </span>
            <b>{rm(totals.total)}</b>
          </summary>
          {summary}
        </details>

        <p className="gaya-co-note">
          Demo checkout. No real payment is taken, and nothing you type leaves
          this browser.{' '}
          <button
            type="button"
            onClick={() => {
              setForm((prev) => ({ ...prev, ...DEMO_DETAILS }));
              setErrors({});
            }}
          >
            Fill demo details
          </button>
        </p>

        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <section className="gaya-co-sec">
            <h2>Contact</h2>
            <div className="gaya-co-fields">
              <Field
                id="name"
                label="Full name"
                autoComplete="name"
                value={form.name}
                onChange={(event) => set('name', event.target.value)}
                error={errors.name}
                wide
              />
              <Field
                id="email"
                label="Email, for your receipt"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(event) => set('email', event.target.value)}
                error={errors.email}
              />
              <Field
                id="phone"
                label="Mobile number, for the rider"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                value={form.phone}
                onChange={(event) => set('phone', event.target.value)}
                error={errors.phone}
              />
            </div>
          </section>

          <section className="gaya-co-sec">
            <h2>Delivery</h2>
            <fieldset className="gaya-co-opts">
              <legend className="sr-only">Delivery option</legend>
              {DELIVERY.map((option) => {
                const fee = deliveryFee(option.id, totals.subtotal);
                return (
                  <Option
                    key={option.id}
                    name="delivery"
                    checked={form.deliveryId === option.id}
                    onChange={() => set('deliveryId', option.id)}
                    title={option.label}
                    note={option.note}
                    side={fee ? rm(fee) : 'Free'}
                  />
                );
              })}
            </fieldset>
            {!pickup && (
              <div className="gaya-co-fields">
                <Field
                  id="address1"
                  label="Street address"
                  autoComplete="address-line1"
                  value={form.address1}
                  onChange={(event) => set('address1', event.target.value)}
                  error={errors.address1}
                  wide
                />
                <Field
                  id="address2"
                  label="Area or building (optional)"
                  autoComplete="address-line2"
                  value={form.address2}
                  onChange={(event) => set('address2', event.target.value)}
                  wide
                />
                <Field
                  id="postcode"
                  label="Postcode"
                  autoComplete="postal-code"
                  inputMode="numeric"
                  maxLength={5}
                  value={form.postcode}
                  onChange={(event) => set('postcode', event.target.value)}
                  error={errors.postcode}
                />
                <Field
                  id="city"
                  label="City"
                  autoComplete="address-level2"
                  value={form.city}
                  onChange={(event) => set('city', event.target.value)}
                  error={errors.city}
                />
                <div className="gaya-co-field is-wide">
                  <label htmlFor="co-state">State</label>
                  <select
                    id="co-state"
                    value={form.state}
                    onChange={(event) => set('state', event.target.value)}
                    aria-invalid={Boolean(errors.state)}
                    aria-describedby={
                      errors.state ? 'co-state-error' : undefined
                    }
                  >
                    <option value="">Choose a state</option>
                    {MY_STATES.map((state) => (
                      <option key={state}>{state}</option>
                    ))}
                  </select>
                  {errors.state && (
                    <p id="co-state-error" className="gaya-co-err">
                      {errors.state}
                    </p>
                  )}
                </div>
              </div>
            )}
          </section>

          <section className="gaya-co-sec">
            <h2>Payment</h2>
            <fieldset className="gaya-co-opts">
              <legend className="sr-only">Payment method</legend>
              {PAY_METHODS.map((method) => (
                <Option
                  key={method.id}
                  name="method"
                  checked={form.method === method.id}
                  onChange={() => set('method', method.id)}
                  title={
                    method.id === 'cod' && pickup
                      ? 'Pay at the shop'
                      : method.label
                  }
                  note={
                    method.id === 'cod' && pickup
                      ? 'Cash, card or DuitNow at the counter'
                      : method.note
                  }
                />
              ))}
            </fieldset>
            <button
              type="submit"
              disabled={submitting}
              className="gaya-btn gaya-co-pay"
            >
              <Lock size={15} aria-hidden="true" />
              {cod
                ? `Place order, ${rm(totals.total)}`
                : `Pay ${rm(totals.total)}`}
            </button>
            {short && (
              <p className="gaya-co-err" role="alert">
                {stockLeft(short.key)
                  ? `Only ${stockLeft(short.key)} of ${shortName} left. Lower it in your bag to continue.`
                  : `${shortName} has sold out. Remove it from your bag to continue.`}
              </p>
            )}
            <p className="gaya-co-small">
              {cod
                ? `Your order is confirmed straight away. Pay ${pickup ? 'when you collect it' : 'when it arrives'}.`
                : 'Next, approve the payment on DemoPay, a simulated payment page.'}
            </p>
          </section>
        </form>
      </div>

      <aside className="gaya-co-side">{summary}</aside>
    </div>
  );
}

export default function Checkout() {
  const ready = useOrdersReady();
  const { ready: bagReady } = useBag();
  const details = useOrders((state) => state.details);

  return (
    <section className="gaya-co">
      <p className="gaya-list-crumb">
        <Link href={BASE_PATH}>Home</Link> / Checkout
      </p>
      <h1 className="gaya-list-title">Checkout</h1>
      {ready && bagReady ? (
        <CheckoutForm initial={details} />
      ) : (
        <div className="gaya-co-wait" />
      )}
    </section>
  );
}
