'use client';

import DemoPay from '@components/Templates/pay/DemoPay';
import { useBag } from '@components/Templates/Bag';
import { BASE_PATH, BRAND } from './data';
import { useOrders, useOrdersReady } from './orders';

export default function Pay({ orderId }: { orderId: string }) {
  const ready = useOrdersReady();
  const { clear } = useBag();
  const order = useOrders((state) =>
    state.orders.find((item) => item.id === orderId)
  );
  const markPaid = useOrders((state) => state.markPaid);
  const markFailed = useOrders((state) => state.markFailed);
  const retryPayment = useOrders((state) => state.retryPayment);

  return (
    <DemoPay
      brand={BRAND}
      basePath={BASE_PATH}
      hydrated={ready}
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
      onPaid={(id, detail) => {
        markPaid(id, detail);
        clear();
      }}
      onFailed={markFailed}
      onRetry={retryPayment}
    />
  );
}
