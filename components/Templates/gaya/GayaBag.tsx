'use client';

import type { ReactNode } from 'react';
import { BagProvider } from '@components/Templates/Bag';
import { BASE_PATH, BRAND, FREE_POSTAGE_AT } from './data';
import { useStockLeft } from './orders';

export default function GayaBag({ children }: { children: ReactNode }) {
  const left = useStockLeft();
  return (
    <BagProvider
      buttonClassName="rounded-[2px]"
      brand={BRAND}
      freeShippingAt={FREE_POSTAGE_AT}
      note="Postage and payment are chosen at checkout."
      checkoutHref={`${BASE_PATH}/checkout`}
      storageKey="gaya-bag"
      limit={left}
    >
      {children}
    </BagProvider>
  );
}
