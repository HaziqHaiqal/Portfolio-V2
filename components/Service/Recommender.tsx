'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, RotateCcw, Sparkles, X } from 'lucide-react';
import {
  addOnById,
  CARE_TIERS,
  type CareTierId,
  careMonthly,
  cmsPrice,
  WEBSITE_CMS,
  WEBSITE_ESTIMATOR,
} from '@constants/services';
import { formatRM } from '@lib/format';
import { themeClasses } from '@constants/theme';
import { useServicePick, type ServicePick } from './servicePick';

type Goal = 'show' | 'whatsapp' | 'accounts' | 'app' | 'automate';
type Amount = 'basic' | 'several' | 'changing';
type Design = 'ready' | 'custom';
type Need = 'booking' | 'store' | 'portal';
type Store = 'yes' | 'no';

interface Answers {
  goal?: Goal;
  amount?: Amount;
  design?: Design;
  need?: Need;
  store?: Store;
}

interface Question<K extends keyof Answers> {
  key: K;
  title: string;
  options: { value: NonNullable<Answers[K]>; label: string }[];
}

interface Suggestion {
  name: string;
  price: string;
  care?: string;
  why: string;
  pick: ServicePick;
}

const GOAL: Question<'goal'> = {
  key: 'goal',
  title: 'What should it do for your business?',
  options: [
    { value: 'show', label: 'Show my business online' },
    { value: 'whatsapp', label: 'Take orders on WhatsApp' },
    { value: 'accounts', label: 'Let customers book, buy or sign in' },
    { value: 'app', label: "Be an app on people's phones" },
    { value: 'automate', label: 'Automate work, like saving WhatsApp orders' },
  ],
};

const AMOUNT: Question<'amount'> = {
  key: 'amount',
  title: 'How much do you have to show?',
  options: [
    { value: 'basic', label: 'The basics: what I do and how to reach me' },
    { value: 'several', label: 'Several services, a gallery and my story' },
    {
      value: 'changing',
      label: 'Prices, menus or promotions that change often',
    },
  ],
};

const DESIGN: Question<'design'> = {
  key: 'design',
  title: 'Which design suits you?',
  options: [
    { value: 'ready', label: 'A ready-made design, faster and cheaper' },
    { value: 'custom', label: 'A design made for my brand' },
  ],
};

const NEED: Question<'need'> = {
  key: 'need',
  title: 'What do your customers need to do?',
  options: [
    { value: 'booking', label: 'Book a time slot' },
    { value: 'store', label: 'Buy and pay online' },
    { value: 'portal', label: 'Sign in to a private member area' },
  ],
};

const STORE: Question<'store'> = {
  key: 'store',
  title: 'Must it be on the App Store and Google Play?',
  options: [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No, a home-screen icon is enough' },
  ],
};

type AnyQuestion =
  | Question<'goal'>
  | Question<'amount'>
  | Question<'design'>
  | Question<'need'>
  | Question<'store'>;

function nextQuestion(a: Answers): AnyQuestion | null {
  if (!a.goal) return GOAL;
  if (a.goal === 'show') return !a.amount ? AMOUNT : !a.design ? DESIGN : null;
  if (a.goal === 'whatsapp') return !a.design ? DESIGN : null;
  if (a.goal === 'accounts') return !a.need ? NEED : null;
  if (a.goal === 'app') {
    if (!a.store) return STORE;
    return a.store === 'no' && !a.amount ? AMOUNT : null;
  }
  return null;
}

const pkgPrice = (id: string) =>
  WEBSITE_ESTIMATOR.packages.find((pkg) => pkg.id === id)?.price ?? 0;
const addOnPrice = (id: string) => addOnById(id)?.price ?? 0;
const build = (id: string) =>
  WEBSITE_ESTIMATOR.customPackages.find((item) => item.id === id);
const care = (tier: CareTierId, withDatabase: boolean) =>
  `+ ${WEBSITE_ESTIMATOR.carePlan.name} from ${formatRM(careMonthly(WEBSITE_ESTIMATOR.carePlan, withDatabase, CARE_TIERS[tier]))}/month`;

const UPDATE_TABS = ['products', 'news'];

function suggest(a: Answers, templatesFrom: number | null): Suggestion | null {
  const template = (why: string, withDatabase = false): Suggestion | null =>
    templatesFrom === null
      ? null
      : {
          name: 'Website template',
          price: `From ${formatRM(templatesFrom)}`,
          care: care('basic', withDatabase),
          why,
          pick: { tab: 'templates' },
        };
  const website = (id: 'standard' | 'advanced', why: string): Suggestion => ({
    name: `${id === 'standard' ? 'Standard' : 'Advanced'} website`,
    price: formatRM(pkgPrice(id)),
    care: care(id === 'standard' ? 'basic' : 'business', false),
    why,
    pick: { tab: WEBSITE_ESTIMATOR.id, packageId: id },
  });

  if (a.goal === 'automate')
    return {
      name: 'Business automation',
      price: 'By quotation',
      why: 'WhatsApp orders that save themselves into your system, chatbots, approval flows and reports that send themselves, quoted after a short chat.',
      pick: { tab: 'automation' },
    };

  if (a.goal === 'accounts' && a.need) {
    const id = {
      booking: 'booking-system',
      store: 'online-store',
      portal: 'member-portal',
    }[a.need];
    const item = build(id);
    const why = {
      booking:
        'Customers book a time slot online, and you manage every booking from an admin calendar.',
      store:
        'Customers buy and pay online by FPX, card or e-wallet, and you manage orders from a dashboard.',
      portal:
        'Members sign in to their own private area, and you manage them from an admin dashboard.',
    }[a.need];
    return {
      name: `Custom website: ${item?.name ?? 'custom build'}`,
      price: item ? `Starting at ${formatRM(item.from)}` : 'By quotation',
      care: care('custom', true),
      why,
      pick: { tab: WEBSITE_ESTIMATOR.id, packageId: 'custom', buildId: id },
    };
  }

  if (a.goal === 'whatsapp' && a.design) {
    if (a.design === 'ready') {
      const pick = template(
        'Shop templates come with a WhatsApp cart, so customers send their full order to your WhatsApp. No payment gateway needed.'
      );
      if (pick) return pick;
    }
    return {
      name: 'Standard website + WhatsApp cart',
      price: formatRM(pkgPrice('standard') + addOnPrice('whatsapp-cart')),
      care: care('basic', false),
      why: 'Your products or menu on a site designed for your brand. Customers send their full order to your WhatsApp in one tap.',
      pick: {
        tab: WEBSITE_ESTIMATOR.id,
        packageId: 'standard',
        siteType: 'ecommerce',
        addOnIds: ['whatsapp-cart'],
      },
    };
  }

  if (a.goal === 'app' && a.store === 'yes')
    return {
      name: 'Mobile app',
      price: 'By quotation',
      why: 'A real app on the App Store and Google Play, for Android and iOS, quoted to what you need.',
      pick: { tab: 'mobile-app' },
    };

  if (a.goal === 'app' && a.store === 'no' && a.amount) {
    const id = a.amount === 'basic' ? 'standard' : 'advanced';
    return {
      name: `${id === 'standard' ? 'Standard' : 'Advanced'} website + installable app (PWA)`,
      price: formatRM(pkgPrice(id) + addOnPrice('pwa')),
      care: care(id === 'standard' ? 'basic' : 'business', false),
      why: 'People add your site to their home screen and open it like an app, without the App Store or Google Play, for much less than a mobile app.',
      pick: { tab: WEBSITE_ESTIMATOR.id, packageId: id, addOnIds: ['pwa'] },
    };
  }

  if (a.goal === 'show' && a.amount && a.design) {
    if (a.design === 'ready') {
      const pick = template(
        a.amount === 'changing'
          ? 'A ready-made design set up with your content. Add the admin dashboard so you can update prices and promotions yourself.'
          : 'A ready-made design set up with your content. The quickest and most affordable way to look professional online.',
        a.amount === 'changing'
      );
      if (pick) return pick;
    }
    if (a.amount === 'basic')
      return website(
        'standard',
        'A one-page site designed for your brand, with a contact form and WhatsApp button so customers can reach you.'
      );
    if (a.amount === 'several')
      return website(
        'advanced',
        'Up to 7 pages, so each service, your gallery and your story get their own page.'
      );
    return {
      name: 'Advanced website + admin dashboard',
      price: formatRM(
        pkgPrice('advanced') + cmsPrice(WEBSITE_CMS, UPDATE_TABS)
      ),
      care: care('business', true),
      why: 'Update your prices, menus and promotions yourself from a private dashboard, without paying for every change.',
      pick: {
        tab: WEBSITE_ESTIMATOR.id,
        packageId: 'advanced',
        cmsTabIds: UPDATE_TABS,
      },
    };
  }

  return null;
}

export default function Recommender({
  templatesFrom,
  className = '',
  children,
}: {
  templatesFrom: number | null;
  className?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<Answers[]>([{}]);
  const choose = useServicePick((state) => state.choose);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pendingPick = useRef<ServicePick | null>(null);
  const close = () => dialogRef.current?.close();

  useEffect(() => {
    if (!open) return;
    dialogRef.current?.showModal();
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [open]);

  // Applied once the dialog has closed and unlocked the page scroll.
  useEffect(() => {
    if (open || !pendingPick.current) return;
    choose(pendingPick.current);
    pendingPick.current = null;
  }, [open, choose]);

  const answers = history[history.length - 1];
  const question = nextQuestion(answers);
  const result = question ? null : suggest(answers, templatesFrom);
  const step = history.length;

  const answer = (key: keyof Answers, value: string) =>
    setHistory((prev) => [...prev, { ...answers, [key]: value }]);
  const back = () => setHistory((prev) => prev.slice(0, -1));
  const restart = () => setHistory([{}]);

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        onClick={() => {
          restart();
          setOpen(true);
        }}
        className={className}
      >
        {children}
      </button>

      {open && (
        <dialog
          ref={dialogRef}
          onClose={() => setOpen(false)}
          onClick={(event) => event.target === dialogRef.current && close()}
          aria-labelledby="recommender-title"
          className={`m-auto h-[min(90dvh,31rem)] w-[min(92vw,34rem)] flex-col overflow-hidden rounded-3xl border p-0 text-gray-900 shadow-2xl backdrop:bg-gray-950/60 backdrop:backdrop-blur-sm open:flex dark:text-gray-100 ${themeClasses.modal}`}
        >
          <div className="flex shrink-0 items-center justify-between gap-4 border-b border-gray-200 py-3 pl-6 pr-3 dark:border-gray-700">
            <h2
              id="recommender-title"
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400"
            >
              <Sparkles
                size={16}
                aria-hidden="true"
                className="text-green-600 dark:text-green-400"
              />
              {result ? 'Suggestion' : `Question ${step}`}
            </h2>
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-500/20 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          <div
            aria-live="polite"
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-6"
          >
            {question && (
              <fieldset>
                <legend className="text-xl font-bold text-gray-900 dark:text-white">
                  {question.title}
                </legend>
                <div className="mt-5 grid gap-2.5">
                  {question.options.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => answer(question.key, option.value)}
                      className="group flex min-h-12 items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white/60 px-4 text-left text-sm font-medium text-gray-800 transition-colors hover:border-green-500/60 hover:bg-green-500/[0.04] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-500/20 dark:border-gray-700 dark:bg-gray-900/30 dark:text-gray-200 dark:hover:border-green-400/60"
                    >
                      {option.label}
                      <ArrowRight
                        size={16}
                        aria-hidden="true"
                        className="shrink-0 text-gray-400 transition-transform group-hover:translate-x-0.5 group-hover:text-green-600 dark:group-hover:text-green-400"
                      />
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            {result && (
              <div>
                <p className="text-2xl font-extrabold text-gray-900 dark:text-white">
                  {result.name}
                </p>
                <p className="mt-1 font-bold text-green-700 dark:text-green-400">
                  {result.price}
                  {result.care && (
                    <span className="ml-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                      {result.care}
                    </span>
                  )}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    Why it fits:{' '}
                  </span>
                  {result.why}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    pendingPick.current = result.pick;
                    close();
                  }}
                  className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-green-600 px-5 text-sm font-semibold text-white shadow-lg shadow-green-600/20 transition-colors hover:bg-green-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-500/30"
                >
                  See this package
                  <ArrowRight size={15} aria-hidden="true" />
                </button>
              </div>
            )}

            {!question && !result && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Send a message with what you need and get a recommendation.
              </p>
            )}
          </div>

          {step > 1 && (
            <div className="flex shrink-0 items-center gap-5 border-t border-gray-200 px-6 py-4 text-sm dark:border-gray-700">
              <button
                type="button"
                onClick={back}
                className="inline-flex items-center gap-1.5 font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                <ArrowLeft size={15} aria-hidden="true" />
                Back
              </button>
              <button
                type="button"
                onClick={restart}
                className="inline-flex items-center gap-1.5 font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                <RotateCcw size={14} aria-hidden="true" />
                Start over
              </button>
            </div>
          )}
        </dialog>
      )}
    </>
  );
}
