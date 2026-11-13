'use client';

import DemoPay from '@components/Templates/pay/DemoPay';
import { BASE_PATH, BRAND } from './data';
import { useHydrated, useStore } from './store';

export default function Gateway({ orderId }: { orderId: string }) {
  const hydrated = useHydrated();
  const order = useStore((state) =>
    state.orders.find((item) => item.id === orderId)
  );
  const markPaid = useStore((state) => state.markPaid);
  const markFailed = useStore((state) => state.markFailed);
  const retryPayment = useStore((state) => state.retryPayment);

  return (
    <DemoPay
      brand={BRAND}
      basePath={BASE_PATH}
      hydrated={hydrated}
      order={
        order && {
          id: order.id,
          total: order.total,
          status: order.status,
          method: order.details.method,
          name: order.details.name,
          phone: order.details.phone,
          attempts: order.payment.attempts,
        }
      }
      onPaid={markPaid}
      onFailed={markFailed}
      onRetry={retryPayment}
    />
  );
}
