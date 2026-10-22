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

export interface AddOn {
  id: string;
  name: string;
  description: string;
  /** Fixed price, or the low end of a quoted range when `priceTo` is set. */
  price: number;
  priceTo?: number;
  /** Where the feature runs after launch and who pays for it. */
  runningCost?: string;
  /** Site types it is offered for; every site when omitted. */
  siteTypes?: SiteType[];
  /** Site types whose templates already include it. */
  includedIn?: SiteType[];
  /** Another add-on it needs, which is added along with it. */
  requires?: string;
  /** Custom builds that already include it. */
  includedInBuilds?: string[];
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

export interface CmsTab {
  id: string;
  name: string;
  group: 'pages' | 'sell' | 'show';
  price: number;
  siteTypes?: SiteType[];
}

/** The admin dashboard add-on: `price` is the base, and each tab adds to it. */
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
  /** Added when the project needs a database (admin dashboard, payments, custom builds). */
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
  addOns: AddOn[];
  cms?: CmsConfig;
  multiLanguage?: boolean;
  /** Offered with a custom build; websites also get the every-site add-ons. */
  customAddOns: AddOn[];
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
  /** Running costs and what the client must do, in plain words. */
  note?: string;
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

const CARE_PLAN = 'Care Plan';
/** Yearly billing charges 10 months, so 2 months are free. */
const YEARLY_MONTHS = 10;
const DATABASE_PRICE = 50;

const CMS_RUNNING_COST = `Adds a database to the ${CARE_PLAN}: +${formatRM(DATABASE_PRICE)}/month`;
const INCLUDED_IN_CARE = `Included in the ${CARE_PLAN}`;
const GATEWAY_RUNNING_COST =
  'Payment gateway fees per transaction, paid to the provider';

export const CARE_RESPONSE =
  'Replies within 1 working day, and same-day help when your site or app is down, where possible.';

export const PAYMENT_TERMS =
  'A 40% deposit to start, and 60% when the site or app goes live';

const ADMIN_DASHBOARD = 'Admin dashboard';

export const WEBSITE_CMS: CmsConfig = {
  name: ADMIN_DASHBOARD,
  description: 'Update your site yourself, and see how many people visit it.',
  price: 200,
  dashboard: 'Visitor stats',
  groups: { pages: 'Your pages', sell: 'What you sell', show: 'What you show' },
  runningCost: CMS_RUNNING_COST,
  tabs: [
    { id: 'content', name: 'Text & photos', group: 'pages', price: 200 },
    { id: 'news', name: 'News & promotions', group: 'pages', price: 250 },
    {
      id: 'jobs',
      name: 'Job openings',
      group: 'pages',
      price: 200,
      siteTypes: ['company'],
    },
    {
      id: 'products',
      name: 'Products or menu with prices',
      group: 'sell',
      price: 250,
      siteTypes: ['ecommerce', 'food', 'services'],
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
  return `${cms.name} (${names.length ? names.join(', ') : cms.dashboard.toLowerCase()})`;
}

const REQUEST_ONLY = 'A request only: you confirm each one.';

const ONLINE_PAYMENTS: AddOn = {
  id: 'online-payments',
  name: 'Online payments',
  description:
    'Customers pay by FPX, card or e-wallet, with one payment gateway and payment emails. The final price is confirmed in a quote.',
  price: 1500,
  priceTo: 2500,
  runningCost: GATEWAY_RUNNING_COST,
};

/** Every add-on for Standard, Advanced and templates, tagged by site type. */
export const ADD_ONS: AddOn[] = [
  {
    id: 'whatsapp-cart',
    name: 'WhatsApp cart',
    description:
      'Customers send their full order to your WhatsApp in one tap. No online payment.',
    price: 50,
    siteTypes: ['ecommerce', 'food'],
    includedIn: ['ecommerce'],
  },
  {
    id: 'product-options',
    name: 'Product options',
    description:
      'Customers pick a size, colour or variant. Comes with the WhatsApp cart.',
    price: 150,
    siteTypes: ['ecommerce'],
    requires: 'whatsapp-cart',
  },
  {
    id: 'delivery-fee',
    name: 'Delivery fee by area',
    description:
      "The delivery fee for the customer's area is added to the order. Comes with the WhatsApp cart.",
    price: 150,
    siteTypes: ['ecommerce'],
    requires: 'whatsapp-cart',
  },
  { ...ONLINE_PAYMENTS, siteTypes: ['ecommerce'], requires: 'whatsapp-cart' },
  {
    id: 'table-reservation',
    name: 'Table reservation request',
    description: `Customers send the date, time and number of guests to your WhatsApp. ${REQUEST_ONLY}`,
    price: 100,
    siteTypes: ['food'],
  },
  {
    id: 'menu-qr',
    name: 'Menu QR code',
    description: 'A print-ready QR code for your tables that opens your menu.',
    price: 50,
    siteTypes: ['food'],
  },
  {
    id: 'appointment-request',
    name: 'Appointment request',
    description: `Customers pick a service, date and time and send it to your WhatsApp. ${REQUEST_ONLY} For a full booking calendar, choose Custom.`,
    price: 100,
    siteTypes: ['services'],
  },
  {
    id: 'quotation-form',
    name: 'Quotation request form',
    description:
      'A detailed quote request form, sent to your WhatsApp or email.',
    price: 100,
    siteTypes: ['company'],
  },
  {
    id: 'pwa',
    name: 'Installable app (PWA)',
    description:
      'A home-screen icon on phones. Opens like an app and works on a weak signal.',
    price: 300,
  },
];

export const addOnById = (id: string) =>
  ADD_ONS.find((addOn) => addOn.id === id);

/** Every-site items, plus those tagged with this site type. */
export const offeredFor = (
  item: { siteTypes?: readonly SiteType[] },
  siteType: SiteType | null
) =>
  !item.siteTypes || (siteType !== null && item.siteTypes.includes(siteType));

export function toggleAddOn(
  ids: string[],
  id: string,
  alreadyIncluded: string[] = []
): string[] {
  if (ids.includes(id))
    return ids.filter(
      (item) => item !== id && addOnById(item)?.requires !== id
    );
  const requires = addOnById(id)?.requires;
  return requires &&
    !ids.includes(requires) &&
    !alreadyIncluded.includes(requires)
    ? [...ids, requires, id]
    : [...ids, id];
}

export const TEMPLATE_PROMO_TARGET: PromoTarget = {
  id: 'templates',
  name: 'Templates',
  label: 'Ready-made templates',
};

/** Site types: template categories, and what filters the add-ons. */
export const SITE_TYPES = [
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

export type SiteType = (typeof SITE_TYPES)[number]['id'];

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
      price: WEBSITE_BASE_PRICE + 800,
      includesFrom: 'standard',
      includes: [
        'Up to 7 pages with unlimited sections',
        'Full SEO: titles, descriptions and a sitemap for every page',
        'Google Search Console setup',
        'Link previews when shared on WhatsApp and social media',
      ],
      bestFor:
        'you have several services or products, each needing its own page.',
    },
    {
      id: 'custom',
      name: 'Custom',
      summary: 'Stores, bookings and portals built around your business.',
      custom: true,
      includesFrom: 'advanced',
      includes: [
        'Online store, booking system or member portal',
        'Sign-in for customers or staff',
        `${ADMIN_DASHBOARD} for orders, bookings and members`,
        'Any number of pages',
      ],
      bestFor:
        'customers or staff need to sign in, book, order or pay, and those records must be saved.',
    },
  ],
  addOns: ADD_ONS,
  cms: WEBSITE_CMS,
  multiLanguage: true,
  customAddOns: [
    { ...ONLINE_PAYMENTS, includedInBuilds: ['online-store'] },
    {
      id: 'integrations',
      name: 'Custom integrations or workflow',
      description: 'Connect tools you already use, or automate a process.',
      price: 800,
      priceTo: 3000,
    },
    {
      id: 'large-site',
      name: 'Large or content-heavy site',
      description: 'Many pages or long content.',
      price: 1000,
      priceTo: 4000,
    },
  ],
  customPackages: [
    {
      id: 'online-store',
      name: 'Online store',
      from: 11999,
      to: 24999,
      includes: [
        'Product catalogue with categories',
        'Cart and checkout with online payments',
        'Order email notifications',
        `${ADMIN_DASHBOARD} for products and orders`,
      ],
      runningCost: GATEWAY_RUNNING_COST,
    },
    {
      id: 'booking-system',
      name: 'Booking system',
      from: 8999,
      to: 16999,
      includes: [
        'Services, staff and time slots',
        'Online booking with confirmations',
        `${ADMIN_DASHBOARD} with a bookings calendar`,
      ],
      runningCost: INCLUDED_IN_CARE,
    },
    {
      id: 'member-portal',
      name: 'Member portal',
      from: 9999,
      to: 19999,
      includes: [
        'Sign-in for members or customers',
        'Private pages for each member',
        `${ADMIN_DASHBOARD} for members and content`,
      ],
      runningCost: INCLUDED_IN_CARE,
    },
  ],
  carePlan: {
    name: CARE_PLAN,
    summary: 'Hosting, SSL and security updates.',
    monthlyPrice: 49,
    databasePrice: DATABASE_PRICE,
    includes: ['Hosting and SSL certificate', 'Security and software updates'],
    databaseIncludes: ['Database hosting', 'Daily backups, kept for 7 days'],
  },
  promoTarget: WEBSITE_PROMO_TARGET.id,
  messageIntro: "Hi Haziq, I'd like to order this website.",
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
        `Backend and ${ADMIN_DASHBOARD.toLowerCase()} when needed`,
        'Push notifications',
        'Tested on real devices',
        'App Store and Google Play submission',
      ],
      bestFor:
        'you must be on the App Store and Google Play, or need phone features like the camera or GPS. Only need a home-screen icon? A website with the PWA add-on costs much less.',
    },
  ],
  addOns: [],
  customAddOns: [
    {
      id: 'accounts',
      name: 'Sign-in for customers or staff',
      description: "Email or phone sign-in, and each user's data is saved.",
      price: 800,
      priceTo: 1500,
      includedInBuilds: ['loyalty-app', 'booking-app', 'ordering-app'],
    },
    {
      id: 'push',
      name: 'Push notifications',
      description: 'Reminders, promotions or order updates on the phone.',
      price: 300,
      priceTo: 800,
      includedInBuilds: ['info-app', 'booking-app'],
    },
    {
      id: 'admin-dashboard',
      name: ADMIN_DASHBOARD,
      description:
        'Update your app content without a new release, and manage users, orders or bookings.',
      price: 600,
      priceTo: 4000,
      includedInBuilds: ['loyalty-app', 'booking-app', 'ordering-app'],
    },
    {
      id: 'payments',
      name: 'Online payments',
      description: 'FPX, card or e-wallet, as deposits or full payments.',
      price: 2500,
      priceTo: 4000,
      includedInBuilds: ['ordering-app'],
    },
    {
      id: 'user-roles',
      name: 'Multiple user types',
      description: 'Different roles, permissions or connected processes.',
      price: 1500,
      priceTo: 3500,
    },
    {
      id: 'realtime',
      name: 'Chat or real-time features',
      description: 'Messaging, live updates or activity feeds.',
      price: 2000,
      priceTo: 5000,
    },
    {
      id: 'maps-tracking',
      name: 'Maps or live tracking',
      description: 'Locations, routes or live delivery tracking.',
      price: 2000,
      priceTo: 5000,
    },
    {
      id: 'existing-systems',
      name: 'Connect your existing systems',
      description: 'Link the app to tools or databases you already use.',
      price: 1500,
      priceTo: 5000,
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
        'Sign-in for members, with profiles',
        'Points or stamps with rewards',
        `${ADMIN_DASHBOARD} for members and rewards`,
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
        `${ADMIN_DASHBOARD} for bookings`,
      ],
      runningCost: INCLUDED_IN_CARE,
    },
    {
      id: 'ordering-app',
      name: 'Ordering app',
      from: 12999,
      to: 19999,
      includes: [
        'Product catalogue',
        'Cart and checkout with online payments',
        'Order status updates',
        `${ADMIN_DASHBOARD} for orders and products`,
      ],
      runningCost: GATEWAY_RUNNING_COST,
    },
  ],
  carePlan: {
    name: CARE_PLAN,
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

/** The first billing period, paid when the project goes live. */
export function careFirstPayment(
  plan: CarePlan,
  withDatabase: boolean,
  billing: CareBilling
): { period: 'month' | 'year'; amount: number } {
  return billing === 'yearly'
    ? { period: 'year', amount: careYearly(plan, withDatabase) }
    : { period: 'month', amount: careMonthly(plan, withDatabase) };
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
            'Take repetitive work off your plate: WhatsApp orders that save themselves, chatbots for your website, WhatsApp or Telegram, approval flows for leave and claims, automated forms and spreadsheets, and reports that send themselves.',
          icon: 'automation',
          highlights: [
            'WhatsApp orders saved to your admin dashboard or Google Sheets automatically, with a confirmation sent to the customer',
            'Website, WhatsApp and Telegram chatbots',
            'Approval flows, forms and spreadsheet automation',
            'Scheduled reports and notifications',
          ],
          note: 'WhatsApp automation uses the WhatsApp Business Platform: Meta must approve your number, and its message fees are paid by you to Meta. In most cases you can keep using the WhatsApp Business app on the same number. Running costs are confirmed in your quote.',
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
