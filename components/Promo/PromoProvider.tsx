'use client';

import {
  createContext,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useSearchParams } from 'next/navigation';
import { applyPromoCodeAction } from '@app/services/actions';
import type { AppliedPromo } from '@lib/promo';

export const PROMO_PARAM = 'promo';

type PromoStatus = 'idle' | 'checking' | 'invalid' | 'error';

interface PromoContextValue {
  promo: AppliedPromo | null;
  status: PromoStatus;
  apply: (code: string) => Promise<boolean>;
  clear: () => void;
}

const PromoContext = createContext<PromoContextValue | null>(null);

function syncUrl(code: string | null) {
  const url = new URL(window.location.href);
  if (code) url.searchParams.set(PROMO_PARAM, code);
  else url.searchParams.delete(PROMO_PARAM);
  window.history.replaceState(null, '', url);
}

export function PromoProvider({ children }: { children: ReactNode }) {
  const [promo, setPromo] = useState<AppliedPromo | null>(null);
  const [status, setStatus] = useState<PromoStatus>('idle');

  const apply = useCallback(async (code: string) => {
    setStatus('checking');
    try {
      const result = await applyPromoCodeAction(code);
      if (!result) {
        setStatus('invalid');
        return false;
      }
      setPromo(result);
      setStatus('idle');
      syncUrl(result.code);
      return true;
    } catch {
      setStatus('error');
      return false;
    }
  }, []);

  const clear = useCallback(() => {
    setPromo(null);
    setStatus('idle');
    syncUrl(null);
  }, []);

  const value = useMemo(
    () => ({ promo, status, apply, clear }),
    [promo, status, apply, clear]
  );

  return (
    <PromoContext value={value}>
      {children}
      {/* Isolated so reading the URL doesn't opt the whole page out of prerendering. */}
      <Suspense fallback={null}>
        <PromoFromUrl apply={apply} />
      </Suspense>
    </PromoContext>
  );
}

function PromoFromUrl({ apply }: { apply: PromoContextValue['apply'] }) {
  const code = useSearchParams().get(PROMO_PARAM);
  // Only the landing URL counts: apply() rewrites ?promo= itself, and each apply bumps the code's counter.
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;
    if (code) void apply(code);
  }, [code, apply]);

  return null;
}

export function usePromo(): PromoContextValue {
  const context = useContext(PromoContext);
  if (!context) throw new Error('usePromo must be used inside PromoProvider');
  return context;
}
