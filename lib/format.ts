/** Display-formatting helpers. No UI or feature coupling — safe anywhere. */

/**
 * Short relative time ("3h ago", "2d ago"), falling back to an absolute date
 * once something is older than a month.
 */
export function relativeTime(input: string | Date | null | undefined): string {
  if (!input) return '—';
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return '—';

  const seconds = Math.round((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;

  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() === new Date().getFullYear() ? undefined : 'numeric',
  });
}

/** "12 projects" / "1 project" without the `(s)` hedge. */
export function pluralize(count: number, singular: string, plural?: string) {
  return `${count} ${count === 1 ? singular : plural ?? `${singular}s`}`;
}

/**
 * Display hostname for a user-entered URL. Returns the raw string when it will
 * not parse — the field is free text, so a malformed value must not throw
 * during render.
 */
export function hostnameOf(url: string): string {
  try {
    const normalized = url.startsWith('http') ? url : `https://${url}`;
    return new URL(normalized).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}
