'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
  deliveryFee,
  DISCOUNT,
  lineKey,
  productBySlug,
  startingStock,
  unitPrice,
  type DeliveryId,
  type FailReason,
  type PayMethod,
} from './data';

export interface CartLine {
  key: string;
  slug: string;
  values: string[];
  qty: number;
}

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
  | 'cod_pending'
  | 'packed'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface OrderLine {
  key: string;
  slug: string;
  name: string;
  variant: string;
  image: string;
  unit: number;
  qty: number;
}

export interface Order {
  id: string;
  createdAt: number;
  lines: OrderLine[];
  subtotal: number;
  discount: number;
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
  tracking?: string;
  history: { at: number; status: OrderStatus; note?: string }[];
}

export interface Totals {
  subtotal: number;
  discount: number;
  delivery: number;
  total: number;
}

/** Cart lines with their product, dropping any that no longer exist. */
export function resolveLines(cart: CartLine[]) {
  return cart.flatMap((line) => {
    const product = productBySlug(line.slug);
    return product
      ? [{ ...line, product, unit: unitPrice(product, line.values) }]
      : [];
  });
}

export function totalsFor(
  cart: CartLine[],
  deliveryId: DeliveryId,
  code: string | null
): Totals {
  const subtotal = resolveLines(cart).reduce(
    (sum, line) => sum + line.unit * line.qty,
    0
  );
  const discount =
    code === DISCOUNT.code && subtotal >= DISCOUNT.minSpend
      ? DISCOUNT.amount
      : 0;
  const delivery = subtotal ? deliveryFee(deliveryId, subtotal) : 0;
  return {
    subtotal,
    discount,
    delivery,
    total: subtotal - discount + delivery,
  };
}

const digits = (length: number) =>
  Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');

interface StoreState {
  cart: CartLine[];
  orders: Order[];
  sold: Record<string, number>;
  details: Details | null;
  /** Wishlist, by product slug. */
  saved: string[];
  cartOpen: boolean;
  added: { slug: string; values: string[]; at: number } | null;
  addToCart: (slug: string, values: string[], qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  setCartOpen: (open: boolean) => void;
  dismissAdded: () => void;
  toggleSaved: (slug: string) => void;
  placeOrder: (details: Details, code: string | null) => Order;
  retryPayment: (id: string) => void;
  markPaid: (id: string, detail: string) => void;
  markFailed: (id: string, reason: FailReason, detail?: string) => void;
  advance: (id: string) => void;
  cancel: (id: string) => void;
  reset: () => void;
}

const stamp = (order: Order, status: OrderStatus, note?: string): Order => ({
  ...order,
  status,
  history: [...order.history, { at: Date.now(), status, note }],
});

const takeStock = (sold: Record<string, number>, order: Order, sign = 1) => {
  const next = { ...sold };
  for (const line of order.lines)
    next[line.key] = Math.max(0, (next[line.key] ?? 0) + sign * line.qty);
  return next;
};

export const useStore = create<StoreState>()(
  persist(
    (set, get) => {
      const update = (id: string, change: (order: Order) => Order) =>
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === id ? change(order) : order
          ),
        }));

      return {
        cart: [],
        orders: [],
        sold: {},
        details: null,
        saved: [],
        cartOpen: false,
        added: null,

        addToCart: (slug, values, qty = 1) => {
          const key = lineKey(slug, values);
          set((state) => ({
            cart: state.cart.some((line) => line.key === key)
              ? state.cart.map((line) =>
                  line.key === key ? { ...line, qty: line.qty + qty } : line
                )
              : [...state.cart, { key, slug, values, qty }],
            added: { slug, values, at: Date.now() },
          }));
        },

        setQty: (key, qty) =>
          set((state) => ({
            cart:
              qty > 0
                ? state.cart.map((line) =>
                    line.key === key ? { ...line, qty } : line
                  )
                : state.cart.filter((line) => line.key !== key),
          })),

        setCartOpen: (cartOpen) => set({ cartOpen, added: null }),
        dismissAdded: () => set({ added: null }),
        toggleSaved: (slug) =>
          set((state) => ({
            saved: state.saved.includes(slug)
              ? state.saved.filter((item) => item !== slug)
              : [...state.saved, slug],
          })),

        placeOrder: (details, code) => {
          const { cart } = get();
          const totals = totalsFor(cart, details.deliveryId, code);
          const cod = details.method === 'cod';
          const order: Order = {
            id: `RG-${digits(5)}`,
            createdAt: Date.now(),
            lines: resolveLines(cart).map((line) => ({
              key: line.key,
              slug: line.slug,
              name: line.product.name,
              variant: line.values.join(', '),
              image: line.product.images[0],
              unit: line.unit,
              qty: line.qty,
            })),
            ...totals,
            details,
            status: cod ? 'cod_pending' : 'pending_payment',
            payment: { attempts: cod ? 0 : 1 },
            history: [
              {
                at: Date.now(),
                status: cod ? 'cod_pending' : 'pending_payment',
              },
            ],
          };
          set((state) => ({
            orders: [order, ...state.orders],
            details,
            ...(cod ? { cart: [], sold: takeStock(state.sold, order) } : {}),
          }));
          return order;
        },

        retryPayment: (id) =>
          update(id, (order) =>
            order.status === 'payment_failed'
              ? {
                  ...stamp(order, 'pending_payment', 'Payment retried'),
                  payment: {
                    attempts: order.payment.attempts + 1,
                  },
                }
              : order
          ),

        markPaid: (id, detail) => {
          const order = get().orders.find((item) => item.id === id);
          if (!order || order.status !== 'pending_payment') return;
          set((state) => ({
            cart: [],
            sold: takeStock(state.sold, order),
          }));
          update(id, (current) => ({
            ...stamp(current, 'paid', detail),
            payment: {
              ...current.payment,
              detail,
              ref: `DP${digits(10)}`,
              reason: undefined,
            },
          }));
        },

        markFailed: (id, reason, detail) =>
          update(id, (order) =>
            order.status === 'pending_payment'
              ? {
                  ...stamp(order, 'payment_failed', detail),
                  payment: { ...order.payment, detail, reason },
                }
              : order
          ),

        advance: (id) =>
          update(id, (order) => {
            if (order.status === 'paid' || order.status === 'cod_pending')
              return stamp(order, 'packed');
            if (order.status === 'packed')
              return {
                ...stamp(order, 'shipped'),
                tracking: `DX${digits(9)}MY`,
              };
            if (order.status === 'shipped')
              return stamp(
                order,
                'delivered',
                order.details.method === 'cod' ? 'Cash collected' : undefined
              );
            return order;
          }),

        cancel: (id) => {
          const order = get().orders.find((item) => item.id === id);
          if (!order) return;
          if (order.status === 'cod_pending')
            set((state) => ({ sold: takeStock(state.sold, order, -1) }));
          update(id, (current) => stamp(current, 'cancelled'));
        },

        reset: () =>
          set({ cart: [], orders: [], sold: {}, details: null, added: null }),
      };
    },
    {
      name: 'ruang-demo',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: ({ cart, orders, sold, details, saved }) => ({
        cart,
        orders,
        sold,
        details,
        saved,
      }),
    }
  )
);

/** Loads the saved cart and orders once on the client, after hydration. */
export function StoreHydrator() {
  useEffect(() => {
    void useStore.persist.rehydrate();
  }, []);
  return null;
}

const subscribeNever = () => () => {};
const startOfToday = () => new Date().setHours(0, 0, 0, 0);

/** Midnight today on the client, for delivery estimates; 0 on the server. */
export function useToday() {
  return useSyncExternalStore(subscribeNever, startOfToday, () => 0);
}

/** False until the saved cart and orders are loaded from this browser. */
export function useHydrated() {
  return useSyncExternalStore(
    (onChange) => useStore.persist.onFinishHydration(onChange),
    () => useStore.persist.hasHydrated(),
    () => false
  );
}

export function useAvailable(key: string) {
  const sold = useStore((state) => state.sold[key] ?? 0);
  return Math.max(0, startingStock(key) - sold);
}

export const availableFrom = (sold: Record<string, number>, key: string) =>
  Math.max(0, startingStock(key) - (sold[key] ?? 0));

export const cartCount = (cart: CartLine[]) =>
  cart.reduce((sum, line) => sum + line.qty, 0);
