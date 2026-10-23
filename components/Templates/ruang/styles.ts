// Plain constants so server and client components can share them.
export const CONTAINER = 'mx-auto w-full max-w-[88rem] px-4 md:px-8';

export const BUTTON =
  'inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-medium transition-[opacity,background-color,color] disabled:opacity-40';
export const BUTTON_DARK = `${BUTTON} bg-tpl-ink text-tpl-surface hover:opacity-85`;
export const BUTTON_ACCENT = `${BUTTON} bg-tpl-accent text-tpl-on-accent hover:opacity-90`;
export const BUTTON_OUTLINE = `${BUTTON} border border-tpl-ink/15 bg-tpl-surface hover:border-tpl-ink`;
