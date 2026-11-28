'use client';

import {
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { SiWhatsapp } from 'react-icons/si';
import {
  CARE,
  CARE_YEARLY_SAVING,
  type CareTier,
  carePerMonth,
  TAKEOVER,
} from '@constants/services';
import { formatRM } from '@lib/format';
import PillTabs from './PillTabs';
import { SOLID, trackWhatsApp } from './PriceParts';

const BILLING = [
  { id: 'monthly', label: 'Monthly' },
  { id: 'yearly', label: 'Yearly', badge: `Save ${CARE_YEARLY_SAVING}%` },
];

const MINE = [
  { name: 'Landing page', tier: CARE.starter },
  { name: 'Business website', tier: CARE.business },
  { name: 'Online store', tier: CARE.store },
  { name: 'System or app', tier: CARE.system },
  { name: 'Automation', tier: CARE.automation },
];

const MESSAGE = `Hi Haziq, I'd like a takeover check (${TAKEOVER.options
  .map(
    (option) => `${formatRM(option.check)} for a ${option.name.toLowerCase()}`
  )
  .join(
    ', '
  )}).\nLink: \nBuilt with: \nPlease let me know what you need from me.`;

const ZIGZAG =
  'conic-gradient(from -45deg at bottom, #0000, #000 1deg 89deg, #0000 90deg) 50% / 14px 100%';

function Row({ name, children }: { name: string; children: ReactNode }) {
  return (
    <li className="flex items-end gap-2 py-1.5">
      <span className="min-w-0 font-semibold">{name}</span>
      <span
        aria-hidden="true"
        className="mb-1.5 min-w-3 flex-1 border-b-2 border-dotted border-gray-300"
      />
      <span className="shrink-0 whitespace-nowrap font-mono text-sm tabular-nums">
        {children}
      </span>
    </li>
  );
}

function Price({ tier, yearly }: { tier: CareTier; yearly: boolean }) {
  return (
    <>
      {tier.from && <span className="text-xs text-gray-500">from </span>}
      {yearly && (
        <>
          <s className="text-gray-400 decoration-red-500 decoration-2">
            {formatRM(tier.monthly)}
          </s>{' '}
        </>
      )}
      <b className="text-gray-900">
        {formatRM(yearly ? carePerMonth(tier) : tier.monthly)}
      </b>
      <span className="text-gray-500">/mo</span>
    </>
  );
}

// Phones stack the receipts in one pile; a sideways swipe sends the top one to the back.
const STACKED = '(max-width: 767px)';
const SWIPE = 70;

function subscribe(onChange: () => void) {
  const query = window.matchMedia(STACKED);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

function Slip({
  title,
  summary,
  tilt,
  style,
  hidden,
  yearly,
  children,
}: {
  title: string;
  summary: string;
  tilt: string;
  style: CSSProperties;
  hidden: boolean;
  yearly: boolean;
  children: ReactNode;
}) {
  return (
    <div
      inert={hidden}
      style={style}
      className={`min-w-0 [filter:drop-shadow(0_14px_24px_rgb(0_0_0/0.18))] max-md:col-start-1 max-md:row-start-1 max-md:transition-transform max-md:duration-300 max-md:[transform:var(--stack)] ${tilt}`}
    >
      <article
        style={{ mask: ZIGZAG, WebkitMask: ZIGZAG }}
        className="relative h-full bg-white px-6 pb-10 pt-7 text-gray-700 dark:bg-gray-100 sm:px-8"
      >
        <div
          aria-hidden="true"
          className={`absolute right-5 top-5 flex h-20 w-20 -rotate-12 flex-col items-center justify-center rounded-full border-[3px] border-green-600 text-green-700 transition duration-300 ${
            yearly ? 'scale-100 opacity-100' : 'scale-150 opacity-0'
          }`}
        >
          <span className="text-2xl font-black leading-none">
            -{CARE_YEARLY_SAVING}%
          </span>
          <span className="mt-1 text-[10px] font-bold uppercase tracking-widest">
            Yearly
          </span>
        </div>
        <h3 className="pr-24 text-xl font-extrabold text-gray-900">{title}</h3>
        <p className="mt-1 pr-24 text-sm leading-relaxed text-gray-500">
          {summary}
        </p>
        <hr className="my-5 border-dashed border-gray-300" />
        {children}
      </article>
    </div>
  );
}

export default function Maintenance({
  whatsappHref,
}: {
  whatsappHref: string;
}) {
  const href = new URL(whatsappHref);
  href.searchParams.set('text', MESSAGE);

  const stacked = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(STACKED).matches,
    () => false
  );
  const [yearly, setYearly] = useState(true);
  const billing = yearly ? 'yearly' : 'monthly';
  const [front, setFront] = useState(0);
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef<number | null>(null);
  const swiped = useRef(false);

  const onPointerDown = (event: PointerEvent) => {
    if (!stacked || event.button !== 0) return;
    startX.current = event.clientX;
    swiped.current = false;
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (startX.current === null) return;
    const x = event.clientX - startX.current;
    if (!dragging) {
      if (Math.abs(x) < 8) return;
      setDragging(true);
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    swiped.current = true;
    setDx(x);
  };

  const onPointerEnd = () => {
    if (startX.current === null) return;
    startX.current = null;
    if (Math.abs(dx) > SWIPE) setFront((index) => 1 - index);
    setDx(0);
    setDragging(false);
  };

  const slip = (index: number) => {
    const top = index === front;
    return {
      yearly,
      hidden: stacked && !top,
      style: {
        '--stack': top
          ? `translateX(${dx}px) rotate(${dx / 24}deg)`
          : `translate(6px, 14px) rotate(${index ? 2.5 : -2.5}deg) scale(0.96)`,
        zIndex: top ? 2 : 1,
        transitionDuration: dragging && top ? '0ms' : undefined,
      } as CSSProperties,
    };
  };

  return (
    <div>
      <div className="mx-auto mb-10 max-w-xs sm:max-w-none">
        <PillTabs
          tabs={BILLING}
          activeId={billing}
          onChange={(id) => setYearly(id === 'yearly')}
          label="Billing"
          idPrefix="care"
        />
      </div>

      <div
        id={`care-panel-${billing}`}
        role="tabpanel"
        aria-labelledby={`care-tab-${billing}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onClickCapture={(event) => {
          if (!swiped.current) return;
          swiped.current = false;
          event.preventDefault();
          event.stopPropagation();
        }}
        className={`mx-auto grid max-w-4xl max-md:[touch-action:pan-y] md:grid-cols-2 md:gap-8 ${
          dragging ? 'select-none' : ''
        }`}
      >
        <Slip
          title="Built by me"
          summary="Hosting, SSL, updates and backups."
          tilt="md:-rotate-1"
          {...slip(0)}
        >
          <ul>
            {MINE.map((row) => (
              <Row key={row.name} name={row.name}>
                <Price tier={row.tier} yearly={yearly} />
              </Row>
            ))}
          </ul>
          <hr className="my-5 border-dashed border-gray-300" />
          <p className="text-xs leading-relaxed text-gray-500">
            {yearly ? 'Billed yearly.' : 'Billed monthly.'} Landing pages and
            business websites include the first year.
          </p>
        </Slip>

        <Slip
          title="Built by someone else"
          summary="After a one-time check of the code, security and speed."
          tilt="md:rotate-1"
          {...slip(1)}
        >
          <ul>
            {TAKEOVER.options.map((option) => (
              <Row key={option.id} name={option.name}>
                <Price tier={option.care} yearly={yearly} />
              </Row>
            ))}
          </ul>
          <p className="mt-4 text-xs font-semibold text-gray-500">
            One-time check first
          </p>
          <ul>
            {TAKEOVER.options.map((option) => (
              <Row key={option.id} name={option.name}>
                <b className="text-gray-900">{formatRM(option.check)}</b>
              </Row>
            ))}
          </ul>
          <a
            href={href.toString()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              trackWhatsApp({ tab: 'maintenance', package: 'takeover' })
            }
            className={`${SOLID} mt-6 w-full`}
          >
            <SiWhatsapp size={15} aria-hidden="true" />
            Book a check
          </a>
        </Slip>
      </div>

      <div className="mt-8 flex justify-center md:hidden">
        {['Built by me', 'Built by someone else'].map((label, index) => (
          <button
            key={label}
            type="button"
            onClick={() => setFront(index)}
            aria-label={`Show ${label}`}
            aria-current={index === front}
            className="flex h-8 w-6 items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/40"
          >
            <span
              className={`h-2 rounded-full transition-all duration-300 ${
                index === front
                  ? 'w-5 bg-green-600 dark:bg-green-400'
                  : 'w-2 bg-gray-300 dark:bg-gray-600'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
