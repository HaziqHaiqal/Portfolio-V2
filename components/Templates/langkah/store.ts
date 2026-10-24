'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
  colourway,
  deliveryFee,
  DISCOUNT,
  lineKey,
  productBySlug,
  startingStock,
  type DeliveryId,
  type PayMethod,
} from './data';

export interface CartLine {
  key: string;
  slug: string;
  colour: string;
  size: string;
  qty: number;
}

export interface Details {
  name: string;
  email: string;
  phone: string;
  address: string;
  postcode: string;
  city: string;
  deliveryId: DeliveryId;
  method: PayMethod;
}

export type OrderStatus = 'pending_payment' | 'paid' | 'payment_failed';

export interface OrderLine {
  key: string;
  slug: string;
  name: string;
  colour: string;
  size: string;
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
  ref?: string;
  reason?: string;
  shipped?: boolean;
}

export function resolveLines(cart: CartLine[]) {
  return cart.flatMap((line) => {
    const product = productBySlug(line.slug);
    return product ? [{ ...line, product, unit: product.price }] : [];
  });
}

export function totalsFor(
  cart: CartLine[],
  deliveryId: DeliveryId,
  code: string | null
) {
  const subtotal = resolveLines(cart).reduce(
    (sum, line) => sum + line.unit * line.qty,
    0
  );
  const discount =
    code?.toUpperCase() === DISCOUNT.code && subtotal >= DISCOUNT.minSpend
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
  saved: string[];
  cartOpen: boolean;
  added: { slug: string; colour: string; size: string; at: number } | null;
  addToCart: (slug: string, colour: string, size: string, qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  setCartOpen: (open: boolean) => void;
  dismissAdded: () => void;
  toggleSaved: (slug: string) => void;
  placeOrder: (details: Details, code: string | null) => Order;
  markPaid: (id: string) => void;
  markFailed: (id: string, reason: string) => void;
  retry: (id: string) => void;
  markShipped: (id: string) => void;
  reset: () => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      cart: [],
      orders: [],
      sold: {},
      saved: [],
      cartOpen: false,
      added: null,

      addToCart: (slug, colour, size, qty = 1) => {
        const key = lineKey(slug, colour, size);
        set((state) => ({
          cart: state.cart.some((line) => line.key === key)
            ? state.cart.map((line) =>
                line.key === key ? { ...line, qty: line.qty + qty } : line
              )
            : [...state.cart, { key, slug, colour, size, qty }],
          added: { slug, colour, size, at: Date.now() },
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
        const order: Order = {
          id: `LK-${digits(5)}`,
          createdAt: Date.now(),
          lines: resolveLines(cart).map((line) => ({
            key: line.key,
            slug: line.slug,
            name: line.product.name,
            colour: line.colour,
            size: line.size,
            image: colourway(line.colour).image,
            unit: line.unit,
            qty: line.qty,
          })),
          ...totalsFor(cart, details.deliveryId, code),
          details,
          status: 'pending_payment',
        };
        set((state) => ({ orders: [order, ...state.orders] }));
        return order;
      },

      markPaid: (id) => {
        const order = get().orders.find((item) => item.id === id);
        if (!order || order.status === 'paid') return;
        set((state) => {
          const sold = { ...state.sold };
          for (const line of order.lines)
            sold[line.key] = (sold[line.key] ?? 0) + line.qty;
          return {
            cart: [],
            sold,
            orders: state.orders.map((item) =>
              item.id === id
                ? {
                    ...item,
                    status: 'paid',
                    ref: `LKP${digits(9)}`,
                    reason: undefined,
                  }
                : item
            ),
          };
        });
      },

      markFailed: (id, reason) =>
        set((state) => ({
          orders: state.orders.map((item) =>
            item.id === id && item.status !== 'paid'
              ? { ...item, status: 'payment_failed', reason }
              : item
          ),
        })),

      retry: (id) =>
        set((state) => ({
          orders: state.orders.map((item) =>
            item.id === id && item.status === 'payment_failed'
              ? { ...item, status: 'pending_payment', reason: undefined }
              : item
          ),
        })),

      markShipped: (id) =>
        set((state) => ({
          orders: state.orders.map((item) =>
            item.id === id && item.status === 'paid'
              ? { ...item, shipped: true }
              : item
          ),
        })),

      reset: () => set({ cart: [], orders: [], sold: {}, saved: [] }),
    }),
    {
      name: 'langkah-demo',
      // Version 2 changed the colourways, so older saved bags start fresh.
      version: 2,
      migrate: () => ({ cart: [], orders: [], sold: {}, saved: [] }),
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: ({ cart, orders, sold, saved }) => ({
        cart,
        orders,
        sold,
        saved,
      }),
    }
  )
);

/** Loads the saved bag and orders once on the client, after hydration. */
export function StoreHydrator() {
  useEffect(() => {
    void useStore.persist.rehydrate();
  }, []);
  return null;
}

/** False until the saved bag and orders are loaded from this browser. */
export function useHydrated() {
  return useSyncExternalStore(
    (onChange) => useStore.persist.onFinishHydration(onChange),
    () => useStore.persist.hasHydrated(),
    () => false
  );
}

export const availableFrom = (sold: Record<string, number>, key: string) =>
  Math.max(0, startingStock(key) - (sold[key] ?? 0));

export const cartCount = (cart: CartLine[]) =>
  cart.reduce((sum, line) => sum + line.qty, 0);
