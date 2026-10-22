'use client';

import { useEffect, useRef, useState } from 'react';
import { Share, SquarePlus, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const SHOW_AFTER_MS = 4000;

const dismissedKey = (scope: string) => `pwa-install-dismissed:${scope}`;

function wasDismissed(scope: string) {
  try {
    return window.localStorage.getItem(dismissedKey(scope)) === '1';
  } catch {
    return false;
  }
}

function isInstalled() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIOS() {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

/**
 * Makes a site installable: registers /sw.js for the site's scope and offers a
 * small install card (Install on Android, Share steps on iPhone). Bump
 * `version` when caching behaviour changes so old caches are cleared.
 */
export default function PwaKit({
  name,
  scope,
  offlineUrl,
  iconSrc,
  version = '1',
}: {
  name: string;
  scope: string;
  offlineUrl: string;
  iconSrc: string;
  version?: string;
}) {
  const [mode, setMode] = useState<'android' | 'ios' | null>(null);
  const [ready, setReady] = useState(false);
  const promptRef = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      const url = `/sw.js?v=${version}&offline=${encodeURIComponent(offlineUrl)}`;
      navigator.serviceWorker
        .register(url, { scope, updateViaCache: 'none' })
        .catch(() => undefined);
    }
    if (isInstalled() || wasDismissed(scope)) return;

    const onPrompt = (event: Event) => {
      event.preventDefault();
      promptRef.current = event as BeforeInstallPromptEvent;
      setMode('android');
    };
    const onInstalled = () => setMode(null);
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    const timer = setTimeout(() => {
      if (isIOS()) setMode('ios');
      setReady(true);
    }, SHOW_AFTER_MS);

    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
      clearTimeout(timer);
    };
  }, [scope, offlineUrl, version]);

  const dismiss = () => {
    try {
      window.localStorage.setItem(dismissedKey(scope), '1');
    } catch {}
    setMode(null);
  };

  if (!ready || !mode) return null;

  return (
    <div
      role="dialog"
      aria-label={`Install ${name}`}
      className="fixed inset-x-3 bottom-3 z-[65] rounded-2xl bg-neutral-950 p-4 font-sans text-white shadow-2xl sm:inset-x-auto sm:right-5 sm:w-96"
    >
      <div className="flex items-start gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={iconSrc}
          alt=""
          width={44}
          height={44}
          className="h-11 w-11 shrink-0 rounded-xl"
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">
            Add {name} to your home screen
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-white/70">
            Opens like an app, even on a weak signal.
          </p>
          {mode === 'ios' ? (
            <p className="mt-2 flex flex-wrap items-center gap-1 text-xs text-white/90">
              Tap
              <Share size={14} aria-label="Share" className="text-sky-400" />
              then
              <span className="inline-flex items-center gap-1 font-semibold">
                <SquarePlus size={14} aria-hidden="true" />
                Add to Home Screen
              </span>
            </p>
          ) : (
            <button
              type="button"
              onClick={async () => {
                const event = promptRef.current;
                if (!event) return;
                await event.prompt();
                await event.userChoice;
                promptRef.current = null;
                setMode(null);
              }}
              className="mt-3 inline-flex h-9 items-center rounded-full bg-white px-4 text-xs font-semibold text-neutral-950 transition-colors hover:bg-neutral-200"
            >
              Install
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Not now"
          className="-mr-1 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
