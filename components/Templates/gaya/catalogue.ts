'use client';

import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { create } from 'zustand';
import {
  createJSONStorage,
  persist,
  type StateStorage,
} from 'zustand/middleware';
import { ITEMS, LISTS, listSlugOf, slugOf, type Item } from './data';

export const MAX_ADDED = 8;

// Cut-outs are data URLs of about 100 KB each, too big for localStorage next to the other demos.
function idbStorage(): StateStorage {
  let db: Promise<IDBDatabase> | null = null;
  const open = () =>
    (db ??= new Promise((resolve, reject) => {
      const req = indexedDB.open('gaya-demo', 1);
      req.onupgradeneeded = () => req.result.createObjectStore('kv');
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    }));
  const run = <T>(
    mode: IDBTransactionMode,
    act: (store: IDBObjectStore) => IDBRequest<T>
  ) =>
    open().then(
      (base) =>
        new Promise<T>((resolve, reject) => {
          const req = act(base.transaction('kv', mode).objectStore('kv'));
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => reject(req.error);
        })
    );
  return {
    getItem: (name) =>
      run<string | undefined>('readonly', (s) => s.get(name))
        .then((value) => value ?? null)
        .catch(() => null),
    setItem: (name, value) =>
      run('readwrite', (s) => s.put(value, name)).then(() => undefined),
    removeItem: (name) =>
      run('readwrite', (s) => s.delete(name)).then(() => undefined),
  };
}

/** Units the owner counted, and how many had sold by then. */
export interface StockCount {
  qty: number;
  base: number;
}

interface CatalogueState {
  added: Item[];
  prices: Record<string, number>;
  stock: Record<string, StockCount>;
  add: (item: Item, stock: Record<string, number>) => void;
  remove: (id: string) => void;
  setPrice: (id: string, price: number) => void;
  setStock: (key: string, qty: number, soldSoFar: number) => void;
  reset: () => void;
}

export const useCatalogue = create<CatalogueState>()(
  persist(
    (set) => ({
      added: [],
      prices: {},
      stock: {},
      add: (item, counts) =>
        set((state) => ({
          added: [item, ...state.added].slice(0, MAX_ADDED),
          stock: {
            ...state.stock,
            ...Object.fromEntries(
              Object.entries(counts).map(([key, qty]) => [key, { qty, base: 0 }])
            ),
          },
        })),
      remove: (id) =>
        set((state) => ({
          added: state.added.filter((item) => item.id !== id),
          stock: Object.fromEntries(
            Object.entries(state.stock).map(([key, count]) =>
              key.startsWith(`${id}:`) ? [key, { qty: 0, base: 0 }] : [key, count]
            )
          ),
        })),
      setPrice: (id, price) =>
        set((state) => ({ prices: { ...state.prices, [id]: price } })),
      setStock: (key, qty, soldSoFar) =>
        set((state) => ({
          stock: { ...state.stock, [key]: { qty, base: soldSoFar } },
        })),
      reset: () => set({ added: [], prices: {}, stock: {} }),
    }),
    {
      name: 'gaya-catalogue',
      version: 1,
      storage: createJSONStorage(idbStorage),
      skipHydration: true,
      partialize: ({ added, prices, stock }) => ({ added, prices, stock }),
    }
  )
);

export function CatalogueHydrator() {
  useEffect(() => {
    void useCatalogue.persist.rehydrate();
  }, []);
  return null;
}

export function useCatalogueReady() {
  return useSyncExternalStore(
    (onChange) => useCatalogue.persist.onFinishHydration(onChange),
    () => useCatalogue.persist.hasHydrated(),
    () => false
  );
}

const priced = (prices: Record<string, number>) => (item: Item) =>
  prices[item.id] === undefined ? item : { ...item, price: prices[item.id] };

/** Every piece in the store: the owner's newest first, then the demo pieces. */
export function useItems() {
  const added = useCatalogue((state) => state.added);
  const prices = useCatalogue((state) => state.prices);
  return useMemo(
    () => [...added, ...ITEMS].map(priced(prices)),
    [added, prices]
  );
}

/** The three lines, with added pieces hung first. */
export function useLists() {
  const added = useCatalogue((state) => state.added);
  const prices = useCatalogue((state) => state.prices);
  return useMemo(
    () =>
      LISTS.map((list) => ({
        ...list,
        items: [
          ...added.filter((item) => listSlugOf(item) === list.slug),
          ...list.items,
        ].map(priced(prices)),
      })),
    [added, prices]
  );
}

export function useItem(item: Item) {
  const price = useCatalogue((state) => state.prices[item.id]);
  return useMemo(
    () => (price === undefined ? item : { ...item, price }),
    [item, price]
  );
}

export function useItemBySlug(slug: string) {
  const items = useItems();
  return items.find((item) => slugOf(item) === slug);
}
