import { formatRM } from '@lib/format';

export interface PromoTarget {
  id: string;
  name: string;
  label: string;
}

// Ids are stored in promo_codes.eligible_targets, so keep them stable.
export const WEBSITE_PROMO_TARGET: PromoTarget = {
  id: 'website-estimate',
  name: 'Website packages',
  label: 'Website packages',
};

export const TEMPLATE_PROMO_TARGET: PromoTarget = {
  id: 'templates',
  name: 'Templates',
  label: 'Ready-made templates',
};

/** Promo target for one template, next to the all-templates target. */
export const templatePromoTarget = (slug: string) => `template:${slug}`;

export const getPromoTargets = (): PromoTarget[] => [
  WEBSITE_PROMO_TARGET,
  TEMPLATE_PROMO_TARGET,
];

export type CareId =
  | 'starter'
  | 'business'
  | 'premium'
  | 'store'
  | 'system'
  | 'app'
  | 'automation';

export interface CareTier {
  name: string;
  for: string;
  monthly: number;
  /** A starting price, confirmed in the quote. */
  from?: boolean;
}

/** Every project needs one to stay online; priced by how much there is to look after. */
export const CARE: Record<CareId, CareTier> = {
  starter: {
    name: 'Starter',
    for: 'Starter websites and one-page templates',
    monthly: 50,
  },
  business: {
    name: 'Business',
    for: 'Business websites and multi-page templates',
    monthly: 80,
  },
  premium: { name: 'Premium', for: 'Premium websites', monthly: 120 },
  store: { name: 'Store', for: 'Ready-made online stores', monthly: 150 },
  system: {
    name: 'System',
    for: 'Online stores, booking systems and portals',
    monthly: 150,
    from: true,
  },
  app: { name: 'App', for: 'Android and iOS apps', monthly: 150, from: true },
  automation: {
    name: 'Automation',
    for: 'Automations and chatbots',
    monthly: 50,
    from: true,
  },
};

export const CARE_PLAN = 'Basic maintenance';

/** "RM80/month", or "from RM150/month" for a quoted tier. */
export const carePrice = (tier: CareTier) =>
  `${tier.from ? 'from ' : ''}${formatRM(tier.monthly)}/month`;

export const PAYMENT_TERMS =
  'A 40% deposit to start, and 60% when it goes live';

export const GATEWAY_FEES =
  'Payment gateway fees per transaction, paid by you to the provider';

/** The paid first step for systems and apps. */
export const BLUEPRINT = {
  name: 'Blueprint',
  price: 300,
  description:
    'A working session to map what you need, then a written scope and a fixed quote. Taken off your build price if you go ahead.',
};

export interface Bundle {
  id: string;
  name: string;
  summary: string;
  /** The full price, or the starting price when `from` is set. */
  price: number;
  from?: boolean;
  popular?: boolean;
  /** Bundle id whose list this one builds on ("Everything in …, plus"). */
  basedOn?: string;
  includes: string[];
  /** A running cost paid to someone else, in plain words. */
  runningCost?: string;
  /** Completes "Choose this if …". */
  bestFor?: string;
  /** The Basic maintenance tier it needs after launch. */
  care?: CareId;
}

export interface PricingTab {
  id: string;
  label: string;
  /** A shorter name for phones, such as "Apps". */
  shortLabel?: string;
  tagline: string;
  bundles: Bundle[];
  /** Starts with the paid Blueprint. */
  blueprint?: boolean;
  /** One line under the bundles. */
  note?: string;
  link?: { href: string; label: string };
  /** Only fixed prices take promo codes. */
  promoTarget?: string;
  /** "website", "online store", used in the WhatsApp message. */
  noun: string;
  /** Prices are per month, such as maintenance. */
  monthly?: boolean;
}

const BLUEPRINT_NOTE = `Starts with a ${formatRM(BLUEPRINT.price)} ${BLUEPRINT.name}: we map what you need, then you get a fixed quote. The ${formatRM(BLUEPRINT.price)} comes off the build.`;

export const WEBSITES: PricingTab = {
  id: 'website',
  label: 'Websites',
  shortLabel: 'Web',
  tagline: 'Designed for your brand',
  noun: 'website',
  promoTarget: WEBSITE_PROMO_TARGET.id,
  note: 'Need something not listed? It is quoted on WhatsApp before any work starts.',
  bundles: [
    {
      id: 'starter',
      name: 'Starter',
      summary: 'Look professional and get contacted.',
      price: 650,
      care: 'starter',
      includes: [
        'One page, with as many sections as you need',
        'Designed for your brand, not a stock theme',
        'Works well on phones',
        'WhatsApp button, contact form and Google Maps',
        'Google Business Profile set up',
        'Basic SEO and Google Analytics',
        'Launched on your domain',
      ],
      bestFor:
        'you need a professional page so customers can find and contact you.',
    },
    {
      id: 'business',
      name: 'Business',
      summary: 'Get found on Google for every service you offer.',
      price: 1800,
      popular: true,
      care: 'business',
      basedOn: 'starter',
      includes: [
        'Up to 6 pages, one for each service',
        'Site editor: update text, photos and prices yourself',
        'A WhatsApp order cart or a booking request form. You confirm each order or booking yourself',
        'Local SEO with a sitemap and Search Console',
        'Link previews when shared on WhatsApp and social media',
      ],
      bestFor:
        'you offer several services or products and want each one found on Google.',
    },
    {
      id: 'premium',
      name: 'Premium',
      summary: 'Stand out, in 3D and two languages.',
      price: 4500,
      care: 'premium',
      basedOn: 'business',
      includes: [
        'Up to 12 pages',
        '3D hero: your product, logo or scene in interactive 3D',
        'English and Malay, with a language switch. You provide the translations',
        'A news or blog section you post to yourself',
        'Installable on phones, like an app',
        'Custom animation and page transitions',
      ],
      bestFor: 'your website is a main source of customers and must stand out.',
    },
  ],
};

export const SYSTEMS: PricingTab = {
  id: 'systems',
  label: 'Systems',
  tagline: 'Stores, bookings and portals',
  noun: 'system',
  blueprint: true,
  note: BLUEPRINT_NOTE,
  bundles: [
    {
      id: 'online-store',
      name: 'Online store',
      summary: 'Customers order and pay on your site.',
      price: 6500,
      from: true,
      care: 'system',
      includes: [
        'Product catalogue with options and stock',
        'Cart and checkout with FPX, card and e-wallet',
        'Delivery options and rates',
        'Order and payment emails',
        'Admin portal for products, orders and discount codes',
      ],
      runningCost: GATEWAY_FEES,
      bestFor: 'you sell products and want payments and stock handled for you.',
    },
    {
      id: 'booking-system',
      name: 'Booking system',
      summary: 'Customers book a time, and you see it all in one calendar.',
      price: 5000,
      from: true,
      care: 'system',
      includes: [
        'Services, staff and time slots',
        'Online booking with confirmations',
        'Reminder emails before each booking',
        'Admin portal with a bookings calendar',
      ],
      bestFor: 'you run a clinic, salon, studio or classes that take bookings.',
    },
    {
      id: 'member-portal',
      name: 'Member portal',
      summary: 'Members sign in to their own area.',
      price: 5500,
      from: true,
      care: 'system',
      includes: [
        'Sign-in for members or customers',
        'Private pages for each member',
        'Welcome and update emails',
        'Admin portal for members and their access',
      ],
      bestFor: 'customers or staff need to sign in and see their own records.',
    },
    {
      id: 'custom-system',
      name: 'Custom system',
      summary: 'Built around how your business works.',
      price: 5000,
      from: true,
      care: 'system',
      includes: [
        'Stock, quotations and invoices, staff records or rentals, for example',
        'Sign-in for you and your staff',
        'Records saved in a database, with daily backups',
        'Admin portal to run it day to day',
      ],
      bestFor:
        'you run your business on spreadsheets or paper and want it in one place.',
    },
  ],
};

export const MOBILE_APPS: PricingTab = {
  id: 'mobile-app',
  label: 'Mobile apps',
  shortLabel: 'Apps',
  tagline: 'Android and iOS apps',
  noun: 'mobile app',
  blueprint: true,
  note: `${BLUEPRINT_NOTE} Apple and Google charge you for the store accounts: USD 99 a year and USD 25 once.`,
  bundles: [
    {
      id: 'info-app',
      name: 'Info app',
      summary: 'Your menu, catalogue or info in an app.',
      price: 3500,
      from: true,
      care: 'app',
      includes: [
        'Android and iOS from one codebase',
        'Your info, menu or product catalogue',
        'One quick action, such as WhatsApp, call or directions',
        'Push notifications for news and promotions',
        'App Store and Google Play submission',
      ],
      bestFor: 'you want to be on the app stores and send push notifications.',
    },
    {
      id: 'member-app',
      name: 'Booking or loyalty app',
      summary: 'Members sign in, book and collect points.',
      price: 6500,
      from: true,
      care: 'app',
      basedOn: 'info-app',
      includes: [
        'Sign-in for members, with profiles',
        'Bookings with push reminders, or points and rewards',
        'Admin portal for members, bookings or rewards',
      ],
      bestFor: 'customers come back often and you want them in your app.',
    },
    {
      id: 'ordering-app',
      name: 'Ordering app',
      summary: 'Customers order and pay in the app.',
      price: 9500,
      from: true,
      care: 'app',
      basedOn: 'info-app',
      includes: [
        'Sign-in for customers',
        'Cart and checkout with online payments',
        'Order status updates',
        'Admin portal for orders and products',
      ],
      runningCost: GATEWAY_FEES,
      bestFor: 'customers order from you often and should pay in the app.',
    },
  ],
};

export const AUTOMATION: PricingTab = {
  id: 'automation',
  label: 'Automation',
  shortLabel: 'Automate',
  tagline: 'Reports, WhatsApp orders, chatbots and approvals',
  noun: 'automation',
  note: 'Each one works with the tools you already use, and is tested with your real data before it goes live.',
  link: { href: '/templates/automation', label: 'Try all four' },
  bundles: [
    {
      id: 'reports',
      name: 'Reports and alerts',
      summary: 'A summary of your business, sent to you.',
      price: 650,
      from: true,
      care: 'automation',
      includes: [
        'Your sales, stock or bookings, summed up on a schedule',
        'Sent to your WhatsApp or email',
        'Alerts when something needs attention',
      ],
    },
    {
      id: 'whatsapp-orders',
      name: 'WhatsApp orders',
      summary: 'Orders on WhatsApp, saved for you.',
      price: 1200,
      from: true,
      care: 'automation',
      includes: [
        'Each order saved to Google Sheets',
        'An instant confirmation to the customer',
        'Your staff told about each new order',
        'WhatsApp Business Platform set up. Meta must approve your number',
      ],
      runningCost: 'Message fees, paid by you to Meta',
    },
    {
      id: 'chatbot',
      name: 'Chatbot',
      summary: 'Answers your common questions, day and night.',
      price: 1500,
      from: true,
      care: 'automation',
      includes: [
        'On your website or WhatsApp',
        'Answers from your prices, hours and FAQ',
        'Hands over to you when it cannot help',
      ],
      runningCost: 'AI usage fees, paid by you to the provider',
    },
    {
      id: 'approvals',
      name: 'Approval flows',
      summary: 'Requests reach the right person, and get answered.',
      price: 1800,
      from: true,
      care: 'automation',
      includes: [
        'Leave, claims or purchase requests',
        'Approve or reject in one tap',
        'A record of every step',
      ],
    },
  ],
};

export const PRICING_TABS = [
  WEBSITES,
  SYSTEMS,
  MOBILE_APPS,
  AUTOMATION,
];

export const startingPriceOf = (tab: PricingTab) =>
  Math.min(...tab.bundles.map((bundle) => bundle.price));

/** Site types: template categories. */
export const SITE_TYPES = [
  { id: 'ecommerce', label: 'Shop' },
  { id: 'food', label: 'Café & restaurant' },
  { id: 'services', label: 'Clinic, salon & studio' },
  { id: 'company', label: 'Company' },
  { id: 'personal', label: 'Freelancer & creative' },
] as const;

/** A full store with checkout and an Admin portal. */
const TEMPLATE_KINDS = [{ id: 'store', label: 'Online store' }] as const;

/** Demos of a service, listed with the templates. */
const DEMO_KINDS = [{ id: 'automation', label: 'Automation' }] as const;

export const TEMPLATE_CATEGORIES = [
  ...SITE_TYPES,
  ...TEMPLATE_KINDS,
  ...DEMO_KINDS,
];

export const templateCategoryLabel = (id: string) =>
  TEMPLATE_CATEGORIES.find((category) => category.id === id)?.label ??
  'Template';

export const isStoreTemplate = (category: string) => category === 'store';

/** The number in a template's pages label: "One page" or "5 pages". */
export function pageCount(pages?: string | null): number | null {
  if (!pages) return null;
  if (/^one\b/i.test(pages.trim())) return 1;
  const count = Number.parseInt(pages, 10);
  return Number.isFinite(count) ? count : null;
}

export const countLabel = (count: number, unit: string) =>
  `${count} ${unit}${count === 1 ? '' : 's'}`;

export function careForTemplate(template: {
  category: string;
  pages?: string | null;
}): CareTier {
  if (isStoreTemplate(template.category)) return CARE.store;
  return (pageCount(template.pages) ?? 1) > 1 ? CARE.business : CARE.starter;
}

export const TEMPLATE_INCLUDES = [
  'Your logo, colours and content',
  'Works well on phones',
  'Launched on your domain',
  'Lifetime bug fixes',
];

export interface DemoCard {
  id: string;
  name: string;
  category: (typeof DEMO_KINDS)[number]['id'];
  description: string;
  highlights: string[];
  /** How many demos it holds, for the card's "Automation · 4 demos". */
  demos: number;
  image: string;
  href: string;
  price: number;
  /** The pricing tab "See price" opens. */
  tab: string;
}

export const DEMO_CARDS: DemoCard[] = [
  {
    id: 'automation',
    name: 'Automation',
    category: 'automation',
    description:
      'Send a WhatsApp order, ask a chatbot, approve a leave request and get a morning report, all simulated.',
    highlights: [
      'Four automations you can press and try',
      'Works with WhatsApp, Google Sheets and email',
      'Each one priced on the Automation tab',
    ],
    demos: 4,
    image: '/demos/automation.jpg',
    href: '/templates/automation',
    price: startingPriceOf(AUTOMATION),
    tab: AUTOMATION.id,
  },
];
