import { Globe, Smartphone, Workflow, type LucideIcon } from 'lucide-react';
import { formatRM } from '@lib/format';

const CTA_LABEL = 'Get Quote';

const WEBSITE_BASE_PRICE = 800;

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
  careTier?: CareTierId;
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

/** The Admin portal add-on: `price` is the base, and each tab adds to it. */
export interface CmsConfig {
  name: string;
  description: string;
  price: number;
  dashboard: string;
  groups: Record<CmsTab['group'], string>;
  runningCost: string;
  tabs: CmsTab[];
}

export interface AdminFeature {
  id: string;
  name: string;
  description: string;
  price: number;
  /** The heart of a build, listed first; other features support several builds. */
  core?: boolean;
  /** Builds it fits; offered with every build when absent. */
  builds?: string[];
  /** Wording for a particular build. */
  variants?: Record<string, { name?: string; description?: string }>;
}

/** The Custom package's Admin portal: a base price plus each feature picked. */
export interface CustomAdminConfig {
  name: string;
  description: string;
  price: number;
  base: string[];
  features: AdminFeature[];
  /** Labelled as suggested for each build; only the client ticks them. */
  suggested: Record<string, string[]>;
}

/** Required for every project: everything runs on the developer's accounts. */
export interface CarePlan {
  name: string;
  summary: string;
  monthlyPrice: number;
  /** Added when the project needs a database (Admin portal, payments, custom builds). */
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
  customAdmin?: CustomAdminConfig;
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

export type CareTierId = 'basic' | 'business' | 'custom';

export interface CareTier {
  id: CareTierId;
  name: string;
  for: string;
  monthlyPrice: number;
  /** Custom builds always run on a database, so it is part of the price. */
  includesDatabase?: boolean;
  /** A starting price; the final one is confirmed in the quote. */
  from?: boolean;
}

/** The Care Plan is priced by how much there is to look after. */
export const CARE_TIERS: Record<CareTierId, CareTier> = {
  basic: {
    id: 'basic',
    name: 'Basic',
    for: 'One-page sites',
    monthlyPrice: 50,
  },
  business: {
    id: 'business',
    name: 'Business',
    for: 'Multi-page sites',
    monthlyPrice: 80,
  },
  custom: {
    id: 'custom',
    name: 'Custom',
    for: 'Stores, bookings and portals',
    monthlyPrice: 200,
    includesDatabase: true,
    from: true,
  },
};

/** Templates: one page is Basic, anything bigger is Business. */
export const careTierForPages = (pages?: string | null): CareTier =>
  /^one\b/i.test(pages ?? '') ? CARE_TIERS.basic : CARE_TIERS.business;

const CMS_RUNNING_COST = `Adds a database to the ${CARE_PLAN}: +${formatRM(DATABASE_PRICE)}/month`;
const INCLUDED_IN_CARE = `Included in the ${CARE_PLAN}`;
export const GATEWAY_RUNNING_COST =
  'Payment gateway fees per transaction, paid to the provider';

export const CARE_RESPONSE =
  'Replies within 1 working day, and same-day help when your site or app is down, where possible.';

export const PAYMENT_TERMS =
  'A 40% deposit to start, and 60% when the site or app goes live';

const ADMIN_PORTAL = 'Admin portal';

export const WEBSITE_CMS: CmsConfig = {
  name: ADMIN_PORTAL,
  description:
    'Update your text, photos and prices yourself, and see how many people visit. To run orders, bookings or members, choose Custom.',
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

export const WEBSITE_CUSTOM_ADMIN: CustomAdminConfig = {
  name: ADMIN_PORTAL,
  description:
    'A back office to run your orders, bookings or members. Pick what it manages, and your staff sign in to use it.',
  price: 4000,
  base: ['Sign-in for you and your staff', 'Overview of the day'],
  features: [
    {
      id: 'products',
      name: 'Products and stock',
      description:
        'Add products, options and photos. Stock goes down as orders come in.',
      price: 4000,
      core: true,
      builds: ['online-store'],
    },
    {
      id: 'orders',
      name: 'Orders and delivery',
      description: 'Order list, packing, delivery status and tracking numbers.',
      price: 4000,
      core: true,
      builds: ['online-store'],
    },
    {
      id: 'promotions',
      name: 'Discount codes and sales',
      description: 'Create codes, flash sales and free-delivery rules.',
      price: 2500,
      core: true,
      builds: ['online-store'],
    },
    {
      id: 'bookings',
      name: 'Bookings calendar',
      description: 'See, move and cancel bookings by day, week or staff.',
      price: 5000,
      core: true,
      builds: ['booking-system'],
    },
    {
      id: 'services',
      name: 'Services and time slots',
      description: 'Edit services, prices, staff and opening hours.',
      price: 2500,
      core: true,
      builds: ['booking-system'],
    },
    {
      id: 'members',
      name: 'Members and access',
      description:
        'Approve members, choose what each can see, and manage their plans.',
      price: 4000,
      core: true,
      builds: ['member-portal'],
    },
    {
      id: 'customers',
      name: 'Customers',
      description: 'Customer list with contact details and their orders.',
      price: 3000,
      // A member portal's members already are its customer list.
      builds: ['online-store', 'booking-system'],
      variants: {
        'booking-system': {
          name: 'Clients',
          description:
            'Client list with contact details, past bookings and notes.',
        },
      },
    },
    {
      id: 'content',
      name: 'Pages, blog and banners',
      description: 'Edit page text, post news and change homepage banners.',
      price: 2500,
      variants: {
        'member-portal': {
          name: 'Member content',
          description: 'Post updates, files and pages only members can see.',
        },
      },
    },
    {
      id: 'reports',
      name: 'Reports and exports',
      description: 'Charts of your records, and CSV exports.',
      price: 4000,
      variants: {
        'online-store': {
          name: 'Sales reports and exports',
          description: 'Sales by day, product or staff, and CSV exports.',
        },
        'booking-system': {
          name: 'Booking reports and exports',
          description:
            'Bookings by day, service or staff, no-shows, and CSV exports.',
        },
        'member-portal': {
          name: 'Member reports and exports',
          description: 'Sign-ups, renewals and activity, and CSV exports.',
        },
      },
    },
    {
      id: 'roles',
      name: 'Staff roles and permissions',
      description: 'Decide what each staff member can see and change.',
      price: 2500,
    },
    {
      id: 'alerts',
      name: 'Staff alerts',
      description: 'Email or WhatsApp alerts when something needs attention.',
      price: 1500,
      variants: {
        'online-store': {
          description: 'Email or WhatsApp alerts for new orders and low stock.',
        },
        'booking-system': {
          description:
            'Email or WhatsApp alerts for new bookings and cancellations.',
        },
        'member-portal': {
          description:
            'Email or WhatsApp alerts for new sign-ups and renewals.',
        },
      },
    },
  ],
  suggested: {
    'online-store': ['products', 'orders'],
    'booking-system': ['bookings', 'services'],
    'member-portal': ['members', 'content'],
  },
};

/** `null` means no Admin portal; an empty list is the base on its own. */
export function adminPrice(
  admin: CustomAdminConfig,
  featureIds: string[] | null
): number {
  if (!featureIds) return 0;
  return (
    admin.price +
    admin.features
      .filter((feature) => featureIds.includes(feature.id))
      .reduce((sum, feature) => sum + feature.price, 0)
  );
}

/** The features offered with a build, in its own wording; without a build, those that fit any. */
export function adminFeaturesFor(
  admin: CustomAdminConfig,
  buildId: string | null
): AdminFeature[] {
  return admin.features
    .filter((feature) =>
      buildId
        ? !feature.builds || feature.builds.includes(buildId)
        : !feature.builds
    )
    .map((feature) => ({
      ...feature,
      ...(buildId ? feature.variants?.[buildId] : undefined),
    }));
}

export function adminLabel(
  admin: CustomAdminConfig,
  featureIds: string[],
  buildId: string | null
): string {
  const names = adminFeaturesFor(admin, buildId)
    .filter((feature) => featureIds.includes(feature.id))
    .map((feature) => feature.name);
  return `${admin.name} (${names.length ? names.join(', ') : 'sign-in and overview'})`;
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
      'Customers pick a size, colour or variant. Adds the WhatsApp cart.',
    price: 150,
    siteTypes: ['ecommerce'],
    requires: 'whatsapp-cart',
  },
  {
    id: 'delivery-fee',
    name: 'Delivery fee by area',
    description:
      "The delivery fee for the customer's area is added to the order. Adds the WhatsApp cart.",
    price: 150,
    siteTypes: ['ecommerce'],
    requires: 'whatsapp-cart',
  },
  {
    id: 'payment-link',
    name: 'Payment link',
    description:
      'After a WhatsApp order, the customer gets a link to pay by FPX, card or e-wallet. No checkout or stock; for a full online store, choose Custom. Adds the WhatsApp cart.',
    price: 500,
    priceTo: 1000,
    runningCost: GATEWAY_RUNNING_COST,
    siteTypes: ['ecommerce', 'food'],
    requires: 'whatsapp-cart',
  },
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
    siteTypes: ['services', 'personal'],
  },
  {
    id: 'quotation-form',
    name: 'Quotation request form',
    description:
      'A detailed quote request form, sent to your WhatsApp or email.',
    price: 100,
    siteTypes: ['company', 'personal'],
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

/** Promo target for one template, next to the all-templates target. */
export const templatePromoTarget = (slug: string) => `template:${slug}`;

/** Site types: template categories, and what filters the add-ons. */
export const SITE_TYPES = [
  {
    id: 'ecommerce',
    label: 'Shop',
    description: 'Boutiques, beauty and home brands taking orders on WhatsApp',
    heading: 'For your shop',
  },
  {
    id: 'food',
    label: 'Café & restaurant',
    description: 'Cafés, restaurants, caterers and home bakers',
    heading: 'For your café or restaurant',
  },
  {
    id: 'services',
    label: 'Clinic, salon & studio',
    description: 'Clinics, salons, studios and workshops that take bookings',
    heading: 'For your clinic, salon or studio',
  },
  {
    id: 'company',
    label: 'Company',
    description: 'Contractors, firms and agencies',
    heading: 'For your company',
  },
  {
    id: 'personal',
    label: 'Freelancer & creative',
    description: 'Freelancers, creatives and personal brands',
    heading: 'For your freelance work',
  },
] as const;

export type SiteType = (typeof SITE_TYPES)[number]['id'];

/** Template kinds beyond the site types: a full store with real checkout. */
export const TEMPLATE_KINDS = [
  {
    id: 'store',
    label: 'Online store',
    description:
      'A full store with checkout, online payments and an Admin portal',
  },
] as const;

export const TEMPLATE_CATEGORIES = [...SITE_TYPES, ...TEMPLATE_KINDS];

export const templateCategoryLabel = (id: string) =>
  TEMPLATE_CATEGORIES.find((category) => category.id === id)?.label ??
  'Template';

export const isStoreTemplate = (category: string) => category === 'store';

/** Store templates run on a database, so they take the Custom care tier. */
export const careTierForTemplate = (template: {
  category: string;
  pages?: string | null;
}): CareTier =>
  isStoreTemplate(template.category)
    ? CARE_TIERS.custom
    : careTierForPages(template.pages);

/** Admin portal features a store template comes with, on top of the base. */
export const STORE_TEMPLATE_ADMIN_INCLUDED = [
  'products',
  'orders',
  'promotions',
];

/** The rest of the Admin portal, sold with a store template at Custom prices. */
export const STORE_TEMPLATE_ADMIN_ADD_ONS: AddOn[] = adminFeaturesFor(
  WEBSITE_CUSTOM_ADMIN,
  'online-store'
)
  .filter((feature) => !STORE_TEMPLATE_ADMIN_INCLUDED.includes(feature.id))
  .map((feature) => ({
    id: `admin-${feature.id}`,
    name: `${ADMIN_PORTAL}: ${feature.name}`,
    description: feature.description,
    price: feature.price,
  }));

/** Other add-ons offered with a store template; payments are included. */
export const STORE_TEMPLATE_ADD_ONS: AddOn[] = [
  {
    id: 'product-builder',
    name: 'Interactive product builder',
    description:
      'A set builder like "Build Your Table Set", made for your own products. The final price is confirmed in a quote.',
    price: 1500,
    priceTo: 3000,
  },
  ...ADD_ONS.filter((addOn) => addOn.id === 'pwa'),
];

export const TEMPLATE_SUMMARY =
  'Every template is set up with your logo, colours and content, and launched on your domain. Lifetime bug fixes included.';

export const TEMPLATE_INCLUDES = [
  'Your logo, colours and content',
  'Mobile-friendly design',
  'Launched on your domain',
  'Lifetime bug fixes',
];

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
      careTier: 'basic',
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
      careTier: 'business',
      includesFrom: 'standard',
      includes: [
        'Up to 5 pages with unlimited sections',
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
      careTier: 'custom',
      includesFrom: 'advanced',
      includes: [
        'Online store, booking system or member portal',
        'Sign-in for customers or staff',
        'Any number of pages',
        `Optional ${ADMIN_PORTAL}, priced by the features you pick`,
      ],
      bestFor:
        'customers or staff need to sign in, book, order or pay, and those records must be saved.',
    },
  ],
  addOns: ADD_ONS,
  cms: WEBSITE_CMS,
  multiLanguage: true,
  customAdmin: WEBSITE_CUSTOM_ADMIN,
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
      id: 'content-loading',
      name: 'Content loading',
      description:
        'We add your products, pages or posts for you when there are a lot of them.',
      price: 1000,
      priceTo: 4000,
    },
  ],
  customPackages: [
    {
      id: 'online-store',
      name: 'Online store',
      from: 12000,
      to: 21000,
      includes: [
        'Product catalogue with categories and options',
        'Cart and checkout with online payments',
        'Delivery options and rates',
        'Order and payment emails',
      ],
      runningCost: GATEWAY_RUNNING_COST,
    },
    {
      id: 'booking-system',
      name: 'Booking system',
      from: 7000,
      to: 12000,
      includes: [
        'Services, staff and time slots',
        'Online booking with confirmations',
        'Reminder emails before each booking',
      ],
      runningCost: INCLUDED_IN_CARE,
    },
    {
      id: 'member-portal',
      name: 'Member portal',
      from: 8000,
      to: 15000,
      includes: [
        'Sign-in for members or customers',
        'Private pages for each member',
        'Welcome and update emails',
      ],
      runningCost: INCLUDED_IN_CARE,
    },
  ],
  carePlan: {
    name: CARE_PLAN,
    summary: 'Hosting, SSL and security updates.',
    monthlyPrice: 50,
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
        `Backend and ${ADMIN_PORTAL.toLowerCase()} when needed`,
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
      name: ADMIN_PORTAL,
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
      from: 3000,
      to: 5000,
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
      from: 6000,
      to: 10000,
      includes: [
        'Sign-in for members, with profiles',
        'Points or stamps with rewards',
        `${ADMIN_PORTAL} for members and rewards`,
      ],
      runningCost: INCLUDED_IN_CARE,
    },
    {
      id: 'booking-app',
      name: 'Booking app',
      from: 7000,
      to: 12000,
      includes: [
        'Services and time slots',
        'Bookings with push reminders',
        `${ADMIN_PORTAL} for bookings`,
      ],
      runningCost: INCLUDED_IN_CARE,
    },
    {
      id: 'ordering-app',
      name: 'Ordering app',
      from: 13000,
      to: 20000,
      includes: [
        'Product catalogue',
        'Cart and checkout with online payments',
        'Order status updates',
        `${ADMIN_PORTAL} for orders and products`,
      ],
      runningCost: GATEWAY_RUNNING_COST,
    },
  ],
  carePlan: {
    name: CARE_PLAN,
    summary:
      'Backend hosting, security updates and new Android and iOS requirements.',
    monthlyPrice: 150,
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

export function careMonthly(
  plan: CarePlan,
  withDatabase: boolean,
  tier?: CareTier
): number {
  const database =
    withDatabase && !tier?.includesDatabase ? (plan.databasePrice ?? 0) : 0;
  return (tier?.monthlyPrice ?? plan.monthlyPrice) + database;
}

export function careYearly(
  plan: CarePlan,
  withDatabase: boolean,
  tier?: CareTier
): number {
  return careMonthly(plan, withDatabase, tier) * YEARLY_MONTHS;
}

export type CareBilling = 'monthly' | 'yearly';

export const CARE_YEARLY_SAVING = Math.round(((12 - YEARLY_MONTHS) / 12) * 100);

/** The first billing period, paid when the project goes live. */
export function careFirstPayment(
  plan: CarePlan,
  withDatabase: boolean,
  billing: CareBilling,
  tier?: CareTier
): { period: 'month' | 'year'; amount: number } {
  return billing === 'yearly'
    ? { period: 'year', amount: careYearly(plan, withDatabase, tier) }
    : { period: 'month', amount: careMonthly(plan, withDatabase, tier) };
}

/** "RM80/month", or "from RM200/month" for a quoted tier. */
export function carePrice(
  plan: CarePlan,
  withDatabase: boolean,
  billing: CareBilling,
  tier?: CareTier
): string {
  const amount =
    billing === 'yearly'
      ? `${formatRM(careYearly(plan, withDatabase, tier))}/year`
      : `${formatRM(careMonthly(plan, withDatabase, tier))}/month`;
  return tier?.from ? `from ${amount}` : amount;
}

/** "Care Plan (Business)". */
export const careName = (plan: CarePlan, tier?: CareTier) =>
  tier ? `${plan.name} (${tier.name})` : plan.name;

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
            'WhatsApp orders saved to your Admin portal or Google Sheets automatically, with a confirmation sent to the customer',
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
