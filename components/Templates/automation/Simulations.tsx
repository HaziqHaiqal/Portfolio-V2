'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BellRing,
  Check,
  CheckCheck,
  RotateCcw,
  Send,
  Sheet,
  X,
} from 'lucide-react';

const BUTTON =
  'inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-50';
const PRIMARY = `${BUTTON} bg-[#111] text-white hover:bg-black focus-visible:ring-black/20`;
const GHOST = `${BUTTON} border border-black/15 text-[#111] hover:bg-black/5 focus-visible:ring-black/10`;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const rise = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.25 },
};

/** A phone-sized chat window. */
function ChatFrame({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scroller.current?.scrollTo({
      top: scroller.current.scrollHeight,
      behavior: 'smooth',
    });
  });
  return (
    <div className="flex h-[26rem] flex-col overflow-hidden rounded-[28px] bg-[#EFE9E1] shadow-xl ring-1 ring-black/5">
      <div className="flex items-center gap-3 bg-[#0F5E4F] px-4 py-3 text-white">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-sm font-bold">
          {title.charAt(0)}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold">{title}</span>
          <span className="block text-xs text-white/70">{subtitle}</span>
        </span>
      </div>
      <div
        ref={scroller}
        className="flex-1 space-y-2 overflow-y-auto px-3 py-4"
        aria-live="polite"
      >
        {children}
      </div>
      {footer}
    </div>
  );
}

function Bubble({
  from,
  children,
}: {
  from: 'me' | 'them';
  children: ReactNode;
}) {
  return (
    <motion.div
      {...rise}
      className={`flex ${from === 'me' ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed shadow-sm ${
          from === 'me'
            ? 'rounded-br-md bg-[#D9FDD3] text-[#111]'
            : 'rounded-bl-md bg-white text-[#111]'
        }`}
      >
        {children}
      </div>
    </motion.div>
  );
}

function Typing() {
  return (
    <motion.div {...rise} className="flex justify-start">
      <div className="flex gap-1 rounded-2xl rounded-bl-md bg-white px-3.5 py-3 shadow-sm">
        {[0, 1, 2].map((dot) => (
          <span
            key={dot}
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-black/40 motion-reduce:animate-none"
            style={{ animationDelay: `${dot * 120}ms` }}
          />
        ))}
      </div>
    </motion.div>
  );
}

const rm = (amount: number) => `RM${amount.toFixed(2)}`;

const ORDERS = [
  {
    name: 'Aina',
    message: 'Hi! 2 nasi lemak ayam and 1 teh ais. Pickup 12:30.',
    items: '2× Nasi lemak ayam, 1× Teh ais',
    total: 21.5,
    when: 'Pickup 12:30',
  },
  {
    name: 'Daniel',
    message: 'Can I get 3 roti canai and 2 kopi O? Deliver to SS2/24.',
    items: '3× Roti canai, 2× Kopi O',
    total: 10.6,
    when: 'Delivery',
  },
  {
    name: 'Mei Ling',
    message: '1 mee goreng mamak and 1 limau ais please, pickup now.',
    items: '1× Mee goreng mamak, 1× Limau ais',
    total: 12,
    when: 'Pickup now',
  },
];

type OrderRow = (typeof ORDERS)[number] & { id: number; fresh?: boolean };

/** A WhatsApp order becomes a row in the orders sheet, with a reply. */
export function WhatsAppOrders() {
  const [chat, setChat] = useState<{ from: 'me' | 'them'; text: string }[]>([]);
  const [rows, setRows] = useState<OrderRow[]>([
    {
      id: 1040,
      name: 'Hafiz',
      message: '',
      items: '1× Nasi lemak ayam',
      total: 9,
      when: 'Pickup 12:00',
    },
    {
      id: 1041,
      name: 'Priya',
      message: '',
      items: '2× Teh tarik, 2× Roti telur',
      total: 13.2,
      when: 'Delivery',
    },
  ]);
  const [typing, setTyping] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notified, setNotified] = useState(false);
  const sent = rows.length - 2;
  const next = ORDERS[sent];

  const send = async () => {
    if (!next) {
      setChat([]);
      setRows((current) => current.slice(0, 2));
      return;
    }
    setBusy(true);
    setNotified(false);
    setChat((current) => [...current, { from: 'me', text: next.message }]);
    await wait(500);
    setTyping(true);
    await wait(900);
    const id = 1042 + sent;
    setRows((current) => [
      ...current.map((row) => ({ ...row, fresh: false })),
      { ...next, id, fresh: true },
    ]);
    setTyping(false);
    setChat((current) => [
      ...current,
      {
        from: 'them',
        text: `Thanks ${next.name}! Order #${id} is in: ${next.items}. Total ${rm(next.total)}. ${next.when === 'Delivery' ? 'On its way within 40 minutes.' : `${next.when}.`}`,
      },
    ]);
    setNotified(true);
    setBusy(false);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <ChatFrame
        title="Kopi Teduh"
        subtitle="WhatsApp · replies instantly"
        footer={
          <div className="flex items-center gap-2 bg-[#F6F3EE] p-3">
            <p className="min-w-0 flex-1 truncate rounded-full bg-white px-4 py-2.5 text-sm text-black/60">
              {next ? next.message : 'All three orders sent'}
            </p>
            <button
              type="button"
              onClick={send}
              disabled={busy}
              aria-label={next ? 'Send this order' : 'Start again'}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0F5E4F] text-white disabled:opacity-50"
            >
              {next ? <Send size={16} /> : <RotateCcw size={16} />}
            </button>
          </div>
        }
      >
        {chat.length === 0 && (
          <p className="mx-auto max-w-[16rem] rounded-xl bg-white/70 px-3 py-2 text-center text-xs text-black/60">
            Press send to order as a customer.
          </p>
        )}
        {chat.map((message, index) => (
          <Bubble key={index} from={message.from}>
            {message.text}
          </Bubble>
        ))}
        {typing && <Typing />}
      </ChatFrame>

      <div className="overflow-hidden rounded-[28px] bg-white shadow-xl ring-1 ring-black/5">
        <div className="flex items-center justify-between gap-3 border-b border-black/10 px-4 py-3">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <Sheet size={16} className="text-[#188038]" aria-hidden="true" />
            Orders · Google Sheets
          </p>
          <AnimatePresence>
            {notified && (
              <motion.p
                {...rise}
                className="flex items-center gap-1.5 rounded-full bg-[#111] px-3 py-1 text-xs font-medium text-white"
              >
                <BellRing size={12} aria-hidden="true" />
                Kitchen told
              </motion.p>
            )}
          </AnimatePresence>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm sm:min-w-[30rem]">
            <thead className="bg-[#F8F9FA] text-xs text-black/50">
              <tr>
                {['#', 'Name', 'Items', 'Total', 'When'].map((heading) => (
                  <th
                    key={heading}
                    className={`px-3 py-2 font-medium ${heading === '#' ? 'hidden sm:table-cell' : ''}`}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {rows.map((row) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0, backgroundColor: '#DCFCE7' }}
                    animate={{
                      opacity: 1,
                      backgroundColor: row.fresh ? '#DCFCE7' : '#FFFFFF',
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className="border-t border-black/5"
                  >
                    <td className="hidden px-3 py-2.5 tabular-nums text-black/50 sm:table-cell">
                      {row.id}
                    </td>
                    <td className="px-3 py-2.5 font-medium">{row.name}</td>
                    <td className="px-3 py-2.5 text-black/70">{row.items}</td>
                    <td className="px-3 py-2.5 tabular-nums">
                      {rm(row.total)}
                    </td>
                    <td className="px-3 py-2.5 text-black/70">{row.when}</td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const QUESTIONS = [
  {
    ask: 'Do you deliver to Sabah?',
    answer:
      'Yes, we ship across Malaysia. Sabah and Sarawak take 3 to 5 working days, and delivery is free above RM150.',
  },
  {
    ask: 'Which serum for oily skin?',
    answer:
      'Try the Niacinamide Glow Serum (RM69). Use it at night after cleansing. Want me to send the link?',
  },
  {
    ask: 'Is it halal?',
    answer:
      'Yes, all our products are halal-certified. The certificate is on each product page.',
  },
  {
    ask: 'Talk to a person',
    answer:
      "Sure. I've passed this chat to the team, and they'll reply here between 9am and 6pm.",
  },
];

/** A website assistant answering common questions, then handing over. */
export function Chatbot() {
  const [chat, setChat] = useState<{ from: 'me' | 'them'; text: string }[]>([
    {
      from: 'them',
      text: "Hi! I'm the Seri Glow assistant. Ask me anything, or pick a question below.",
    },
  ]);
  const [typing, setTyping] = useState(false);

  const ask = async (question: (typeof QUESTIONS)[number]) => {
    if (typing) return;
    setChat((current) => [...current, { from: 'me', text: question.ask }]);
    setTyping(true);
    await wait(900);
    setTyping(false);
    setChat((current) => [...current, { from: 'them', text: question.answer }]);
  };

  return (
    <ChatFrame
      title="Seri Glow"
      subtitle="Website assistant"
      footer={
        <div className="flex flex-wrap gap-2 bg-[#F6F3EE] p-3">
          {QUESTIONS.map((question) => (
            <button
              key={question.ask}
              type="button"
              onClick={() => ask(question)}
              disabled={typing}
              className="rounded-full border border-black/15 bg-white px-3 py-1.5 text-xs font-medium text-[#111] transition-colors hover:bg-black/5 disabled:opacity-50"
            >
              {question.ask}
            </button>
          ))}
        </div>
      }
    >
      {chat.map((message, index) => (
        <Bubble key={index} from={message.from}>
          {message.text}
        </Bubble>
      ))}
      {typing && <Typing />}
    </ChatFrame>
  );
}

type ApprovalStep = 'draft' | 'waiting' | 'approved' | 'rejected';

/** A leave request travels from staff to manager and back. */
export function Approvals() {
  const [step, setStep] = useState<ApprovalStep>('draft');
  const [log, setLog] = useState<string[]>([]);

  const submit = () => {
    setStep('waiting');
    setLog([
      '09:02  Farid sent a leave request',
      '09:02  Siti was asked to approve',
    ]);
  };
  const decide = (approved: boolean) => {
    setStep(approved ? 'approved' : 'rejected');
    setLog((current) => [
      ...current,
      approved ? '09:05  Siti approved it' : '09:05  Siti declined it',
      approved
        ? '09:05  Farid was told'
        : '09:05  Farid was told, with Siti’s note',
    ]);
  };
  const reset = () => {
    setStep('draft');
    setLog([]);
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="rounded-[24px] bg-white p-5 shadow-xl ring-1 ring-black/5">
        <p className="text-xs font-semibold uppercase tracking-wider text-black/50">
          Staff · Farid
        </p>
        <dl className="mt-4 space-y-2 text-sm">
          {[
            ['Type', 'Annual leave'],
            ['Dates', '12 to 13 Nov'],
            ['Days', '2'],
            ['Reason', 'Family trip'],
          ].map(([term, detail]) => (
            <div key={term} className="flex justify-between gap-3">
              <dt className="text-black/50">{term}</dt>
              <dd className="font-medium">{detail}</dd>
            </div>
          ))}
        </dl>
        {step === 'draft' ? (
          <button
            type="button"
            onClick={submit}
            className={`${PRIMARY} mt-5 w-full`}
          >
            Send request
          </button>
        ) : (
          <AnimatePresence mode="wait">
            <motion.p
              key={step}
              {...rise}
              className={`mt-5 flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold ${
                step === 'approved'
                  ? 'bg-[#DCFCE7] text-[#166534]'
                  : step === 'rejected'
                    ? 'bg-[#FEE2E2] text-[#991B1B]'
                    : 'bg-black/5 text-black/60'
              }`}
            >
              {step === 'approved' && (
                <CheckCheck size={16} aria-hidden="true" />
              )}
              {step === 'rejected' && <X size={16} aria-hidden="true" />}
              {step === 'waiting'
                ? 'Waiting for Siti'
                : step === 'approved'
                  ? 'Approved by Siti'
                  : 'Not approved'}
            </motion.p>
          </AnimatePresence>
        )}
      </div>

      <div className="rounded-[24px] bg-white p-5 shadow-xl ring-1 ring-black/5">
        <p className="text-xs font-semibold uppercase tracking-wider text-black/50">
          Manager · Siti
        </p>
        <AnimatePresence mode="wait">
          {step === 'waiting' ? (
            <motion.div key="ask" {...rise} className="mt-4">
              <p className="text-sm leading-relaxed">
                <strong>Farid</strong> asks for 2 days of annual leave, 12 to 13
                Nov.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => decide(true)}
                  className={PRIMARY}
                >
                  <Check size={16} aria-hidden="true" />
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => decide(false)}
                  className={GHOST}
                >
                  Decline
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.p
              key="idle"
              {...rise}
              className="mt-4 text-sm text-black/50"
            >
              {step === 'draft'
                ? 'Nothing to approve yet.'
                : 'Done. Nothing else waiting.'}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div className="rounded-[24px] bg-white p-5 shadow-xl ring-1 ring-black/5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-black/50">
            Record
          </p>
          {step !== 'draft' && (
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1 text-xs font-medium text-black/60 hover:text-black"
            >
              <RotateCcw size={12} aria-hidden="true" />
              Start again
            </button>
          )}
        </div>
        <ol className="mt-4 space-y-2 font-mono text-xs" aria-live="polite">
          {log.length === 0 && (
            <li className="text-black/40">Every step is recorded here.</li>
          )}
          {log.map((entry) => (
            <motion.li key={entry} {...rise} className="text-black/80">
              {entry}
            </motion.li>
          ))}
        </ol>
      </div>
    </div>
  );
}

const WEEK = [62, 71, 58, 80, 77, 94, 100];

/** Yesterday's numbers, sent to the owner's phone every morning. */
export function MorningReport() {
  const [state, setState] = useState<'idle' | 'typing' | 'sent'>('idle');

  const run = async () => {
    setState('typing');
    await wait(1100);
    setState('sent');
  };

  return (
    <div className="grid items-start gap-4 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
      <div className="rounded-[24px] bg-white p-5 shadow-xl ring-1 ring-black/5">
        <p className="text-xs font-semibold uppercase tracking-wider text-black/50">
          Every day at 9:00
        </p>
        <p className="mt-3 text-sm leading-relaxed text-black/70">
          The report reads yesterday&apos;s orders and stock, and sends a short
          summary to the owner. Press the button instead of waiting for 9:00.
        </p>
        <button
          type="button"
          onClick={state === 'sent' ? () => setState('idle') : run}
          disabled={state === 'typing'}
          className={`${state === 'sent' ? GHOST : PRIMARY} mt-5 w-full`}
        >
          {state === 'sent' ? (
            <>
              <RotateCcw size={15} aria-hidden="true" />
              Start again
            </>
          ) : (
            'Send the 9:00 report now'
          )}
        </button>
      </div>

      <ChatFrame title="Daily report" subtitle="To: the owner's WhatsApp">
        {state === 'idle' && (
          <p className="mx-auto max-w-[16rem] rounded-xl bg-white/70 px-3 py-2 text-center text-xs text-black/60">
            The report arrives here.
          </p>
        )}
        {state === 'typing' && <Typing />}
        {state === 'sent' && (
          <Bubble from="them">
            <p className="font-semibold">
              Good morning! Kopi Teduh, yesterday:
            </p>
            <p className="mt-2">
              RM1,284 in sales, <strong>12% up</strong> on last Thursday
            </p>
            <p>46 orders. Top seller: Nasi lemak ayam (31)</p>
            <div
              className="mt-3 flex h-14 items-end gap-1.5"
              aria-hidden="true"
            >
              {WEEK.map((value, index) => (
                <motion.span
                  key={index}
                  initial={{ height: 0 }}
                  animate={{ height: `${value}%` }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                  className={`w-5 rounded-t ${index === WEEK.length - 1 ? 'bg-[#0F5E4F]' : 'bg-[#0F5E4F]/30'}`}
                />
              ))}
            </div>
            <p className="mt-1 text-[11px] text-black/50">Last 7 days</p>
            <p className="mt-2">
              Low stock: <strong>Teh ais powder</strong>, 2 packs left.
            </p>
          </Bubble>
        )}
      </ChatFrame>
    </div>
  );
}
