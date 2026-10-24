// One-shot values passed between pages through sessionStorage, so the URL
// stays free of #fragments.
export const HANDOFF = {
  templateOrder: 'handoff:template-order',
  /** A ServicePick as JSON: the pricing tab to open. */
  servicePick: 'handoff:service-pick',
} as const;

export function giveHandoff(key: string, value: string) {
  try {
    window.sessionStorage.setItem(key, value);
  } catch {}
}

export function takeHandoff(key: string): string | null {
  try {
    const value = window.sessionStorage.getItem(key);
    window.sessionStorage.removeItem(key);
    return value;
  } catch {
    return null;
  }
}
