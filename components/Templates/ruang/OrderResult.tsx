'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail } from 'lucide-react';
import Photo from '@components/Templates/Photo';
import { rm } from '@components/Templates/Bag';
import {
  arrivalDate,
  BASE_PATH,
  BRAND,
  DELIVERY,
  FAIL_REASONS,
  PAY_METHODS,
  STUDIO,
  type FailReason,
} from './data';
import { useHydrated, useStore, type Order, type OrderStatus } from './store';
import { Logo } from './ui';

const STOPS: { status: OrderStatus; label: string }[] = [
  { status: 'paid', label: 'Confirmed' },
  { status: 'packed', label: 'Packed' },
  { status: 'shipped', label: 'On the way' },
  { status: 'delivered', label: 'Delivered' },
];

const stopIndex = (status: OrderStatus) =>
  status === 'cod_pending'
    ? 0
    : Math.max(
        0,
        STOPS.findIndex((stop) => stop.status === status)
      );

const NEXT_STEPS: Record<FailReason, string> = {
  declined: 'Try another card, or pay by FPX online banking instead.',
  insufficient_funds:
    'Top up the account, use another card, or pay by FPX or e-wallet.',
  bank_declined:
    'Approve the request in your bank app next time, or choose another bank.',
  bank_unavailable:
    'Pick another bank, or try again in a few minutes. Banks go offline for maintenance.',
  otp_failed: 'Ask your bank for a new code and type it exactly as sent.',
  qr_expired:
    'Open the payment again for a fresh QR code. Each one lasts five minutes.',
  wallet_declined:
    'Approve it in your e-wallet next time, or choose another way to pay.',
  cancelled: 'Your order is saved. Pay whenever you are ready.',
};

const PILL =
  'inline-flex h-12 items-center rounded-full px-6 text-sm font-medium transition-opacity hover:opacity-90';

/** The one animated moment: a stroke that draws itself. */
function Mark({ ok }: { ok: boolean }) {
  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden="true"
      className={`h-16 w-16 ${ok ? 'text-emerald-600' : 'text-red-600'}`}
    >
      <circle
        cx="32"
        cy="32"
        r="29"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        pathLength={1}
        strokeDasharray="1"
        className="animate-[tpl-draw_700ms_ease-out_both]"
      />
      <path
        d={ok ? 'M20 33 L28 41 L45 24' : 'M23 23 L41 41 M41 23 L23 41'}
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray="1"
        className="animate-[tpl-draw_450ms_ease-out_550ms_both]"
      />
    </svg>
  );
}

function Receipt({ order, children }: { order: Order; children?: ReactNode }) {
  const delivery = DELIVERY.find(
    (item) => item.id === order.details.deliveryId
  );
  return (
    <div className="relative rounded-[28px] bg-tpl-surface px-6 pb-6 pt-6">
      <div className="flex items-center justify-between">
        <Logo />
        <p className="text-xs tabular-nums text-tpl-muted">
          {new Date(order.createdAt).toLocaleString('en-MY', {
            day: 'numeric',
            month: 'short',
            hour: 'numeric',
            minute: '2-digit',
          })}
        </p>
      </div>
      <p className="mt-1 text-sm tabular-nums text-tpl-muted">
        Order {order.id}
      </p>
      <ul className="mt-5 space-y-4">
        {order.lines.map((line) => (
          <li key={line.key} className="flex items-center gap-3">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[14px] bg-tpl-tint">
              <Photo
                src={line.image}
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
                {line.name}
              </p>
              {line.variant && (
                <p className="text-xs text-tpl-muted">{line.variant}</p>
              )}
            </div>
            <p className="text-sm tabular-nums">{rm(line.unit * line.qty)}</p>
          </li>
        ))}
      </ul>
      <dl className="mt-5 space-y-2 border-t border-dashed border-tpl-ink/20 pt-5 text-sm">
        <div className="flex justify-between">
          <dt className="text-tpl-muted">Subtotal</dt>
          <dd className="tabular-nums">{rm(order.subtotal)}</dd>
        </div>
        {order.discount > 0 && (
          <div className="flex justify-between">
            <dt className="text-tpl-muted">Discount</dt>
            <dd className="tabular-nums">−{rm(order.discount)}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-tpl-muted">{delivery?.label}</dt>
          <dd className="tabular-nums">
            {order.delivery ? rm(order.delivery) : 'Free'}
          </dd>
        </div>
        <div className="flex items-baseline justify-between border-t border-tpl-ink/15 pt-3">
          <dt className="font-semibold">Total</dt>
          <dd className="text-2xl font-semibold tabular-nums tracking-[-0.02em]">
            {rm(order.total)}
          </dd>
        </div>
      </dl>
      {children}
    </div>
  );
}

function Success({ order }: { order: Order }) {
  const cod = order.details.method === 'cod';
  const pickup = order.details.deliveryId === 'pickup';
  const current = stopIndex(order.status);
  const firstName = order.details.name.split(' ')[0];
  const eta = arrivalDate(order.details.deliveryId, order.createdAt);

  return (
    <div className="grid gap-14 lg:grid-cols-[1fr_25rem] lg:gap-16">
      <div>
        <Mark ok />
        <h1 className="mt-8 text-[clamp(2.6rem,6vw,4.6rem)] font-semibold leading-[0.95] tracking-[-0.045em]">
          Thank you, {firstName}.
        </h1>
        <p className="mt-4 max-w-lg text-lg text-tpl-muted">
          {cod
            ? `Your order is placed. Pay ${rm(order.total)} ${pickup ? 'when you collect it' : 'to the rider'}.`
            : 'Your payment went through and your order is confirmed.'}
        </p>

        <div className="mt-12 rounded-[28px] bg-tpl-surface p-6 md:p-8">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-semibold tracking-[-0.01em]">
              {pickup
                ? 'Ready to collect'
                : order.status === 'delivered'
                  ? 'Delivered'
                  : `Arrives by ${eta}`}
            </p>
            {order.tracking && (
              <p className="text-sm tabular-nums text-tpl-muted">
                Tracking {order.tracking}
              </p>
            )}
          </div>
          <ol aria-label="Order progress" className="mt-8 grid grid-cols-4">
            {STOPS.map((stop, index) => {
              const reached = index <= current;
              return (
                <li key={stop.status} className="relative">
                  <span
                    aria-hidden="true"
                    className={`absolute left-3 right-0 top-[11px] h-0.5 ${
                      index === STOPS.length - 1
                        ? 'hidden'
                        : index < current
                          ? 'bg-tpl-accent'
                          : 'bg-tpl-line'
                    }`}
                  />
                  <span
                    aria-hidden="true"
                    className={`relative flex h-6 w-6 items-center justify-center rounded-full ${
                      reached
                        ? 'bg-tpl-accent'
                        : 'border-2 border-tpl-line bg-tpl-surface'
                    }`}
                  >
                    {index === current && (
                      <span className="absolute h-6 w-6 animate-ping rounded-full bg-tpl-accent/40 motion-reduce:animate-none" />
                    )}
                    {reached && (
                      <span className="h-2 w-2 rounded-full bg-tpl-on-accent" />
                    )}
                  </span>
                  <span
                    className={`mt-3 block pr-2 text-xs sm:text-sm ${reached ? '' : 'text-tpl-muted'}`}
                  >
                    {stop.label}
                  </span>
                </li>
              );
            })}
          </ol>
          <p className="mt-8 text-sm text-tpl-muted">
            This moves along as the shop packs and ships your order. Try it
            yourself in the{' '}
            <Link
              href={`${BASE_PATH}/admin`}
              className="font-medium text-tpl-ink underline underline-offset-4"
            >
              Admin portal
            </Link>
            .
          </p>
        </div>

        <div className="mt-10 grid gap-8 text-sm sm:grid-cols-2">
          <div>
            <h2 className="font-semibold">
              {pickup ? 'Collect from' : 'Delivering to'}
            </h2>
            <p className="mt-2 leading-relaxed text-tpl-muted">
              {order.details.name}
              <br />
              {pickup ? (
                STUDIO
              ) : (
                <>
                  {order.details.address1}
                  {order.details.address2 && (
                    <>
                      <br />
                      {order.details.address2}
                    </>
                  )}
                  <br />
                  {order.details.postcode} {order.details.city},{' '}
                  {order.details.state}
                </>
              )}
            </p>
          </div>
          <div>
            <h2 className="font-semibold">Payment</h2>
            <p className="mt-2 leading-relaxed text-tpl-muted">
              {cod
                ? pickup
                  ? 'Pay at pickup'
                  : 'Cash on delivery'
                : order.payment.detail}
              {order.payment.ref && (
                <>
                  <br />
                  Reference{' '}
                  <span className="tabular-nums text-tpl-ink">
                    {order.payment.ref}
                  </span>
                </>
              )}
            </p>
          </div>
        </div>

        <section className="mt-12">
          <h2 className="flex items-center gap-2 font-semibold">
            <Mail size={17} aria-hidden="true" />
            The email your customer gets
          </h2>
          <p className="mt-1 text-sm text-tpl-muted">
            In a live store this goes to {order.details.email}. The demo does
            not send email.
          </p>
          <div className="mt-5 overflow-hidden rounded-2xl bg-white text-[#1D1D1B] shadow-sm ring-1 ring-black/10">
            <div className="border-b border-black/10 px-5 py-3 text-xs text-black/50">
              <p>
                From <strong className="text-[#1D1D1B]">{BRAND}</strong>{' '}
                &lt;hello@ruang.demo&gt;
              </p>
              <p className="mt-0.5">
                Subject{' '}
                <strong className="text-[#1D1D1B]">
                  Your order {order.id} is confirmed
                </strong>
              </p>
            </div>
            <div className="px-5 py-5 text-sm leading-relaxed">
              <p>Hi {firstName},</p>
              <p className="mt-3">
                Thank you for your order. We are wrapping everything for the
                journey and will send the tracking number once it leaves the
                studio.
              </p>
              <p className="mt-3 font-semibold">
                {cod ? 'To pay on delivery' : 'Paid'}: {rm(order.total)}
              </p>
            </div>
          </div>
        </section>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href={`${BASE_PATH}/shop`}
            className={`bg-tpl-accent text-tpl-on-accent ${PILL}`}
          >
            Continue shopping
          </Link>
          <Link
            href={`${BASE_PATH}/admin`}
            className={`border border-tpl-ink ${PILL} hover:bg-tpl-ink hover:text-tpl-surface`}
          >
            See it in the Admin portal
          </Link>
        </div>
      </div>

      <aside className="lg:sticky lg:top-36 lg:self-start">
        <Receipt order={order} />
      </aside>
    </div>
  );
}

function Failed({ order }: { order: Order }) {
  const router = useRouter();
  const retryPayment = useStore((state) => state.retryPayment);
  const method = PAY_METHODS.find((item) => item.id === order.details.method);
  const reason = order.payment.reason;

  return (
    <div className="grid gap-14 lg:grid-cols-[1fr_25rem] lg:gap-16">
      <div>
        <Mark ok={false} />
        <h1 className="mt-8 text-[clamp(2.6rem,6vw,4.6rem)] font-semibold leading-[0.95] tracking-[-0.045em]">
          Payment failed
        </h1>
        <p className="mt-4 max-w-lg text-lg">
          {reason ? FAIL_REASONS[reason] : 'The payment did not go through.'}
        </p>
        <div className="mt-8 max-w-lg rounded-[28px] bg-tpl-surface p-6">
          <p className="font-semibold">What you can do</p>
          <p className="mt-2 text-tpl-muted">
            {reason
              ? NEXT_STEPS[reason]
              : 'Try again, or choose another way to pay.'}
          </p>
          <p className="mt-4 text-sm text-tpl-muted">
            Nothing was charged and your bag is saved. Order{' '}
            <span className="tabular-nums text-tpl-ink">{order.id}</span> is
            waiting for {rm(order.total)}.
          </p>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              retryPayment(order.id);
              router.push(`${BASE_PATH}/pay?order=${order.id}`);
            }}
            className={`bg-tpl-accent text-tpl-on-accent ${PILL}`}
          >
            Try again with {method?.label.split(' (')[0].toLowerCase()}
          </button>
          <Link
            href={`${BASE_PATH}/checkout`}
            className={`border border-tpl-ink ${PILL} hover:bg-tpl-ink hover:text-tpl-surface`}
          >
            Change payment method
          </Link>
        </div>
        <p className="mt-10 text-sm text-tpl-muted">
          Failed payments show up in the{' '}
          <Link
            href={`${BASE_PATH}/admin`}
            className="font-medium text-tpl-ink underline underline-offset-4"
          >
            Admin portal
          </Link>{' '}
          so the shop can follow up.
        </p>
      </div>
      <aside className="lg:sticky lg:top-36 lg:self-start">
        <Receipt order={order}>
          <p className="mt-4 rounded-lg bg-red-600/10 px-3 py-2 text-center text-xs font-medium text-red-700">
            Not paid
          </p>
        </Receipt>
      </aside>
    </div>
  );
}

function Plain({
  title,
  text,
  children,
}: {
  title: string;
  text: string;
  children?: ReactNode;
}) {
  return (
    <div className="py-16">
      <h1 className="text-4xl font-semibold tracking-[-0.04em]">{title}</h1>
      <p className="mt-3 text-tpl-muted">{text}</p>
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}

export default function OrderResult({ id }: { id: string }) {
  const hydrated = useHydrated();
  const order = useStore((state) =>
    state.orders.find((item) => item.id === id)
  );

  let body;
  if (!hydrated)
    body = <div className="h-96 animate-pulse rounded-[28px] bg-tpl-surface" />;
  else if (!order)
    body = (
      <Plain
        title="Order not found"
        text="Demo orders stay in the browser they were made in."
      >
        <Link
          href={`${BASE_PATH}/shop`}
          className={`bg-tpl-accent text-tpl-on-accent ${PILL}`}
        >
          Browse the shop
        </Link>
      </Plain>
    );
  else if (order.status === 'payment_failed') body = <Failed order={order} />;
  else if (order.status === 'pending_payment')
    body = (
      <Plain
        title="Waiting for payment"
        text={`Order ${order.id} has not been paid yet.`}
      >
        <Link
          href={`${BASE_PATH}/pay?order=${order.id}`}
          className={`bg-tpl-accent text-tpl-on-accent ${PILL}`}
        >
          Continue to payment
        </Link>
      </Plain>
    );
  else if (order.status === 'cancelled')
    body = (
      <Plain
        title="Order cancelled"
        text={`Order ${order.id} was cancelled by the shop.`}
      />
    );
  else body = <Success order={order} />;

  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 pt-12 md:px-10 md:pt-16">
      {body}
    </div>
  );
}
