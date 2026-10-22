import { Globe, Smartphone, Workflow, type LucideIcon } from 'lucide-react';
import { formatRM } from '@lib/format';

const CTA_LABEL = 'Get Quote';

const WEBSITE_BASE_PRICE = 799;

export type ServiceIcon = 'web' | 'mobile' | 'automation';

export const SERVICE_ICONS: Record<ServiceIcon, LucideIcon> = {
  web: Globe,
  mobile: Smartphone,
  automation: Workflow,
};

export interface EstimatorOption {
  id: string;
  name: string;
  description?: string;
  price: number;
  /** Where the feature runs after launch and who pays for it. */
  runningCost?: string;
}

export interface PackageOption {
  id: string;
  name: string;
  summary: string;
  /** Full one-time price. Custom packages have none and are quoted. */
  price?: number;
  includes: string[];
  /** Package id whose list this one builds on ("Everything in …, plus"). */
  includesFrom?: string;
  /** Completes "Choose this if …" on the package card. */
  bestFor?: string;
  custom?: boolean;
}

export interface CustomPackage {
  id: string;
  name: string;
  /** Effort-based range; the final price is confirmed after scoping. */
  from: number;
  to: number;
  includes: string[];
  runningCost: string;
}

export interface CustomFeature {
  id: string;
  name: string;
  description: string;
  from: number;
  to: number;
  /** Custom builds that already include this feature. */
  includedIn?: string[];
}

export interface CmsTab {
  id: string;
  name: string;
  group: 'pages' | 'sell' | 'show';
  price: number;
}

/** `price` is the dashboard, which every CMS includes; tabs add to it. */
export interface CmsConfig {
  name: string;
  description: string;
  price: number;
  dashboard: string;
  groups: Record<CmsTab['group'], string>;
  runningCost: string;
  tabs: CmsTab[];
}

/** Required for every project: everything runs on the developer's accounts. */
export interface CarePlan {
  name: string;
  summary: string;
  monthlyPrice: number;
  /** Added when the project needs a database (CMS, payments, custom builds). */
  databasePrice?: number;
  databaseIncludes?: string[];
  /** Confirmed in the project quote; monthlyPrice is the starting price. */
  quoted?: boolean;
  includes: string[];
}

export interface EstimatorConfig {
  id: string;
  label: string;
  packages: PackageOption[];
  addOns: EstimatorOption[];
  cms?: CmsConfig;
  multiLanguage?: boolean;
  quoteOptions: CustomFeature[];
  customPackages: CustomPackage[];
  carePlan: CarePlan;
  /** Prices stay internal; the page and messages show "By quotation". */
  quoteOnly?: boolean;
  promoTarget: string;
  messageIntro: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: ServiceIcon;
  price?: string;
  cta?: { label: string; href: string };
  highlights?: string[];
  estimator?: EstimatorConfig;
  promoTargets?: PromoTarget[];
}

export interface ServiceGroup {
  heading: string;
  comingSoon?: boolean;
  note?: string;
  items: Service[];
}

export interface PromoTarget {
  id: string;
  name: string;
  label: string;
}

export const MOBILE_APP_PROMO_TARGET: PromoTarget = {
  id: 'mobile-app-estimate',
  name: 'Mobile app estimate',
  label: 'Mobile app estimate',
};

export const WEBSITE_PROMO_TARGET: PromoTarget = {
  id: 'website-estimate',
  name: 'Website estimate',
  label: 'Website estimate',
};

const MAINTENANCE_PLAN = 'Maintenance Plan';
/** Yearly billing charges 10 months, so 2 months are free. */
const YEARLY_MONTHS = 10;
const DATABASE_PRICE = 50;

const CMS_RUNNING_COST = `Adds a database to the ${MAINTENANCE_PLAN}: +${formatRM(DATABASE_PRICE)}/month`;
const INCLUDED_IN_CARE = `Included in the ${MAINTENANCE_PLAN}`;
const GATEWAY_RUNNING_COST =
  'Payment gateway fees per transaction, paid to the provider';

export const CARE_RESPONSE =
  'Replies within 1 working day, and same-day help when your site or app is down, where possible.';

export const PAYMENT_TERMS =
  'A 40% deposit to start, and 60% when the site or app goes live';

const CMS_NAME = 'Content Management System (CMS)';
const OTHER_UPDATES = 'Other changes are charged separately.';

export const WEBSITE_CMS: CmsConfig = {
  name: CMS_NAME,
  description: `Update your site yourself from a private dashboard. ${OTHER_UPDATES}`,
  price: 200,
  dashboard: 'Dashboard & visitor stats',
  groups: { pages: 'Your pages', sell: 'What you sell', show: 'What you show' },
  runningCost: CMS_RUNNING_COST,
  tabs: [
    { id: 'content', name: 'Text & photos', group: 'pages', price: 200 },
    { id: 'news', name: 'News & promotions', group: 'pages', price: 250 },
    {
      id: 'products',
      name: 'Products or menu with prices',
      group: 'sell',
      price: 250,
    },
    {
      id: 'gallery',
      name: 'Photo gallery or portfolio',
      group: 'show',
      price: 150,
    },
  ],
};

/** `null` means no CMS; an empty list is the dashboard on its own. */
export function cmsPrice(cms: CmsConfig, tabIds: string[] | null): number {
  if (!tabIds) return 0;
  return (
    cms.price +
    cms.tabs
      .filter((tab) => tabIds.includes(tab.id))
      .reduce((sum, tab) => sum + tab.price, 0)
  );
}

export function cmsLabel(cms: CmsConfig, tabIds: string[]): string {
  const names = cms.tabs
    .filter((tab) => tabIds.includes(tab.id))
    .map((tab) => tab.name);
  return `CMS (dashboard${names.length ? ` + ${names.join(', ')}` : ''})`;
}

const PWA_ADDON: EstimatorOption = {
  id: 'pwa',
  name: 'Installable app (PWA)',
  description:
    'A home-screen icon on phones. Opens like an app and works on a weak signal.',
  price: 500,
  runningCost: 'No running cost',
};

const WHATSAPP_CART: EstimatorOption = {
  id: 'whatsapp-cart',
  name: 'WhatsApp cart',
  description:
    'Customers send their full order to your WhatsApp in one tap. No online payment.',
  price: 50,
  runningCost: 'No running cost',
};

export const TEMPLATE_PROMO_TARGET: PromoTarget = {
  id: 'templates',
  name: 'Templates',
  label: 'Ready-made templates',
};

export const TEMPLATE_CATEGORIES = [
  {
    id: 'ecommerce',
    label: 'WhatsApp shop',
    description: 'Cosmetics, boutiques and online shops with a WhatsApp cart',
  },
  {
    id: 'company',
    label: 'Company profile',
    description: 'Corporate sites and company portfolios',
  },
  {
    id: 'food',
    label: 'Food & beverage',
    description: 'Cafés, restaurants and home bakers',
  },
  {
    id: 'services',
    label: 'Services',
    description: 'Salons, clinics and workshops',
  },
  {
    id: 'personal',
    label: 'Personal portfolio',
    description: 'Freelancers and creatives',
  },
] as const;

export const TEMPLATE_SUMMARY =
  'Every template is set up with your logo, colours and content, and launched on your domain. Lifetime bug fixes included.';

export const TEMPLATE_INCLUDES = [
  'Your logo, colours and content',
  'Mobile-friendly design',
  'Launched on your domain',
  'Lifetime bug fixes',
];

export const TEMPLATE_SECTION = {
  name: 'Extra section',
  description:
    'Sections the template does not have, such as FAQ, team or testimonials.',
  price: 50,
  max: 10,
};

export const MULTI_LANGUAGE = {
  name: 'Multi-Language',
  description:
    'A language switch on your site. Your main language is included; you provide the translations.',
  pricePerLanguage: 100,
  runningCost: 'No running cost',
  languages: [
    'Bahasa Melayu',
    'English',
    'Chinese (Simplified)',
    'Chinese (Traditional)',
    'Tamil',
    'Arabic',
    'Indonesian',
    'Thai',
    'Vietnamese',
    'Japanese',
    'Korean',
    'Hindi',
    'French',
    'German',
    'Spanish',
  ],
};

const ONLINE_PAYMENTS_RANGE = { from: 1500, to: 2500 };

/** Quoted, never fixed: gateway work varies by provider and checkout flow. */
export const TEMPLATE_PAYMENTS = {
  name: 'Online payments',
  description:
    'Customers pay at checkout by FPX, card or e-wallet. Includes one payment gateway, payment confirmation and order emails.',
  ...ONLINE_PAYMENTS_RANGE,
  requires: WHATSAPP_CART.id,
  runningCost: GATEWAY_RUNNING_COST,
};

export const TEMPLATE_FEATURES: (EstimatorOption & {
  /** Categories whose templates already include this feature. */
  includedIn?: string[];
})[] = [{ ...WHATSAPP_CART, includedIn: ['ecommerce'] }, PWA_ADDON];

export const WEBSITE_ESTIMATOR: EstimatorConfig = {
  id: 'website',
  label: 'Website',
  packages: [
    {
      id: 'standard',
      name: 'Standard',
      summary: 'A one-page site to get you online.',
      price: WEBSITE_BASE_PRICE,
      includes: [
        '1 page with unlimited sections',
        'Custom design for your brand',
        'Mobile-friendly design',
        'Contact form, WhatsApp button and Google Maps',
        'Basic SEO and Google Analytics',
        'Launched on your domain',
      ],
      bestFor: 'you need a simple site so customers can find and contact you.',
    },
    {
      id: 'advanced',
      name: 'Advanced',
      summary: 'A full business site with room to grow.',
      price: WEBSITE_BASE_PRICE + 600,
      includesFrom: 'standard',
      includes: ['Up to 7 pages with unlimited sections'],
      bestFor:
        'you have several services or products, each needing its own page.',
    },
    {
      id: 'custom',
      name: 'Custom',
      summary: 'Stores, bookings and portals built around your business.',
      custom: true,
      includes: [
        'Online store, booking system or member portal',
        'Sign-in for customers or staff',
        'Admin dashboard',
        'Online payments (FPX, card, e-wallet)',
        'Any number of pages',
      ],
      bestFor:
        'customers or staff need to sign in, book, order or pay, and those records must be saved.',
    },
  ],
  addOns: [WHATSAPP_CART, PWA_ADDON],
  cms: WEBSITE_CMS,
  multiLanguage: true,
  quoteOptions: [
    {
      id: 'admin-dashboard',
      name: 'Admin dashboard',
      description: 'Manage users, orders, bookings or other records.',
      from: 1500,
      to: 3500,
      includedIn: ['online-store', 'booking-system', 'member-portal'],
    },
    {
      id: 'payments',
      name: 'Online payments',
      description: 'FPX, card or e-wallet, as deposits or full payments.',
      ...ONLINE_PAYMENTS_RANGE,
      includedIn: ['online-store'],
    },
    {
      id: 'integrations',
      name: 'Custom integrations or workflow',
      description: 'Connect tools you already use, or automate a process.',
      from: 800,
      to: 3000,
    },
    {
      id: 'multilingual',
      name: 'Multiple languages',
      description: 'Extra language versions. You provide the translations.',
      from: 600,
      to: 1500,
    },
    {
      id: 'pwa',
      name: 'Installable app (PWA)',
      description: 'Home-screen icon, works offline, push notifications.',
      from: 500,
      to: 1000,
    },
    {
      id: 'large-site',
      name: 'Large or content-heavy site',
      description: 'Many pages or long content.',
      from: 1000,
      to: 4000,
    },
  ],
  customPackages: [
    {
      id: 'online-store',
      name: 'Online store',
      from: 5999,
      to: 9999,
      includes: [
        'Product catalogue with categories',
        'Cart and online checkout',
        'Order email notifications',
        'Admin dashboard for products and orders',
      ],
      runningCost: GATEWAY_RUNNING_COST,
    },
    {
      id: 'booking-system',
      name: 'Booking system',
      from: 2499,
      to: 4999,
      includes: [
        'Services, staff and time slots',
        'Online booking with confirmations',
        'Admin calendar for bookings',
      ],
      runningCost: INCLUDED_IN_CARE,
    },
    {
      id: 'member-portal',
      name: 'Member or customer portal',
      from: 2999,
      to: 5999,
      includes: [
        'Customer or member sign-in',
        'Private pages for each user',
        'Admin dashboard for users and content',
      ],
      runningCost: INCLUDED_IN_CARE,
    },
  ],
  carePlan: {
    name: MAINTENANCE_PLAN,
    summary: 'Hosting, SSL and security updates.',
    monthlyPrice: 49,
    databasePrice: DATABASE_PRICE,
    includes: ['Hosting and SSL certificate', 'Security and software updates'],
    databaseIncludes: ['Database hosting', 'Daily backups, kept for 7 days'],
  },
  promoTarget: WEBSITE_PROMO_TARGET.id,
  messageIntro: "Hi Haziq, I'd like a quote for this website build.",
};

export const MOBILE_APP_ESTIMATOR: EstimatorConfig = {
  id: 'mobile-app',
  label: 'Mobile app',
  packages: [
    {
      id: 'custom',
      name: 'Mobile app',
      summary: 'Android and iOS apps, quoted to what you need.',
      custom: true,
      includes: [
        'Android and iOS from one codebase',
        'Custom design for your brand',
        'Backend and admin panel when needed',
        'Push notifications',
        'Tested on real devices',
        'App Store and Google Play submission',
      ],
      bestFor:
        'you must be on the App Store and Google Play, or need phone features like the camera or GPS. Only need a home-screen icon? A website with the PWA add-on costs much less.',
    },
  ],
  addOns: [],
  quoteOptions: [
    {
      id: 'accounts',
      name: 'User sign-in and accounts',
      description: 'Email or phone sign-in with a backend for your app data.',
      from: 800,
      to: 1500,
      includedIn: ['loyalty-app', 'booking-app', 'ordering-app'],
    },
    {
      id: 'cms',
      name: 'Content updates (CMS)',
      description:
        'Update text, images or announcements without releasing a new app version.',
      from: 600,
      to: 1500,
    },
    {
      id: 'push',
      name: 'Push notifications',
      description: 'Reminders, promotions or order updates on the phone.',
      from: 300,
      to: 800,
      includedIn: ['info-app', 'booking-app'],
    },
    {
      id: 'admin-dashboard',
      name: 'Admin dashboard',
      description: 'Manage users, orders or activity.',
      from: 2000,
      to: 4000,
      includedIn: ['loyalty-app', 'booking-app', 'ordering-app'],
    },
    {
      id: 'payments',
      name: 'Online payments',
      description: 'FPX, card or e-wallet, as deposits or full payments.',
      from: 2500,
      to: 4000,
      includedIn: ['ordering-app'],
    },
    {
      id: 'user-roles',
      name: 'Multiple user types',
      description: 'Different roles, permissions or connected processes.',
      from: 1500,
      to: 3500,
    },
    {
      id: 'realtime',
      name: 'Chat or real-time features',
      description: 'Messaging, live updates or activity feeds.',
      from: 2000,
      to: 5000,
    },
    {
      id: 'maps-tracking',
      name: 'Maps or live tracking',
      description: 'Locations, routes or live delivery tracking.',
      from: 2000,
      to: 5000,
    },
    {
      id: 'existing-systems',
      name: 'Connect your existing systems',
      description: 'Link the app to tools or databases you already use.',
      from: 1500,
      to: 5000,
    },
  ],
  customPackages: [
    {
      id: 'info-app',
      name: 'Info or catalogue app',
      from: 2999,
      to: 4999,
      includes: [
        'Your info, menu or product catalogue',
        'One quick action, such as WhatsApp, call or directions',
        'Push notifications for news and promotions',
      ],
      runningCost: INCLUDED_IN_CARE,
    },
    {
      id: 'loyalty-app',
      name: 'Membership or loyalty app',
      from: 5999,
      to: 9999,
      includes: [
        'Member sign-in and profiles',
        'Points or stamps with rewards',
        'Admin dashboard for members and rewards',
      ],
      runningCost: INCLUDED_IN_CARE,
    },
    {
      id: 'booking-app',
      name: 'Booking app',
      from: 6999,
      to: 11999,
      includes: [
        'Services and time slots',
        'Bookings with push reminders',
        'Admin dashboard to manage bookings',
      ],
      runningCost: INCLUDED_IN_CARE,
    },
    {
      id: 'ordering-app',
      name: 'Ordering app',
      from: 12999,
      to: 19999,
      includes: [
        'Product catalogue and cart',
        'Checkout with a payment gateway',
        'Order status updates',
        'Admin dashboard for orders and products',
      ],
      runningCost: GATEWAY_RUNNING_COST,
    },
  ],
  carePlan: {
    name: MAINTENANCE_PLAN,
    summary:
      'Backend hosting, security updates and new Android and iOS requirements.',
    monthlyPrice: 149,
    quoted: true,
    includes: [
      'Backend and database hosting, if your app has one',
      'Security and software updates',
      'Updates for new Android and iOS requirements',
    ],
  },
  quoteOnly: true,
  promoTarget: MOBILE_APP_PROMO_TARGET.id,
  messageIntro: "Hi Haziq, I'd like a quote for this mobile app build.",
};

export function careMonthly(plan: CarePlan, withDatabase: boolean): number {
  return plan.monthlyPrice + (withDatabase ? (plan.databasePrice ?? 0) : 0);
}

export function careYearly(plan: CarePlan, withDatabase: boolean): number {
  return careMonthly(plan, withDatabase) * YEARLY_MONTHS;
}

export type CareBilling = 'monthly' | 'yearly';

export const CARE_YEARLY_SAVING = Math.round(((12 - YEARLY_MONTHS) / 12) * 100);

/** What the first billing period costs, paid when the project goes live. */
export function careFirstPayment(
  plan: CarePlan,
  withDatabase: boolean,
  billing: CareBilling
): { label: string; amount: number } {
  return billing === 'yearly'
    ? {
        label: `${plan.name} (first year)`,
        amount: careYearly(plan, withDatabase),
      }
    : {
        label: `${plan.name} (first month)`,
        amount: careMonthly(plan, withDatabase),
      };
}

export function carePrice(
  plan: CarePlan,
  withDatabase: boolean,
  billing: CareBilling
): string {
  return billing === 'yearly'
    ? `${formatRM(careYearly(plan, withDatabase))}/year`
    : `${formatRM(careMonthly(plan, withDatabase))}/month`;
}

/** Lowest fixed package price, for "From" labels; null when quote-only. */
export function startingPriceOf(config: EstimatorConfig): number | null {
  const prices = config.packages.flatMap((pkg) => pkg.price ?? []);
  return prices.length ? Math.min(...prices) : null;
}

export function getServiceGroups(whatsappHref: string): ServiceGroup[] {
  const contact = (message: string) => {
    const url = new URL(whatsappHref);
    url.searchParams.set('text', message);
    return url.toString();
  };
  return [
    {
      heading: 'Build',
      items: [
        {
          id: 'web',
          title: 'Web Development',
          description:
            'A clear online presence, a better way to manage content, or a custom platform for the way your business works. Start with a defined package or scope a larger build together.',
          icon: 'web',
          price: `Starting from ${formatRM(WEBSITE_BASE_PRICE)}`,
          cta: {
            label: CTA_LABEL,
            href: contact(
              "Hi Haziq, I'd like to discuss a website project. Could you help me choose a package?"
            ),
          },
          estimator: WEBSITE_ESTIMATOR,
          promoTargets: [WEBSITE_PROMO_TARGET],
        },
        {
          id: 'mobile-app',
          title: 'Mobile App Development',
          description:
            'Android and iOS apps from one codebase, quoted to what you need.',
          icon: 'mobile',
          price: 'By quotation',
          estimator: MOBILE_APP_ESTIMATOR,
          promoTargets: [MOBILE_APP_PROMO_TARGET],
        },
      ],
    },
    {
      heading: 'Automate',
      items: [
        {
          id: 'automation',
          title: 'Business Automation',
          description:
            'Take repetitive work off your plate: chatbots for your website, WhatsApp or Telegram, approval flows for leave and claims, automated forms and spreadsheets, and reports that send themselves.',
          icon: 'automation',
          highlights: [
            'Website, WhatsApp and Telegram chatbots',
            'Approval flows, forms and spreadsheet automation',
            'Scheduled reports and notifications',
          ],
          cta: {
            label: CTA_LABEL,
            href: contact(
              "Hi Haziq, I'd like to automate part of my business. Can we discuss what's possible?"
            ),
          },
        },
      ],
    },
    {
      heading: 'Coaching & Mentoring',
      comingSoon: true,
      note: '',
      items: [],
    },
  ];
}

// Tier and service ids are stored in promo_codes.eligible_targets, so keep them stable.
export function promoTargetsOf(service: Service): PromoTarget[] {
  if (service.promoTargets?.length) return service.promoTargets;
  return [{ id: service.id, name: service.title, label: service.title }];
}

export function estimatorOf(service: Service): EstimatorConfig | null {
  return service.estimator ?? null;
}

export function getPromoTargets(): PromoTarget[] {
  return [
    ...getServiceGroups('https://wa.me/').flatMap((group) =>
      group.items.flatMap(promoTargetsOf)
    ),
    TEMPLATE_PROMO_TARGET,
  ];
}
