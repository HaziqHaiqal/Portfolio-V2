'use client';

import {
  useState,
  type ComponentType,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Banknote,
  Building2,
  Check,
  ChevronDown,
  CreditCard,
  FlaskConical,
  Lock,
  QrCode,
  ShoppingBag,
  Store,
  Truck,
  Zap,
} from 'lucide-react';
import Photo from '@components/Templates/Photo';
import { rm } from '@components/Templates/Bag';
import {
  arrivalDate,
  BASE_PATH,
  BRAND,
  DELIVERY,
  deliveryFee,
  DEMO_DETAILS,
  DISCOUNT,
  MY_STATES,
  PAY_METHODS,
  type DeliveryId,
  type PayMethod,
} from './data';
import {
  availableFrom,
  resolveLines,
  totalsFor,
  useHydrated,
  useStore,
  useToday,
  type Details,
} from './store';
import { Logo } from './ui';

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
type Step = 'contact' | 'delivery' | 'payment';

const STEPS: Step[] = ['contact', 'delivery', 'payment'];

function contactErrors(form: Details): Errors {
  const errors: Errors = {};
  if (!form.name.trim()) errors.name = 'Enter your name.';
  if (!/^\S+@\S+\.\S+$/.test(form.email.trim()))
    errors.email = 'Enter an email like name@example.com.';
  if (!/^01\d{8,9}$/.test(form.phone.replace(/[\s-]/g, '')))
    errors.phone = 'Enter a Malaysian mobile number, e.g. 012-345 6789.';
  return errors;
}

function deliveryErrors(form: Details): Errors {
  const errors: Errors = {};
  if (form.deliveryId === 'pickup') return errors;
  if (!form.address1.trim()) errors.address1 = 'Enter your street address.';
  if (!/^\d{5}$/.test(form.postcode.trim()))
    errors.postcode = 'Postcodes have 5 digits.';
  if (!form.city.trim()) errors.city = 'Enter your city.';
  if (!form.state) errors.state = 'Choose your state.';
  return errors;
}

const DELIVERY_ICONS: Record<DeliveryId, ComponentType<{ size?: number }>> = {
  standard: Truck,
  express: Zap,
  pickup: Store,
};
const PAY_ICONS: Record<PayMethod, ComponentType<{ size?: number }>> = {
  fpx: Building2,
  card: CreditCard,
  ewallet: QrCode,
  cod: Banknote,
};

export function DemoNotice({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-start gap-2.5 rounded-2xl bg-amber-100 px-4 py-3 text-sm text-amber-950">
      <FlaskConical size={17} aria-hidden="true" className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </p>
  );
}

const INPUT =
  'h-12 w-full rounded-xl border bg-tpl-surface px-4 text-base outline-none transition-colors placeholder:text-tpl-muted/70 focus:border-tpl-ink md:text-sm';

function Field({
  id,
  label,
  error,
  className = '',
  ...input
}: InputHTMLAttributes<HTMLInputElement> & {
  id: keyof Details;
  label: string;
  error?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={`co-${id}`} className="text-sm">
        {label}
      </label>
      <input
        id={`co-${id}`}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `co-${id}-error` : undefined}
        className={`mt-1.5 ${INPUT} ${error ? 'border-red-500' : 'border-tpl-line'}`}
        {...input}
      />
      {error && (
        <p id={`co-${id}-error`} className="mt-1.5 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

function StepCard({
  number,
  title,
  state,
  summary,
  onEdit,
  children,
}: {
  number: number;
  title: string;
  state: 'active' | 'done' | 'todo';
  summary: ReactNode;
  onEdit: () => void;
  children: ReactNode;
}) {
  return (
    <section
      aria-current={state === 'active' ? 'step' : undefined}
      className={`rounded-[28px] border bg-tpl-surface p-6 transition-colors md:p-8 ${
        state === 'active'
          ? 'border-tpl-ink/20 shadow-[0_24px_50px_-30px_rgba(0,0,0,0.3)]'
          : 'border-tpl-line'
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <h2
          className={`flex items-center gap-3 text-lg font-semibold tracking-[-0.02em] ${
            state === 'todo' ? 'text-tpl-muted' : ''
          }`}
        >
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs ${
              state === 'done'
                ? 'bg-tpl-accent text-tpl-on-accent'
                : state === 'active'
                  ? 'bg-tpl-ink text-tpl-surface'
                  : 'bg-tpl-tint text-tpl-muted'
            }`}
          >
            {state === 'done' ? (
              <Check size={14} strokeWidth={3} aria-label="Done" />
            ) : (
              number
            )}
          </span>
          {title}
        </h2>
        {state === 'done' && (
          <button
            type="button"
            onClick={onEdit}
            className="text-sm font-medium underline underline-offset-4 hover:no-underline"
          >
            Edit
          </button>
        )}
      </div>
      {state === 'done' && (
        <div className="mt-3 pl-10 text-sm leading-relaxed text-tpl-muted">
          {summary}
        </div>
      )}
      {state === 'active' && <div className="mt-6">{children}</div>}
    </section>
  );
}

function CheckoutForm({ initial }: { initial: Details | null }) {
  const router = useRouter();
  const cart = useStore((state) => state.cart);
  const sold = useStore((state) => state.sold);
  const placeOrder = useStore((state) => state.placeOrder);
  const today = useToday();
  const [form, setForm] = useState<Details>(initial ?? EMPTY);
  const [step, setStep] = useState<Step>(() =>
    initial &&
    !Object.keys(contactErrors(initial)).length &&
    !Object.keys(deliveryErrors(initial)).length
      ? 'payment'
      : 'contact'
  );
  const [errors, setErrors] = useState<Errors>({});
  const [codeInput, setCodeInput] = useState('');
  const [code, setCode] = useState<string | null>(null);
  const [codeError, setCodeError] = useState('');
  const [stockError, setStockError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const lines = resolveLines(cart);
  const totals = totalsFor(cart, form.deliveryId, code);
  const cod = form.method === 'cod';
  const pickup = form.deliveryId === 'pickup';
  const stepIndex = STEPS.indexOf(step);
  const stateOf = (name: Step) => {
    const index = STEPS.indexOf(name);
    return index < stepIndex ? 'done' : index === stepIndex ? 'active' : 'todo';
  };

  const set = <K extends keyof Details>(key: K, value: Details[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const advance = (found: Errors, next: Step) => {
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) {
      document.getElementById(`co-${first}`)?.focus();
      return;
    }
    setStep(next);
  };

  const applyCode = () => {
    const entered = codeInput.trim().toUpperCase();
    if (entered !== DISCOUNT.code) {
      setCodeError('That code is not valid.');
      return;
    }
    if (totals.subtotal < DISCOUNT.minSpend) {
      setCodeError(`Spend ${rm(DISCOUNT.minSpend)} or more to use ${entered}.`);
      return;
    }
    setCode(entered);
    setCodeError('');
  };

  const submit = () => {
    const short = lines.find(
      (line) => line.qty > availableFrom(sold, line.key)
    );
    if (short) {
      setStockError(
        `Only ${availableFrom(sold, short.key)} of ${short.product.name}${short.values.length ? ` (${short.values.join(', ')})` : ''} left. Update your bag to continue.`
      );
      return;
    }
    setSubmitting(true);
    const order = placeOrder(form, code);
    router.push(
      cod
        ? `${BASE_PATH}/order?id=${order.id}`
        : `${BASE_PATH}/pay?order=${order.id}`
    );
  };

  if (!lines.length && !submitting)
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <ShoppingBag size={36} aria-hidden="true" className="text-tpl-muted" />
        <h2 className="text-2xl font-semibold tracking-[-0.03em]">
          Your bag is empty
        </h2>
        <p className="text-tpl-muted">Add something first, then come back.</p>
        <Link
          href={`${BASE_PATH}/shop`}
          className="mt-2 rounded-full bg-tpl-accent px-6 py-3 text-sm font-medium text-tpl-on-accent"
        >
          Browse the shop
        </Link>
      </div>
    );

  const receipt = (place: 'top' | 'side') => (
    <div className="relative rounded-[28px] bg-tpl-surface px-6 pb-6 pt-6">
      <div className="flex items-center justify-between">
        <Logo />
        <p className="text-xs text-tpl-muted">Order summary</p>
      </div>
      <ul className="mt-5 space-y-4">
        {lines.map((line) => (
          <li key={line.key} className="flex items-center gap-3">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[14px] bg-tpl-tint">
              <Photo
                src={line.product.images[0]}
                alt=""
                fill
                sizes="48px"
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1 text-sm">
              <p className="leading-snug">
                {line.qty > 1 && (
                  <span className="text-tpl-muted">{line.qty} × </span>
                )}
                {line.product.name}
              </p>
              {line.values.length > 0 && (
                <p className="text-xs text-tpl-muted">
                  {line.values.join(', ')}
                </p>
              )}
            </div>
            <p className="text-sm tabular-nums">{rm(line.unit * line.qty)}</p>
          </li>
        ))}
      </ul>

      <div className="mt-6 border-t border-dashed border-tpl-ink/20 pt-5">
        <label htmlFor={`co-code-${place}`} className="text-sm">
          Discount code
        </label>
        <div className="mt-1.5 flex gap-2">
          <input
            id={`co-code-${place}`}
            value={codeInput}
            onChange={(event) => {
              setCodeInput(event.target.value);
              setCodeError('');
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                applyCode();
              }
            }}
            placeholder={DISCOUNT.code}
            className={`${INPUT} uppercase ${codeError ? 'border-red-500' : 'border-tpl-line'}`}
          />
          <button
            type="button"
            onClick={applyCode}
            className="h-12 shrink-0 rounded-xl bg-tpl-ink px-4 text-sm font-medium text-tpl-surface"
          >
            Apply
          </button>
        </div>
        <p
          className={`mt-1.5 text-xs ${codeError ? 'text-red-600' : 'text-tpl-muted'}`}
        >
          {codeError ||
            (code
              ? `${code} applied: ${rm(DISCOUNT.amount)} off.`
              : `Try ${DISCOUNT.code} for ${rm(DISCOUNT.amount)} off orders above ${rm(DISCOUNT.minSpend)}.`)}
        </p>
      </div>

      <dl className="mt-5 space-y-2 border-t border-dashed border-tpl-ink/20 pt-5 text-sm">
        <div className="flex justify-between">
          <dt className="text-tpl-muted">Subtotal</dt>
          <dd className="tabular-nums">{rm(totals.subtotal)}</dd>
        </div>
        {totals.discount > 0 && (
          <div className="flex justify-between">
            <dt className="text-tpl-muted">Discount ({code})</dt>
            <dd className="tabular-nums">−{rm(totals.discount)}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-tpl-muted">
            {DELIVERY.find((item) => item.id === form.deliveryId)?.label}
          </dt>
          <dd className="tabular-nums">
            {totals.delivery ? rm(totals.delivery) : 'Free'}
          </dd>
        </div>
        <div className="flex items-baseline justify-between border-t border-tpl-ink/15 pt-3">
          <dt className="font-semibold">Total</dt>
          <dd className="text-2xl font-semibold tabular-nums tracking-[-0.02em]">
            {rm(totals.total)}
          </dd>
        </div>
      </dl>
      <p className="mt-4 flex items-center gap-2 text-sm">
        {(() => {
          const Icon = DELIVERY_ICONS[form.deliveryId];
          return <Icon size={16} />;
        })()}
        {pickup
          ? 'Ready to collect today'
          : `Arrives by ${arrivalDate(form.deliveryId, today)}`}
      </p>
    </div>
  );

  const summaryAddress = pickup ? (
    'Self-pickup at our studio'
  ) : (
    <>
      {form.address1}
      {form.address2 ? `, ${form.address2}` : ''}, {form.postcode} {form.city},{' '}
      {form.state}
    </>
  );

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_25rem] lg:gap-14">
      <div>
        <details className="group mb-6 lg:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between rounded-2xl bg-tpl-surface px-5 py-4 text-sm font-medium [&::-webkit-details-marker]:hidden">
            <span className="flex items-center gap-1.5">
              Order summary
              <ChevronDown
                size={16}
                aria-hidden="true"
                className="transition-transform group-open:rotate-180"
              />
            </span>
            <span className="text-lg tabular-nums">{rm(totals.total)}</span>
          </summary>
          <div className="mt-2">{receipt('top')}</div>
        </details>

        <div className="mb-6 flex items-center justify-between gap-4">
          <p className="text-sm text-tpl-muted">
            Three short steps. Your details stay in this browser.
          </p>
          <button
            type="button"
            onClick={() => {
              setForm((prev) => ({ ...prev, ...DEMO_DETAILS }));
              setErrors({});
              setStep('payment');
            }}
            className="shrink-0 rounded-full bg-tpl-surface px-4 py-2 text-xs font-medium transition-colors hover:bg-tpl-tint"
          >
            Fill demo details
          </button>
        </div>

        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
          className="space-y-4"
        >
          <StepCard
            number={1}
            title="Contact"
            state={stateOf('contact')}
            onEdit={() => setStep('contact')}
            summary={
              <>
                {form.name}
                <br />
                {form.email}, {form.phone}
              </>
            }
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                id="name"
                label="Full name"
                autoComplete="name"
                value={form.name}
                onChange={(event) => set('name', event.target.value)}
                error={errors.name}
                className="sm:col-span-2"
              />
              <Field
                id="email"
                label="Email for your receipt"
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
            <button
              type="button"
              onClick={() => advance(contactErrors(form), 'delivery')}
              className="mt-6 h-12 w-full rounded-full bg-tpl-ink text-sm font-medium text-tpl-surface sm:w-auto sm:px-8"
            >
              Continue to delivery
            </button>
          </StepCard>

          <StepCard
            number={2}
            title="Delivery"
            state={stateOf('delivery')}
            onEdit={() => setStep('delivery')}
            summary={
              <>
                {DELIVERY.find((item) => item.id === form.deliveryId)?.label},{' '}
                {totals.delivery ? rm(totals.delivery) : 'free'}
                <br />
                {summaryAddress}
              </>
            }
          >
            <fieldset>
              <legend className="sr-only">Delivery option</legend>
              <div className="grid gap-3 sm:grid-cols-3">
                {DELIVERY.map((option) => {
                  const Icon = DELIVERY_ICONS[option.id];
                  const selected = form.deliveryId === option.id;
                  const fee = deliveryFee(option.id, totals.subtotal);
                  return (
                    <label
                      key={option.id}
                      className={`relative flex cursor-pointer flex-col rounded-2xl border p-4 transition-colors has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-tpl-accent/25 ${
                        selected
                          ? 'border-tpl-ink bg-tpl-tint'
                          : 'border-tpl-line hover:border-tpl-ink/40'
                      }`}
                    >
                      <input
                        type="radio"
                        name="delivery"
                        checked={selected}
                        onChange={() => set('deliveryId', option.id)}
                        className="sr-only"
                      />
                      <span className="flex items-center justify-between">
                        <Icon size={18} />
                        <span className="text-sm font-medium tabular-nums">
                          {fee ? rm(fee) : 'Free'}
                        </span>
                      </span>
                      <span className="mt-4 text-sm font-medium">
                        {option.label}
                      </span>
                      <span className="mt-1 text-xs leading-relaxed text-tpl-muted">
                        {option.note}
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
            {!pickup && (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Field
                  id="address1"
                  label="Street address"
                  autoComplete="address-line1"
                  value={form.address1}
                  onChange={(event) => set('address1', event.target.value)}
                  error={errors.address1}
                  className="sm:col-span-2"
                />
                <Field
                  id="address2"
                  label="Area or building (optional)"
                  autoComplete="address-line2"
                  value={form.address2}
                  onChange={(event) => set('address2', event.target.value)}
                  className="sm:col-span-2"
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
                <div className="sm:col-span-2">
                  <label htmlFor="co-state" className="text-sm">
                    State
                  </label>
                  <select
                    id="co-state"
                    value={form.state}
                    onChange={(event) => set('state', event.target.value)}
                    aria-invalid={Boolean(errors.state)}
                    className={`mt-1.5 ${INPUT} ${errors.state ? 'border-red-500' : 'border-tpl-line'}`}
                  >
                    <option value="">Choose a state</option>
                    {MY_STATES.map((state) => (
                      <option key={state}>{state}</option>
                    ))}
                  </select>
                  {errors.state && (
                    <p className="mt-1.5 text-xs text-red-600">
                      {errors.state}
                    </p>
                  )}
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={() => advance(deliveryErrors(form), 'payment')}
              className="mt-6 h-12 w-full rounded-full bg-tpl-ink text-sm font-medium text-tpl-surface sm:w-auto sm:px-8"
            >
              Continue to payment
            </button>
          </StepCard>

          <StepCard
            number={3}
            title="Payment"
            state={stateOf('payment')}
            onEdit={() => setStep('payment')}
            summary={null}
          >
            <fieldset>
              <legend className="sr-only">Payment method</legend>
              <div className="grid grid-cols-2 gap-3">
                {PAY_METHODS.map((method) => {
                  const Icon = PAY_ICONS[method.id];
                  const selected = form.method === method.id;
                  return (
                    <label
                      key={method.id}
                      className={`relative flex cursor-pointer flex-col rounded-2xl border p-4 transition-colors has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-tpl-accent/25 ${
                        selected
                          ? 'border-tpl-ink bg-tpl-tint'
                          : 'border-tpl-line hover:border-tpl-ink/40'
                      }`}
                    >
                      <input
                        type="radio"
                        name="method"
                        checked={selected}
                        onChange={() => set('method', method.id)}
                        className="sr-only"
                      />
                      <span className="flex items-center justify-between">
                        <Icon size={20} />
                        <span
                          aria-hidden="true"
                          className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                            selected ? 'border-tpl-ink' : 'border-tpl-line'
                          }`}
                        >
                          {selected && (
                            <span className="h-2.5 w-2.5 rounded-full bg-tpl-ink" />
                          )}
                        </span>
                      </span>
                      <span className="mt-4 text-sm font-medium">
                        {method.id === 'cod' && pickup
                          ? 'Pay at pickup'
                          : method.label}
                      </span>
                      <span className="mt-1 text-xs leading-relaxed text-tpl-muted">
                        {method.id === 'cod' && pickup
                          ? 'Cash or DuitNow at the counter'
                          : method.note}
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            {stockError && (
              <p role="alert" className="mt-5 text-sm text-red-600">
                {stockError}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-tpl-accent text-base font-medium text-tpl-on-accent transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              <Lock size={16} aria-hidden="true" />
              {cod
                ? `Place order, ${rm(totals.total)}`
                : `Pay ${rm(totals.total)}`}
            </button>
            <p className="mt-3 text-center text-xs text-tpl-muted">
              {cod
                ? 'Your order is confirmed straight away. Pay when it arrives.'
                : 'Next, approve the payment on DemoPay, a simulated payment page.'}
            </p>
          </StepCard>
        </form>
      </div>

      <aside className="hidden lg:sticky lg:top-36 lg:block lg:self-start">
        {receipt('side')}
      </aside>
    </div>
  );
}

export default function Checkout() {
  const hydrated = useHydrated();
  const details = useStore((state) => state.details);

  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 pt-8 md:px-10">
      <DemoNotice>
        Demo checkout. No real payment is taken, and nothing you type leaves
        this browser.
      </DemoNotice>
      <h1 className="mb-6 mt-10 text-4xl font-semibold tracking-[-0.04em] md:text-5xl">
        Checkout
      </h1>
      {hydrated ? (
        <CheckoutForm initial={details} />
      ) : (
        <div className="h-96 animate-pulse rounded-[28px] bg-tpl-surface" />
      )}
    </div>
  );
}
