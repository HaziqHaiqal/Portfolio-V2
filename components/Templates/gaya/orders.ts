'use client';

import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { BagLine } from '@components/Templates/Bag';
import {
  digits,
  type FailReason,
  type PayMethod,
} from '@components/Templates/pay/data';
import { deliveryFee, startingStock, type DeliveryId } from './data';

export interface Details {
  name: string;
  email: string;
  phone: string;
  address1: string;
  address2: string;
  postcode: string;
  city: string;
  state: string;
  deliveryId: DeliveryId;
  method: PayMethod;
}

export type OrderStatus =
  | 'pending_payment'
  | 'paid'
  | 'payment_failed'
  | 'cod_pending';

export interface OrderLine {
  key: string;
  name: string;
  variant?: string;
  image: string;
  fit?: 'contain';
  unit: number;
  qty: number;
}

export interface Order {
  id: string;
  createdAt: number;
  lines: OrderLine[];
  subtotal: number;
  delivery: number;
  total: number;
  details: Details;
  status: OrderStatus;
  payment: {
    attempts: number;
    detail?: string;
    ref?: string;
    reason?: FailReason;
  };
}

export function totalsFor(lines: BagLine[], deliveryId: DeliveryId) {
  const subtotal = lines.reduce(
    (sum, line) => sum + line.qty * line.product.price,
    0
  );
  const delivery = subtotal ? deliveryFee(deliveryId, subtotal) : 0;
  return { subtotal, delivery, total: subtotal + delivery };
}

interface OrderState {
  orders: Order[];
  details: Details | null;
  placeOrder: (lines: BagLine[], details: Details) => Order;
  retryPayment: (id: string) => void;
  markPaid: (id: string, detail: string) => void;
  markFailed: (id: string, reason: FailReason, detail?: string) => void;
}

export const useOrders = create<OrderState>()(
  persist(
    (set) => {
      const update = (id: string, change: (order: Order) => Order) =>
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === id ? change(order) : order
          ),
        }));

      return {
        orders: [],
        details: null,

        placeOrder: (lines, details) => {
          const cod = details.method === 'cod';
          const order: Order = {
            id: `GY-${digits(5)}`,
            createdAt: Date.now(),
            lines: lines.map((line) => ({
              key: line.key,
              name: line.product.name,
              variant: line.variant,
              image: line.product.image,
              fit: line.product.fit,
              unit: line.product.price,
              qty: line.qty,
            })),
            ...totalsFor(lines, details.deliveryId),
            details,
            status: cod ? 'cod_pending' : 'pending_payment',
            payment: { attempts: cod ? 0 : 1 },
          };
          set((state) => ({ orders: [order, ...state.orders], details }));
          return order;
        },

        retryPayment: (id) =>
          update(id, (order) =>
            order.status === 'payment_failed'
              ? {
                  ...order,
                  status: 'pending_payment',
                  payment: { attempts: order.payment.attempts + 1 },
                }
              : order
          ),

        markPaid: (id, detail) =>
          update(id, (order) =>
            order.status === 'pending_payment'
              ? {
                  ...order,
                  status: 'paid',
                  payment: {
                    ...order.payment,
                    detail,
                    ref: `DP${digits(10)}`,
                    reason: undefined,
                  },
                }
              : order
          ),

        markFailed: (id, reason, detail) =>
          update(id, (order) =>
            order.status === 'pending_payment'
              ? {
                  ...order,
                  status: 'payment_failed',
                  payment: { ...order.payment, detail, reason },
                }
              : order
          ),
      };
    },
    {
      name: 'gaya-orders',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: ({ orders, details }) => ({ orders, details }),
    }
  )
);

export function OrdersHydrator() {
  useEffect(() => {
    void useOrders.persist.rehydrate();
  }, []);
  return null;
}

export function useOrdersReady() {
  return useSyncExternalStore(
    (onChange) => useOrders.persist.onFinishHydration(onChange),
    () => useOrders.persist.hasHydrated(),
    () => false
  );
}

const TAKES_STOCK: OrderStatus[] = ['paid', 'cod_pending'];

/** Units left of a bag line key, after this browser's confirmed orders. */
export function useStockLeft() {
  const orders = useOrders((state) => state.orders);
  return useMemo(() => {
    const sold: Record<string, number> = {};
    for (const order of orders)
      if (TAKES_STOCK.includes(order.status))
        for (const line of order.lines)
          sold[line.key] = (sold[line.key] ?? 0) + line.qty;
    return (key: string) => Math.max(0, startingStock(key) - (sold[key] ?? 0));
  }, [orders]);
}
