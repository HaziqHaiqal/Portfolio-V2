'use client';

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  BatteryFull,
  Building2,
  Check,
  CreditCard,
  FlaskConical,
  MessageSquare,
  Nfc,
  QrCode,
  ScanFace,
  SignalHigh,
  Smartphone,
  Wallet as WalletIcon,
  X,
} from 'lucide-react';
import { rm } from '@components/Templates/Bag';
import {
  BASE_PATH,
  BRAND,
  DEMO_BANKS,
  PAY_METHODS,
  TEST_CARDS,
  TEST_OTP,
  type FailReason,
} from './data';
import { useHydrated, useStore, type Order } from './store';

const QR_SECONDS = 5 * 60;
const STEP_MS = 650;
const MERCHANT = BRAND.toUpperCase();

const BANK_COLOURS: Record<string, string> = {
  a: '#2F6B4F',
  b: '#2D4C8C',
  c: '#6A6A66',
};

type Bank = (typeof DEMO_BANKS)[number];

type Phone =
  | { kind: 'idle' }
  | { kind: 'push'; bank: Bank }
  | { kind: 'bank'; bank: Bank }
  | { kind: 'faceid'; bank: Bank }
  | { kind: 'sms' }
  | { kind: 'camera'; scanning: boolean }
  | { kind: 'wallet' }
  | { kind: 'done'; ok: boolean };

type Outcome =
  | { ok: true; detail: string }
  | { ok: false; reason: FailReason; detail: string };

const BUTTON =
  'flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-40';
const PRIMARY = `${BUTTON} bg-[#1D1D1B] text-white hover:bg-[#3a3a37]`;
const SECONDARY = `${BUTTON} border border-black/15 bg-white text-[#1D1D1B] hover:border-[#1D1D1B]`;
const INPUT =
  'mt-1.5 h-12 w-full rounded-xl border border-black/15 bg-white px-4 text-base tabular-nums outline-none transition-colors focus:border-[#1D1D1B] md:text-sm';

const groups = (digits: string) => digits.replace(/(\d{4})(?=\d)/g, '$1 ');

const subscribeClock = (onTick: () => void) => {
  const timer = setInterval(onTick, 15_000);
  return () => clearInterval(timer);
};

const readTime = () =>
  new Date().toLocaleTimeString('en-MY', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: false,
  });
const readDate = () =>
  new Date().toLocaleDateString('en-MY', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

function useClock() {
  return useSyncExternalStore(subscribeClock, readTime, () => '9:41');
}

function useToday() {
  return useSyncExternalStore(subscribeClock, readDate, () => '');
}

const QR_SIZE = 25;
const QR_CORNERS = [
  [0, 0],
  [QR_SIZE - 7, 0],
  [0, QR_SIZE - 7],
];

/** Dark cells of a QR-like pattern seeded by the order number. */
function qrCells(seed: string) {
  let state = [...seed].reduce(
    (sum, char) => (Math.imul(sum, 31) + char.charCodeAt(0)) >>> 0,
    7
  );
  const cells: [number, number][] = [];
  for (let y = 0; y < QR_SIZE; y++)
    for (let x = 0; x < QR_SIZE; x++) {
      state = (Math.imul(state, 1103515245) + 12345) >>> 0;
      const finder = QR_CORNERS.some(
        ([fx, fy]) => x >= fx && x < fx + 7 && y >= fy && y < fy + 7
      );
      if (state / 4294967296 > 0.5 && !finder) cells.push([x, y]);
    }
  return cells;
}

/** A QR-like pattern drawn from the order number. It is not scannable. */
function DemoQr({ seed, className }: { seed: string; className: string }) {
  const size = QR_SIZE;
  const corners = QR_CORNERS;
  return (
    <svg
      viewBox={`-1 -1 ${size + 2} ${size + 2}`}
      role="img"
      aria-label="Demo QR code, not scannable"
      className={className}
    >
      <rect x={-1} y={-1} width={size + 2} height={size + 2} fill="white" />
      <g fill="currentColor">
        {qrCells(seed).map(([x, y]) => (
          <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} />
        ))}
        {corners.map(([x, y]) => (
          <g key={`${x}-${y}`}>
            <rect x={x} y={y} width={7} height={7} />
            <rect x={x + 1} y={y + 1} width={5} height={5} fill="white" />
            <rect x={x + 2} y={y + 2} width={3} height={3} />
          </g>
        ))}
      </g>
      <rect x={9.5} y={9.5} width={6} height={6} rx={1.5} fill="white" />
    </svg>
  );
}

function BankMark({ bank, size = 'h-10 w-10' }: { bank: Bank; size?: string }) {
  return (
    <span
      style={{ background: BANK_COLOURS[bank.id] }}
      className={`flex shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white ${size}`}
    >
      {bank.name.slice(-1)}
    </span>
  );
}

// --- The simulated phone -------------------------------------------------

function LockScreen({
  clock,
  children,
}: {
  clock: string;
  children?: ReactNode;
}) {
  const today = useToday();
  return (
    <div className="flex h-full flex-col bg-[linear-gradient(165deg,#C8D3CC_0%,#E7DFD2_55%,#D9C9B4_100%)] px-4 pt-14">
      <p className="text-center text-sm font-medium text-black/60">{today}</p>
      <p className="text-center text-7xl font-semibold tracking-[-0.04em] text-black/80">
        {clock}
      </p>
      <div className="mt-8 space-y-2">{children}</div>
    </div>
  );
}

function Notification({
  icon,
  app,
  title,
  body,
  onTap,
}: {
  icon: ReactNode;
  app: string;
  title: string;
  body: string;
  onTap: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onTap}
      className="block w-full animate-[tpl-rise_450ms_cubic-bezier(.22,1,.36,1)] rounded-2xl bg-white/75 p-3 text-left text-[#1D1D1B] shadow-lg backdrop-blur-xl transition-transform active:scale-[0.98]"
    >
      <span className="flex items-center gap-2 text-[11px] text-black/50">
        {icon}
        <span className="flex-1 font-medium">{app}</span>
        now
      </span>
      <span className="mt-1.5 block text-sm font-semibold">{title}</span>
      <span className="mt-0.5 block text-[13px] leading-snug text-black/70">
        {body}
      </span>
    </button>
  );
}

function PhoneScreen({
  phone,
  order,
  onTapPush,
  onApprove,
  onReject,
  onTapSms,
  onScan,
  onWalletPay,
  onWalletCancel,
}: {
  phone: Phone;
  order: Order;
  onTapPush: () => void;
  onApprove: () => void;
  onReject: () => void;
  onTapSms: () => void;
  onScan: () => void;
  onWalletPay: () => void;
  onWalletCancel: () => void;
}) {
  const clock = useClock();
  const amount = rm(order.total);

  if (phone.kind === 'push')
    return (
      <LockScreen clock={clock}>
        <Notification
          icon={
            <BankMark
              bank={phone.bank}
              size="h-4 w-4 rounded-[5px] text-[9px]"
            />
          }
          app={phone.bank.name}
          title={`Approve ${amount} to ${MERCHANT}?`}
          body="An online banking payment is waiting for you. Tap to review."
          onTap={onTapPush}
        />
      </LockScreen>
    );

  if (phone.kind === 'sms')
    return (
      <LockScreen clock={clock}>
        <Notification
          icon={
            <span className="flex h-4 w-4 items-center justify-center rounded-[5px] bg-emerald-500 text-white">
              <MessageSquare size={10} />
            </span>
          }
          app="Messages"
          title="Demo Bank"
          body={`${amount} at ${MERCHANT}. Your one-time code is ${TEST_OTP}. Never share this code. Tap to fill it in.`}
          onTap={onTapSms}
        />
      </LockScreen>
    );

  if (phone.kind === 'bank' || phone.kind === 'faceid') {
    const colour = BANK_COLOURS[phone.bank.id];
    return (
      <div className="relative flex h-full flex-col bg-[#F4F4F2] text-[#1D1D1B]">
        <div
          style={{ background: colour }}
          className="px-5 pb-6 pt-12 text-white"
        >
          <p className="text-xs opacity-75">Simulated bank app</p>
          <p className="mt-1 text-lg font-semibold">{phone.bank.name}</p>
        </div>
        <div className="-mt-3 flex-1 rounded-t-2xl bg-[#F4F4F2] px-5 pt-6">
          <p className="text-sm text-black/55">Payment request</p>
          <p className="mt-1 text-4xl font-semibold tracking-[-0.03em]">
            {amount}
          </p>
          <dl className="mt-5 space-y-2.5 text-sm">
            {[
              ['To', MERCHANT],
              ['From', 'Savings account ending 4021'],
              ['Reference', order.id],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4">
                <dt className="text-black/50">{label}</dt>
                <dd className="text-right font-medium">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-5 text-xs leading-relaxed text-black/45">
            A real bank app asks for your PIN or Face ID here. This one never
            asks for a password.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 px-5 pb-8 pt-4">
          <button
            type="button"
            onClick={onReject}
            disabled={phone.kind === 'faceid'}
            className="h-12 rounded-xl border border-black/15 bg-white text-sm font-semibold"
          >
            Reject
          </button>
          <button
            type="button"
            onClick={onApprove}
            disabled={phone.kind === 'faceid'}
            style={{ background: colour }}
            className="h-12 rounded-xl text-sm font-semibold text-white"
          >
            Approve
          </button>
        </div>
        {phone.kind === 'faceid' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/55 text-white backdrop-blur-sm">
            <ScanFace size={64} strokeWidth={1.25} className="animate-pulse" />
            <p className="text-sm font-medium">Confirming it is you</p>
          </div>
        )}
      </div>
    );
  }

  if (phone.kind === 'camera')
    return (
      <div className="relative flex h-full flex-col bg-[#0E0E0D] text-white">
        <p className="pt-12 text-center text-sm font-medium">DemoWallet</p>
        <p className="mt-1 text-center text-xs text-white/55">
          Point the camera at the QR code
        </p>
        <div className="relative mx-auto mt-8 h-56 w-56">
          <span className="absolute left-0 top-0 h-8 w-8 rounded-tl-2xl border-l-4 border-t-4 border-white" />
          <span className="absolute right-0 top-0 h-8 w-8 rounded-tr-2xl border-r-4 border-t-4 border-white" />
          <span className="absolute bottom-0 left-0 h-8 w-8 rounded-bl-2xl border-b-4 border-l-4 border-white" />
          <span className="absolute bottom-0 right-0 h-8 w-8 rounded-br-2xl border-b-4 border-r-4 border-white" />
          <div
            className={`absolute inset-6 overflow-hidden rounded-lg text-black transition-opacity duration-500 ${
              phone.scanning ? 'opacity-100' : 'opacity-25'
            }`}
          >
            <DemoQr seed={order.id} className="h-full w-full" />
            {phone.scanning && (
              <span className="absolute inset-x-0 top-0 h-1 animate-[tpl-scan_1.2s_ease-in-out_infinite] bg-emerald-400 shadow-[0_0_20px_4px_rgba(52,211,153,0.7)]" />
            )}
          </div>
        </div>
        <div className="mt-auto px-5 pb-8">
          <button
            type="button"
            onClick={onScan}
            disabled={phone.scanning}
            className="h-12 w-full rounded-xl bg-white text-sm font-semibold text-black disabled:opacity-60"
          >
            {phone.scanning ? 'Scanning…' : 'Scan the code'}
          </button>
        </div>
      </div>
    );

  if (phone.kind === 'wallet')
    return (
      <div className="flex h-full flex-col bg-[#F4F4F2] text-[#1D1D1B]">
        <div className="bg-[#1D1D1B] px-5 pb-6 pt-12 text-white">
          <p className="text-xs opacity-60">DemoWallet</p>
          <p className="mt-1 text-sm">Balance RM1,240.00</p>
        </div>
        <div className="flex-1 px-5 pt-8 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-lg font-semibold shadow">
            R
          </span>
          <p className="mt-3 text-sm text-black/55">Pay to {MERCHANT}</p>
          <p className="mt-1 text-4xl font-semibold tracking-[-0.03em]">
            {amount}
          </p>
          <p className="mt-2 text-xs text-black/45">
            DuitNow QR, reference {order.id}
          </p>
        </div>
        <div className="space-y-2 px-5 pb-8">
          <button
            type="button"
            onClick={onWalletPay}
            className="h-12 w-full rounded-xl bg-[#1D1D1B] text-sm font-semibold text-white"
          >
            Pay {amount}
          </button>
          <button
            type="button"
            onClick={onWalletCancel}
            className="h-11 w-full rounded-xl text-sm font-medium text-black/60"
          >
            Decline
          </button>
        </div>
      </div>
    );

  if (phone.kind === 'done')
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 bg-[#F4F4F2] px-6 text-center text-[#1D1D1B]">
        <span
          className={`flex h-16 w-16 items-center justify-center rounded-full text-white ${
            phone.ok ? 'bg-emerald-600' : 'bg-red-600'
          }`}
        >
          {phone.ok ? (
            <Check size={32} strokeWidth={3} />
          ) : (
            <X size={32} strokeWidth={3} />
          )}
        </span>
        <p className="text-lg font-semibold">
          {phone.ok ? 'Payment sent' : 'Payment not sent'}
        </p>
        <p className="text-sm text-black/55">You can go back to the shop.</p>
      </div>
    );

  return (
    <LockScreen clock={clock}>
      <p className="pt-20 text-center text-xs text-black/40">
        No new notifications
      </p>
    </LockScreen>
  );
}

function PhoneFrame({
  dark,
  children,
}: {
  dark: boolean;
  children: ReactNode;
}) {
  const clock = useClock();
  return (
    <div className="relative h-[640px] w-[312px] shrink-0 rounded-[52px] bg-[#111] p-3 shadow-[0_50px_90px_-30px_rgba(0,0,0,0.55)] ring-1 ring-black/10">
      <div className="relative h-full overflow-hidden rounded-[42px] bg-white">
        <div
          className={`pointer-events-none absolute inset-x-0 top-0 z-20 flex h-11 items-center justify-between px-7 text-[13px] font-semibold transition-colors ${
            dark ? 'text-white' : 'text-black/80'
          }`}
        >
          <span>{clock}</span>
          <span className="flex items-center gap-1">
            <SignalHigh size={14} />
            <BatteryFull size={16} />
          </span>
        </div>
        <span className="absolute left-1/2 top-2.5 z-30 h-7 w-24 -translate-x-1/2 rounded-full bg-black" />
        {children}
      </div>
    </div>
  );
}

// --- The payment page ----------------------------------------------------

function Progress({
  steps,
  done,
  failAt,
}: {
  steps: string[];
  done: number;
  failAt: number | null;
}) {
  return (
    <ol role="status" className="space-y-4 py-4">
      {steps.map((step, index) => {
        const failed = failAt === index && done > index;
        const complete = done > index && !failed;
        const current = done === index;
        return (
          <li key={step} className="flex items-center gap-3 text-sm">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
                failed
                  ? 'bg-red-600 text-white'
                  : complete
                    ? 'bg-emerald-600 text-white'
                    : current
                      ? 'animate-spin border-2 border-[#1D1D1B] border-t-transparent'
                      : 'border-2 border-black/15'
              }`}
            >
              {failed ? (
                <X size={14} strokeWidth={3} />
              ) : complete ? (
                <Check size={14} strokeWidth={3} />
              ) : null}
            </span>
            <span
              className={done >= index ? 'text-[#1D1D1B]' : 'text-black/40'}
            >
              {step}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function CardPreview({
  digits,
  name,
  expiry,
  cvc,
  flipped,
}: {
  digits: string;
  name: string;
  expiry: string;
  cvc: string;
  flipped: boolean;
}) {
  const shown = (digits + '•'.repeat(16)).slice(0, 16);
  return (
    <div className="[perspective:1200px]">
      <div
        style={{ transform: flipped ? 'rotateY(180deg)' : 'none' }}
        className="relative aspect-[1.586] w-full transition-transform duration-700 [transform-style:preserve-3d]"
      >
        <div className="absolute inset-0 flex flex-col justify-between rounded-2xl bg-[linear-gradient(135deg,#2B2E33_0%,#4B5058_55%,#30343A_100%)] p-5 text-white shadow-xl [backface-visibility:hidden]">
          <div className="flex items-start justify-between">
            <span className="h-8 w-11 rounded-md bg-[linear-gradient(135deg,#E9D29A,#B8954D)]" />
            <Nfc size={22} className="opacity-70" />
          </div>
          <p className="text-[clamp(1rem,4.6vw,1.35rem)] tabular-nums tracking-[0.12em]">
            {groups(shown)}
          </p>
          <div className="flex items-end justify-between text-xs">
            <span>
              <span className="block text-[9px] uppercase opacity-60">
                Card holder
              </span>
              <span className="mt-0.5 block uppercase tracking-wide">
                {name}
              </span>
            </span>
            <span className="text-right">
              <span className="block text-[9px] uppercase opacity-60">
                Expires
              </span>
              <span className="mt-0.5 block tabular-nums">
                {expiry || 'MM/YY'}
              </span>
            </span>
          </div>
        </div>
        <div className="absolute inset-0 rounded-2xl bg-[linear-gradient(135deg,#30343A,#4B5058)] text-white shadow-xl [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <span className="mt-6 block h-10 bg-black/80" />
          <div className="mx-5 mt-5 flex items-center justify-end rounded bg-white/90 px-3 py-2 text-sm font-semibold tabular-nums text-black">
            {cvc || '•••'}
          </div>
          <p className="mx-5 mt-3 text-right text-[10px] opacity-60">
            Test card, no real account
          </p>
        </div>
      </div>
    </div>
  );
}

function OtpBoxes({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="relative mt-3" onClick={() => ref.current?.focus()}>
      <input
        ref={ref}
        id="pay-otp"
        value={value}
        onChange={(event) =>
          onChange(event.target.value.replace(/\D/g, '').slice(0, 6))
        }
        inputMode="numeric"
        autoComplete="one-time-code"
        aria-label="One-time code"
        className="peer absolute inset-0 h-full w-full opacity-0"
      />
      <div aria-hidden="true" className="grid grid-cols-6 gap-2">
        {Array.from({ length: 6 }, (_, index) => (
          <span
            key={index}
            className={`flex h-14 items-center justify-center rounded-xl border bg-white text-xl font-semibold tabular-nums ${
              index === value.length
                ? 'border-[#1D1D1B] peer-focus:ring-2'
                : 'border-black/15'
            }`}
          >
            {value[index] ?? ''}
          </span>
        ))}
      </div>
    </div>
  );
}

function Payment({ order }: { order: Order }) {
  const router = useRouter();
  const markPaid = useStore((state) => state.markPaid);
  const markFailed = useStore((state) => state.markFailed);
  const method = order.details.method as 'fpx' | 'card' | 'ewallet';
  const label = PAY_METHODS.find((item) => item.id === method)?.label ?? '';
  const result = `${BASE_PATH}/order?id=${order.id}`;

  const [phone, setPhone] = useState<Phone>(
    method === 'ewallet'
      ? { kind: 'camera', scanning: false }
      : { kind: 'idle' }
  );
  const [bankId, setBankId] = useState<string | null>(null);
  const [cardStage, setCardStage] = useState<'form' | 'otp'>('form');
  const [number, setNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [cvcFocused, setCvcFocused] = useState(false);
  const [cardError, setCardError] = useState('');
  const [otp, setOtp] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(QR_SECONDS);
  const [progress, setProgress] = useState<{
    steps: string[];
    done: number;
    outcome: Outcome;
  } | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const bank = DEMO_BANKS.find((item) => item.id === bankId) ?? null;
  const digits = number.replace(/\D/g, '');

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  };

  const finish = (outcome: Outcome, steps: string[]) => {
    setProgress({ steps, done: 0, outcome });
    const failAt = outcome.ok ? null : 1;
    const last = failAt === null ? steps.length : failAt + 1;
    for (let index = 1; index <= last; index++)
      later(
        () => setProgress((prev) => prev && { ...prev, done: index }),
        STEP_MS * index
      );
    later(
      () => {
        if (outcome.ok) markPaid(order.id, outcome.detail);
        else markFailed(order.id, outcome.reason, outcome.detail);
        router.replace(result);
      },
      STEP_MS * last + 700
    );
  };

  // The QR expires, like a real one.
  useEffect(() => {
    if (method !== 'ewallet') return;
    const started = Date.now();
    const timer = setInterval(() => {
      const left = QR_SECONDS - Math.floor((Date.now() - started) / 1000);
      setSecondsLeft(Math.max(0, left));
      if (left <= 0) {
        clearInterval(timer);
        setPhone({ kind: 'done', ok: false });
        setProgress({
          steps: ['Waiting for your e-wallet', 'QR code expired'],
          done: 2,
          outcome: { ok: false, reason: 'qr_expired', detail: 'DuitNow QR' },
        });
        timers.current.push(
          setTimeout(() => {
            markFailed(order.id, 'qr_expired', 'DuitNow QR');
            router.replace(result);
          }, 1200)
        );
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [method, markFailed, order.id, result, router]);

  const fpxSteps = (name: string) => [
    `Contacting ${name}`,
    `Authorising ${rm(order.total)}`,
    `Confirming with ${BRAND}`,
  ];
  const cardSteps = [
    'Checking the card',
    'Authorising with your bank',
    `Confirming with ${BRAND}`,
  ];
  const walletSteps = [
    'Receiving the e-wallet payment',
    `Confirming with ${BRAND}`,
  ];

  // FPX
  const sendToBank = () => {
    if (!bank) return;
    const detail = `FPX, ${bank.name}`;
    if (bank.offline) {
      finish(
        { ok: false, reason: 'bank_unavailable', detail },
        fpxSteps(bank.name)
      );
      return;
    }
    setPhone({ kind: 'push', bank });
  };
  const approve = () => {
    if (!bank) return;
    setPhone({ kind: 'faceid', bank });
    later(() => {
      setPhone({ kind: 'done', ok: true });
      finish({ ok: true, detail: `FPX, ${bank.name}` }, fpxSteps(bank.name));
    }, 1300);
  };
  const reject = () => {
    if (!bank) return;
    setPhone({ kind: 'done', ok: false });
    finish(
      { ok: false, reason: 'bank_declined', detail: `FPX, ${bank.name}` },
      fpxSteps(bank.name)
    );
  };

  // Card
  const cardDetail = `Card ending ${digits.slice(-4)}`;
  const payByCard = () => {
    const card = TEST_CARDS.find((item) => item.number === digits);
    if (!card) {
      setCardError(
        'Use one of the test cards above. Real card numbers are not accepted here.'
      );
      return;
    }
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry) || !/^\d{3}$/.test(cvc)) {
      setCardError('Enter any future expiry (MM/YY) and a 3-digit CVC.');
      return;
    }
    setCardError('');
    if (digits.endsWith('3220')) {
      setCardStage('otp');
      later(() => setPhone({ kind: 'sms' }), 600);
    } else if (digits.endsWith('0002'))
      finish({ ok: false, reason: 'declined', detail: cardDetail }, cardSteps);
    else if (digits.endsWith('9995'))
      finish(
        { ok: false, reason: 'insufficient_funds', detail: cardDetail },
        cardSteps
      );
    else finish({ ok: true, detail: cardDetail }, cardSteps);
  };
  const confirmOtp = () => {
    setPhone({ kind: 'idle' });
    finish(
      otp === TEST_OTP
        ? { ok: true, detail: cardDetail }
        : { ok: false, reason: 'otp_failed', detail: cardDetail },
      cardSteps
    );
  };

  // E-wallet
  const scan = () => {
    setPhone({ kind: 'camera', scanning: true });
    later(() => setPhone({ kind: 'wallet' }), 1500);
  };
  const walletPay = () => {
    setPhone({ kind: 'done', ok: true });
    finish({ ok: true, detail: 'DuitNow QR' }, walletSteps);
  };
  const walletCancel = () => {
    setPhone({ kind: 'done', ok: false });
    finish(
      { ok: false, reason: 'wallet_declined', detail: 'DuitNow QR' },
      walletSteps
    );
  };

  const screen = (
    <PhoneScreen
      phone={phone}
      order={order}
      onTapPush={() =>
        phone.kind === 'push' && setPhone({ kind: 'bank', bank: phone.bank })
      }
      onApprove={approve}
      onReject={reject}
      onTapSms={() => {
        setOtp(TEST_OTP);
        setPhone({ kind: 'idle' });
      }}
      onScan={scan}
      onWalletPay={walletPay}
      onWalletCancel={walletCancel}
    />
  );
  const sheetOpen = !progress && phone.kind !== 'idle';
  const Icon =
    method === 'fpx' ? Building2 : method === 'card' ? CreditCard : QrCode;

  return (
    <div className="mx-auto mt-6 grid max-w-5xl items-start gap-12 lg:grid-cols-[minmax(0,30rem)_1fr]">
      <div className="rounded-[28px] bg-white p-6 shadow-[0_30px_60px_-35px_rgba(0,0,0,0.35)] ring-1 ring-black/5 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-black/50">Pay {BRAND}</p>
            <p className="mt-1 text-4xl font-semibold tabular-nums tracking-[-0.03em]">
              {rm(order.total)}
            </p>
          </div>
          <div className="text-right text-sm">
            <p className="text-black/50">Order</p>
            <p className="mt-1 font-medium tabular-nums">{order.id}</p>
          </div>
        </div>
        <p className="mt-6 flex items-center gap-2 border-t border-black/10 pt-5 text-sm font-semibold">
          <Icon size={17} aria-hidden="true" />
          {label}
        </p>

        <div className="mt-5">
          {progress ? (
            <Progress
              steps={progress.steps}
              done={progress.done}
              failAt={progress.outcome.ok ? null : 1}
            />
          ) : method === 'fpx' ? (
            phone.kind === 'idle' ? (
              <fieldset>
                <legend className="text-sm text-black/60">
                  Choose your bank
                </legend>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {DEMO_BANKS.map((item) => {
                    const selected = item.id === bankId;
                    return (
                      <label
                        key={item.id}
                        className={`relative flex cursor-pointer flex-col items-center gap-2 rounded-2xl border p-3 text-center transition-colors has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-black/10 ${
                          selected
                            ? 'border-[#1D1D1B] bg-black/[0.03]'
                            : 'border-black/10 hover:border-black/30'
                        }`}
                      >
                        <input
                          type="radio"
                          name="bank"
                          checked={selected}
                          onChange={() => setBankId(item.id)}
                          className="sr-only"
                        />
                        <BankMark bank={item} />
                        <span className="text-xs font-medium">{item.name}</span>
                        <span
                          className={`text-[11px] ${item.offline ? 'text-red-600' : 'text-black/45'}`}
                        >
                          {item.offline ? 'Offline' : 'Online'}
                        </span>
                      </label>
                    );
                  })}
                </div>
                <p className="mt-3 text-xs text-black/45">
                  Demo Bank C is offline on purpose, to show a failed payment.
                </p>
                <button
                  type="button"
                  onClick={sendToBank}
                  disabled={!bank}
                  className={`mt-6 ${PRIMARY}`}
                >
                  <Smartphone size={16} aria-hidden="true" />
                  Send to my bank app
                </button>
              </fieldset>
            ) : (
              <div className="py-2">
                <div className="flex items-center gap-4">
                  <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-black/[0.04]">
                    <Smartphone size={26} />
                    <span className="absolute -right-1 -top-1 h-4 w-4 animate-ping rounded-full bg-emerald-500" />
                    <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-emerald-500" />
                  </span>
                  <div>
                    <p className="font-semibold">
                      Approve in your {bank?.name} app
                    </p>
                    <p className="mt-0.5 text-sm text-black/55">
                      We sent a request to your phone. Tap the notification to
                      open it.
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex gap-3 text-sm">
                  <button
                    type="button"
                    onClick={() => bank && setPhone({ kind: 'push', bank })}
                    className="font-medium underline underline-offset-4"
                  >
                    Send it again
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhone({ kind: 'idle' })}
                    className="font-medium text-black/55 underline underline-offset-4"
                  >
                    Use another bank
                  </button>
                </div>
              </div>
            )
          ) : method === 'card' ? (
            cardStage === 'form' ? (
              <form
                noValidate
                autoComplete="off"
                onSubmit={(event) => {
                  event.preventDefault();
                  payByCard();
                }}
              >
                <CardPreview
                  digits={digits}
                  name={order.details.name}
                  expiry={expiry}
                  cvc={cvc}
                  flipped={cvcFocused}
                />
                <details className="group mt-5 rounded-xl bg-black/[0.03] px-4 py-3 text-sm">
                  <summary className="cursor-pointer list-none font-medium [&::-webkit-details-marker]:hidden">
                    Test cards to try
                  </summary>
                  <ul className="mt-3 space-y-2">
                    {TEST_CARDS.map((card) => (
                      <li key={card.number} className="flex items-center gap-3">
                        <span className="tabular-nums">
                          {groups(card.number)}
                        </span>
                        <span className="flex-1 text-xs text-black/50">
                          {card.result}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setNumber(groups(card.number));
                            setExpiry('12/34');
                            setCvc('123');
                            setCardError('');
                          }}
                          className="rounded-full bg-white px-3 py-1 text-xs font-semibold shadow-sm"
                        >
                          Use
                        </button>
                      </li>
                    ))}
                  </ul>
                </details>
                <label htmlFor="pay-card" className="mt-5 block text-sm">
                  Card number
                </label>
                <input
                  id="pay-card"
                  value={number}
                  onChange={(event) => {
                    setNumber(
                      groups(event.target.value.replace(/\D/g, '').slice(0, 16))
                    );
                    setCardError('');
                  }}
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="4242 4242 4242 4242"
                  aria-invalid={Boolean(cardError)}
                  aria-describedby={cardError ? 'pay-card-error' : undefined}
                  className={INPUT}
                />
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="pay-expiry" className="text-sm">
                      Expiry
                    </label>
                    <input
                      id="pay-expiry"
                      value={expiry}
                      onChange={(event) => {
                        const raw = event.target.value
                          .replace(/\D/g, '')
                          .slice(0, 4);
                        setExpiry(
                          raw.length > 2
                            ? `${raw.slice(0, 2)}/${raw.slice(2)}`
                            : raw
                        );
                      }}
                      inputMode="numeric"
                      autoComplete="off"
                      placeholder="MM/YY"
                      className={INPUT}
                    />
                  </div>
                  <div>
                    <label htmlFor="pay-cvc" className="text-sm">
                      CVC
                    </label>
                    <input
                      id="pay-cvc"
                      value={cvc}
                      onFocus={() => setCvcFocused(true)}
                      onBlur={() => setCvcFocused(false)}
                      onChange={(event) =>
                        setCvc(
                          event.target.value.replace(/\D/g, '').slice(0, 3)
                        )
                      }
                      inputMode="numeric"
                      autoComplete="off"
                      placeholder="123"
                      className={INPUT}
                    />
                  </div>
                </div>
                {cardError && (
                  <p
                    id="pay-card-error"
                    role="alert"
                    className="mt-3 text-sm text-red-600"
                  >
                    {cardError}
                  </p>
                )}
                <button type="submit" className={`mt-6 ${PRIMARY}`}>
                  Pay {rm(order.total)}
                </button>
              </form>
            ) : (
              <div>
                <p className="font-semibold">Enter the code from your bank</p>
                <p className="mt-1 text-sm text-black/55">
                  Demo Bank sent a 6-digit code to the phone ending{' '}
                  {order.details.phone.replace(/\D/g, '').slice(-4)}. Tap the
                  message on the phone to fill it in.
                </p>
                <OtpBoxes value={otp} onChange={setOtp} />
                <button
                  type="button"
                  disabled={otp.length < 6}
                  onClick={confirmOtp}
                  className={`mt-6 ${PRIMARY}`}
                >
                  Confirm payment
                </button>
                <button
                  type="button"
                  onClick={() => setPhone({ kind: 'sms' })}
                  className="mt-3 w-full text-sm font-medium text-black/55 underline underline-offset-4"
                >
                  Send the code again
                </button>
              </div>
            )
          ) : (
            <div className="text-center">
              <div className="mx-auto w-fit rounded-3xl border border-black/10 p-4 text-[#1D1D1B]">
                <DemoQr seed={order.id} className="h-48 w-48" />
              </div>
              <p className="mt-4 font-semibold">
                Scan with any e-wallet or banking app
              </p>
              <p className="mt-1 text-sm tabular-nums text-black/55">
                Expires in {Math.floor(secondsLeft / 60)}:
                {String(secondsLeft % 60).padStart(2, '0')}. The QR is a
                drawing; use the phone to scan it.
              </p>
            </div>
          )}
        </div>

        {!progress && (
          <button
            type="button"
            onClick={() => {
              markFailed(order.id, 'cancelled', label);
              router.replace(result);
            }}
            className="mx-auto mt-8 flex items-center gap-1.5 text-sm font-medium text-black/50 hover:text-[#1D1D1B]"
          >
            <ArrowLeft size={15} aria-hidden="true" />
            Cancel and return to {BRAND}
          </button>
        )}
      </div>

      <div className="hidden flex-col items-center gap-4 lg:flex">
        <PhoneFrame
          dark={['bank', 'faceid', 'camera', 'wallet'].includes(phone.kind)}
        >
          {screen}
        </PhoneFrame>
        <p className="flex items-center gap-1.5 text-xs text-black/45">
          <Smartphone size={13} aria-hidden="true" />
          Your phone, simulated. Tap it like a real one.
        </p>
      </div>

      <div
        className={`fixed inset-x-0 bottom-0 z-[80] transition-transform duration-500 lg:hidden ${
          sheetOpen ? 'translate-y-0' : 'pointer-events-none translate-y-full'
        }`}
        inert={!sheetOpen}
      >
        <div className="mx-auto max-w-md overflow-hidden rounded-t-[28px] bg-white shadow-[0_-20px_60px_-10px_rgba(0,0,0,0.35)]">
          <div className="flex items-center justify-between px-5 py-3 text-xs text-black/50">
            <span className="flex items-center gap-1.5">
              <Smartphone size={13} aria-hidden="true" />
              On your phone (simulated)
            </span>
            <span className="h-1 w-10 rounded-full bg-black/15" />
          </div>
          <div className="h-[min(560px,70svh)]">{screen}</div>
        </div>
      </div>
    </div>
  );
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[calc(100svh-var(--demo-bar))] bg-[#EFEEEA] px-4 pb-16 pt-8 text-[#1D1D1B] [color-scheme:light] md:pt-12">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <p className="flex items-center gap-2 text-lg font-semibold tracking-[-0.02em]">
          <span className="relative h-6 w-6">
            <span className="absolute inset-0 rotate-6 rounded-md bg-[#1D1D1B]" />
            <span className="absolute inset-1 -rotate-6 rounded-[5px] bg-[#EFEEEA]" />
          </span>
          DemoPay
        </p>
        <span className="flex items-center gap-1.5 rounded-full bg-amber-200 px-3 py-1 text-xs font-semibold text-amber-950">
          <FlaskConical size={13} aria-hidden="true" />
          Test mode
        </span>
      </div>
      {children}
      <p className="mx-auto mt-10 max-w-md text-center text-xs leading-relaxed text-black/45">
        A simulated payment page for the {BRAND} demo. No money moves, and
        nothing you type leaves this browser. A live store connects a real
        gateway for FPX, cards and DuitNow here.
      </p>
    </div>
  );
}

function Message({
  title,
  text,
  children,
}: {
  title: string;
  text: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto mt-6 max-w-md rounded-[28px] bg-white p-8 ring-1 ring-black/5">
      <p className="font-semibold">{title}</p>
      <p className="mt-2 text-sm text-black/55">{text}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}

export default function Gateway({ orderId }: { orderId: string }) {
  const router = useRouter();
  const hydrated = useHydrated();
  const order = useStore((state) =>
    state.orders.find((item) => item.id === orderId)
  );
  const retryPayment = useStore((state) => state.retryPayment);
  const settled =
    order &&
    order.status !== 'pending_payment' &&
    order.status !== 'payment_failed';

  useEffect(() => {
    if (settled) router.replace(`${BASE_PATH}/order?id=${orderId}`);
  }, [settled, orderId, router]);

  if (!hydrated || settled)
    return (
      <Shell>
        <Message title="Loading payment" text="One moment.">
          <div className="h-1 overflow-hidden rounded-full bg-black/10">
            <div className="h-full w-1/3 animate-pulse rounded-full bg-[#1D1D1B]" />
          </div>
        </Message>
      </Shell>
    );

  if (!order)
    return (
      <Shell>
        <Message
          title="Payment link not found"
          text="This order is not on this device. Demo orders stay in the browser they were made in."
        >
          <Link href={BASE_PATH} className={PRIMARY}>
            Back to {BRAND}
          </Link>
        </Message>
      </Shell>
    );

  if (order.status === 'payment_failed')
    return (
      <Shell>
        <Message
          title="This payment did not go through"
          text={`Order ${order.id} is still waiting for ${rm(order.total)}.`}
        >
          <button
            type="button"
            onClick={() => retryPayment(order.id)}
            className={PRIMARY}
          >
            Try again
          </button>
          <Link href={`${BASE_PATH}/checkout`} className={`mt-3 ${SECONDARY}`}>
            Choose another way to pay
          </Link>
        </Message>
      </Shell>
    );

  return (
    <Shell>
      <Payment key={order.payment.attempts} order={order} />
    </Shell>
  );
}
