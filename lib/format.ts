const SITE_TIME_ZONE = 'Asia/Kuala_Lumpur';

export function getCurrentYear(): number {
  return Number(
    new Intl.DateTimeFormat('en-US', {
      timeZone: SITE_TIME_ZONE,
      year: 'numeric',
    }).format(new Date())
  );
}

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
    year:
      date.getFullYear() === new Date().getFullYear() ? undefined : 'numeric',
  });
}

const ringgit = new Intl.NumberFormat('en-MY', { maximumFractionDigits: 2 });

export function formatRM(amount: number): string {
  return `RM${ringgit.format(amount)}`;
}

export function formatRMRange(from: number, to: number): string {
  return from === to ? formatRM(from) : `${formatRM(from)} – ${formatRM(to)}`;
}

const SITE_OFFSET = '+08:00';
const DAY_MS = 24 * 60 * 60 * 1000;

/** `YYYY-MM-DD` in site time, for `<input type="date">`. `endOfDay` reverses `fromSiteDateInput`. */
export function toSiteDateInput(
  iso: string | null | undefined,
  { endOfDay = false } = {}
): string {
  if (!iso) return '';
  const time = new Date(iso).getTime() - (endOfDay ? 1 : 0);
  return new Intl.DateTimeFormat('en-CA', { timeZone: SITE_TIME_ZONE }).format(
    new Date(time)
  );
}

/** With `endOfDay`, returns the next midnight so the picked day stays valid until it ends. */
export function fromSiteDateInput(
  date: string,
  { endOfDay = false } = {}
): string | null {
  if (!date) return null;
  const start = new Date(`${date}T00:00:00${SITE_OFFSET}`).getTime();
  return new Date(endOfDay ? start + DAY_MS : start).toISOString();
}

const siteDate = new Intl.DateTimeFormat('en-MY', {
  timeZone: SITE_TIME_ZONE,
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

export function formatSiteDate(iso: string): string {
  return siteDate.format(new Date(iso));
}

/** Formats an exclusive end timestamp as the last valid day. */
export function formatSiteLastDay(iso: string): string {
  return siteDate.format(new Date(new Date(iso).getTime() - 1));
}

export function pluralize(count: number, singular: string, plural?: string) {
  return `${count} ${count === 1 ? singular : (plural ?? `${singular}s`)}`;
}

export function hostnameOf(url: string): string {
  try {
    const normalized = url.startsWith('http') ? url : `https://${url}`;
    return new URL(normalized).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}
