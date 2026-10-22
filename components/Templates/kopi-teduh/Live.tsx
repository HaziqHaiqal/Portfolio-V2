'use client';

import { useState, useSyncExternalStore } from 'react';
import Photo from '@components/Templates/Photo';
import { HoverPreview } from '@components/Templates/motion';
import { HOURS, MENU, type MenuItem } from './data';

const subscribeMinute = (listener: () => void) => {
  const timer = setInterval(listener, 60_000);
  return () => clearInterval(timer);
};

// Café time is always Kuala Lumpur, whatever the visitor's timezone.
function klNow() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kuala_Lumpur',
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  }).formatToParts(new Date());
  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? '';
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(
    get('weekday')
  );
  return `${day}|${Number(get('hour')) + Number(get('minute')) / 60}`;
}

function useKlTime() {
  const snapshot = useSyncExternalStore(subscribeMinute, klNow, () => null);
  if (!snapshot) return null;
  const [day, hour] = snapshot.split('|').map(Number);
  return { day, hour };
}

const formatHour = (value: number) => {
  const hour = Math.floor(value);
  const minutes = Math.round((value - hour) * 60);
  const suffix = hour >= 12 ? 'pm' : 'am';
  return `${hour % 12 || 12}${minutes ? `.${String(minutes).padStart(2, '0')}` : ''}${suffix}`;
};

export function OpenStatus({ className = '' }: { className?: string }) {
  const now = useKlTime();
  if (!now) return <span className={className}>Open daily from 7am</span>;
  const today = HOURS.find((row) => row.days.includes(now.day));
  const open = today && now.hour >= today.open && now.hour < today.close;
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span
        className={`h-2 w-2 rounded-full ${open ? 'animate-pulse bg-emerald-400' : 'bg-red-400'}`}
      />
      {open && today
        ? `Open now, until ${formatHour(today.close)}`
        : `Closed now, opens ${formatHour(today?.open ?? 7)}`}
    </span>
  );
}

export function HoursList() {
  const now = useKlTime();
  return (
    <dl>
      {HOURS.map((row) => {
        const today = now ? row.days.includes(now.day) : false;
        return (
          <div
            key={row.label}
            className={`flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-t border-tpl-line py-5 ${
              today ? '' : 'text-tpl-muted'
            }`}
          >
            <dt className="flex items-center gap-2 text-sm">
              {row.label}
              {today && (
                <span className="rounded-full bg-tpl-accent px-2 py-0.5 text-[11px] font-semibold text-tpl-on-accent">
                  Today
                </span>
              )}
            </dt>
            <dd className="text-3xl font-semibold tracking-tight md:text-4xl">
              {formatHour(row.open)} to {formatHour(row.close)}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

function Price({ item }: { item: MenuItem }) {
  if (!item.iced) {
    return (
      <p className="text-xl font-semibold tabular-nums md:text-2xl">
        {item.price}
      </p>
    );
  }
  return (
    <p className="text-right text-xl font-semibold tabular-nums md:text-2xl">
      {item.price}
      <span className="block text-xs font-medium text-tpl-muted">
        Iced {item.iced}
      </span>
    </p>
  );
}

const TABS = Object.keys(MENU);

export function Menu() {
  const [tab, setTab] = useState(TABS[0]);

  return (
    <div>
      <div role="tablist" aria-label="Menu" className="flex gap-6">
        {TABS.map((name) => (
          <button
            key={name}
            id={`kt-tab-${name}`}
            type="button"
            role="tab"
            aria-selected={tab === name}
            aria-controls="kt-menu"
            onClick={() => setTab(name)}
            className={`border-b-2 pb-1 text-base font-semibold transition-colors md:text-lg ${
              tab === name
                ? 'border-tpl-accent text-tpl-ink'
                : 'border-transparent text-tpl-muted hover:text-tpl-ink'
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      <div
        id="kt-menu"
        role="tabpanel"
        aria-labelledby={`kt-tab-${tab}`}
        className="mt-8 border-b border-tpl-line"
      >
        <HoverPreview
          key={tab}
          items={MENU[tab]}
          imageClassName="h-72 w-56"
          renderRow={(item) => (
            <div className="group flex items-center gap-4 border-t border-tpl-line py-5 transition-colors md:py-7">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl md:hidden">
                <Photo
                  src={item.image}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-2xl font-semibold tracking-tight transition-transform duration-300 md:text-5xl md:group-hover:translate-x-3">
                  {item.name}
                  {item.tag && (
                    <span className="rounded-full bg-tpl-tint px-2.5 py-1 text-xs font-semibold tracking-normal text-tpl-accent">
                      {item.tag}
                    </span>
                  )}
                </p>
                <p className="mt-1 text-sm text-tpl-muted md:text-base">
                  {item.note}
                </p>
              </div>
              <Price item={item} />
            </div>
          )}
        />
      </div>
    </div>
  );
}
