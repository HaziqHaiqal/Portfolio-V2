'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { rm } from '@components/Templates/Bag';
import {
  FAIL_REASONS,
  NEXT_STEPS,
  PAY_METHODS,
} from '@components/Templates/pay/data';
import { arrivalDate, BASE_PATH, SHOP_ADDRESS } from './data';
import { useOrders, useOrdersReady, type Order } from './orders';
import { Summary } from './Checkout';

function Mark({ ok }: { ok: boolean }) {
  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden="true"
      className={`gaya-done-mark ${ok ? '' : 'is-fail'}`}
    >
      <circle
        cx="32"
        cy="32"
        r="29"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        pathLength={1}
        strokeDasharray="1"
        className="animate-[tpl-draw_700ms_ease-out_both]"
      />
      <path
        d={ok ? 'M20 33 L28 41 L45 24' : 'M23 23 L41 41 M41 23 L23 41'}
        fill="none"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray="1"
        className="animate-[tpl-draw_450ms_ease-out_550ms_both]"
      />
    </svg>
  );
}

function Layout({ order, children }: { order: Order; children: ReactNode }) {
  return (
    <div className="gaya-co-grid">
      <div className="gaya-done">{children}</div>
      <aside>
        <Summary
          lines={order.lines}
          subtotal={order.subtotal}
          delivery={order.delivery}
          total={order.total}
          deliveryId={order.details.deliveryId}
          from={order.createdAt}
          action={<span className="gaya-sum-id">{order.id}</span>}
          eta={false}
        />
      </aside>
    </div>
  );
}

function Success({ order }: { order: Order }) {
  const { details, payment } = order;
  const cod = details.method === 'cod';
  const pickup = details.deliveryId === 'pickup';

  return (
    <Layout order={order}>
      <Mark ok />
      <h1>Thank you, {details.name.split(' ')[0]}.</h1>
      <p className="gaya-done-lead">
        {cod
          ? `Your order is placed. Pay ${rm(order.total)} ${pickup ? 'when you collect it' : 'to the rider'}.`
          : 'Your payment went through and your order is confirmed.'}
      </p>
      <dl className="gaya-done-rows">
        <div>
          <dt>Order</dt>
          <dd>{order.id}</dd>
        </div>
        <div>
          <dt>{pickup ? 'Collect' : 'Arrives'}</dt>
          <dd>
            {pickup
              ? 'Ready today, 11am to 9pm'
              : `By ${arrivalDate(details.deliveryId, order.createdAt)}`}
          </dd>
        </div>
        <div>
          <dt>{pickup ? 'From' : 'To'}</dt>
          <dd>
            {pickup ? (
              SHOP_ADDRESS
            ) : (
              <>
                {details.name}, {details.address1}
                {details.address2 ? `, ${details.address2}` : ''},{' '}
                {details.postcode} {details.city}, {details.state}
              </>
            )}
          </dd>
        </div>
        <div>
          <dt>Payment</dt>
          <dd>
            {cod
              ? pickup
                ? 'Pay at the shop'
                : 'Cash on delivery'
              : payment.detail}
            {payment.ref && <small>Reference {payment.ref}</small>}
          </dd>
        </div>
        <div>
          <dt>Receipt</dt>
          <dd>Sent to {details.email}. The demo does not send email.</dd>
        </div>
      </dl>
      <Link href={BASE_PATH} className="gaya-btn gaya-done-btn">
        Continue shopping
      </Link>
    </Layout>
  );
}

function Failed({ order }: { order: Order }) {
  const router = useRouter();
  const retryPayment = useOrders((state) => state.retryPayment);
  const method = PAY_METHODS.find((item) => item.id === order.details.method);
  const reason = order.payment.reason;

  return (
    <Layout order={order}>
      <Mark ok={false} />
      <h1>Payment failed</h1>
      <p className="gaya-done-lead">
        {reason ? FAIL_REASONS[reason] : 'The payment did not go through.'}
      </p>
      <dl className="gaya-done-rows">
        <div>
          <dt>Next</dt>
          <dd>
            {reason
              ? NEXT_STEPS[reason]
              : 'Try again, or choose another way to pay.'}
          </dd>
        </div>
        <div>
          <dt>Order</dt>
          <dd>
            {order.id} is waiting for {rm(order.total)}. Nothing was charged
            and your bag is saved.
          </dd>
        </div>
      </dl>
      <div className="gaya-done-actions">
        <button
          type="button"
          onClick={() => {
            retryPayment(order.id);
            router.push(`${BASE_PATH}/pay?order=${order.id}`);
          }}
          className="gaya-btn gaya-done-btn"
        >
          Try again with {method?.label.split(' (')[0].toLowerCase()}
        </button>
        <Link href={`${BASE_PATH}/checkout`} className="gaya-done-alt">
          Change payment method
        </Link>
      </div>
    </Layout>
  );
}

function Plain({
  title,
  text,
  children,
}: {
  title: string;
  text: string;
  children: ReactNode;
}) {
  return (
    <div className="gaya-done is-plain">
      <h1>{title}</h1>
      <p className="gaya-done-lead">{text}</p>
      {children}
    </div>
  );
}

export default function OrderResult({ id }: { id: string }) {
  const ready = useOrdersReady();
  const order = useOrders((state) =>
    state.orders.find((item) => item.id === id)
  );

  let body;
  if (!ready) body = <div className="gaya-co-wait" />;
  else if (!order)
    body = (
      <Plain
        title="Order not found"
        text="Demo orders stay in the browser they were made in."
      >
        <Link href={BASE_PATH} className="gaya-btn gaya-done-btn">
          Back to the shop
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
          className="gaya-btn gaya-done-btn"
        >
          Continue to payment
        </Link>
      </Plain>
    );
  else body = <Success order={order} />;

  return <section className="gaya-co is-done">{body}</section>;
}
