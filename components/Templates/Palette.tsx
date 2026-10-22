'use client';

import {
  createContext,
  use,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { MotionRoot } from './motion';
import { PALETTE_ROLES, TEMPLATE_PALETTES, type Palette } from './palettes';

export const PALETTE_PARAM = 'colour';

const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

// The URL wins so shared links open in the colour they were sent in; the
// session copy keeps the choice across pages of multi-page demos.
function readChoice(slug: string) {
  try {
    return (
      new URLSearchParams(window.location.search).get(PALETTE_PARAM) ||
      window.sessionStorage.getItem(`palette:${slug}`)
    );
  } catch {
    return null;
  }
}

function saveChoice(slug: string, id: string) {
  try {
    window.sessionStorage.setItem(`palette:${slug}`, id);
  } catch {}
  const url = new URL(window.location.href);
  url.searchParams.set(PALETTE_PARAM, id);
  window.history.replaceState(window.history.state, '', url);
  listeners.forEach((listener) => listener());
}

const toChannels = (hex: string) =>
  [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16)).join(' ');

const PaletteContext = createContext<{
  slug: string;
  palettes: Palette[];
  active: Palette;
} | null>(null);

export function PaletteRoot({
  slug,
  className = '',
  children,
}: {
  slug: string;
  className?: string;
  children: ReactNode;
}) {
  const palettes = TEMPLATE_PALETTES[slug];
  const chosen = useSyncExternalStore(
    subscribe,
    () => readChoice(slug),
    () => null
  );
  const active =
    palettes.find((palette) => palette.id === chosen) ?? palettes[0];
  const style = Object.fromEntries(
    PALETTE_ROLES.map((role) => [
      `--tpl-${role}`,
      toChannels(active.colors[role]),
    ])
  ) as CSSProperties;

  return (
    <PaletteContext value={{ slug, palettes, active }}>
      <div
        data-template-root
        style={style}
        className={`min-h-screen bg-tpl-bg font-tpl text-tpl-ink antialiased [--demo-bar:3rem] ${className}`}
      >
        <MotionRoot>{children}</MotionRoot>
      </div>
    </PaletteContext>
  );
}

export function PaletteSwitcher() {
  const context = use(PaletteContext);
  if (!context || context.palettes.length < 2) return null;
  const { slug, palettes, active } = context;

  return (
    <div className="flex items-center gap-2.5">
      <div
        role="group"
        aria-label="Colour options"
        className="flex items-center gap-1.5"
      >
        {palettes.map((palette) => {
          const selected = palette.id === active.id;
          return (
            <button
              key={palette.id}
              type="button"
              aria-pressed={selected}
              aria-label={palette.name}
              title={palette.name}
              onClick={() => saveChoice(slug, palette.id)}
              style={{
                background: `linear-gradient(135deg, ${palette.colors.bg} 50%, ${palette.colors.accent} 50%)`,
              }}
              className={`h-6 w-6 rounded-full ring-offset-2 ring-offset-neutral-950 transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                selected
                  ? 'ring-2 ring-white'
                  : 'ring-1 ring-white/25 hover:ring-white/60'
              }`}
            />
          );
        })}
      </div>
      <span className="hidden w-24 truncate text-xs text-white/60 md:block">
        {active.name}
      </span>
    </div>
  );
}
