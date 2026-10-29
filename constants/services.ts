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
  'starter' | 'business' | 'store' | 'system' | 'app' | 'automation';

export interface CareTier {
  name: string;
  for: string;
  monthly: number;
  /** A starting price, confirmed in the quote. */
  from?: boolean;
}

export type CareBillingPeriod = 'monthly' | 'yearly';

/** A yearly payment covers ten months instead of twelve. */
export const CARE_YEARLY_MONTHS = 10;
export const CARE_YEARLY_SAVING = 17;

/** Every project needs one to stay online; priced by how much there is to look after. */
export const CARE: Record<CareId, CareTier> = {
  starter: {
    name: 'Starter',
    for: 'Starter website',
    monthly: 30,
  },
  business: {
    name: 'Business',
    for: 'Business website',
    monthly: 50,
  },
  store: { name: 'Store', for: 'Ready-made online store', monthly: 150 },
  system: {
    name: 'System',
    for: 'Systems',
    monthly: 250,
    from: true,
  },
  app: { name: 'App', for: 'Mobile apps', monthly: 150, from: true },
  automation: {
    name: 'Automation',
    for: 'Automation',
    monthly: 100,
    from: true,
  },
};

export const CARE_PLAN = 'Maintenance';

/** The displayed monthly or yearly hosting price. */
export const carePrice = (
  tier: CareTier,
  billing: CareBillingPeriod = 'monthly'
) => {
  const amount = billing === 'yearly' ? careYearly(tier) : tier.monthly;
  return `${tier.from ? 'from ' : ''}${formatRM(amount)}/${
    billing === 'yearly' ? 'year' : 'month'
  }`;
};

export const BUG_FIX_INCLUDE = 'Free bug fixes for life';

export const careYearlySaving = (tier: CareTier) =>
  tier.monthly * (12 - CARE_YEARLY_MONTHS);

export function careYearly(tier: CareTier) {
  return tier.monthly * CARE_YEARLY_MONTHS;
}

export const PAYMENT_TERMS =
  '20% to start, 40% when testing starts, and 40% on completion';

export const GATEWAY_FEES =
  'Payment gateway fees per transaction, paid by you to the provider';

export const AI_USAGE_FEES = 'AI usage fees, paid by you to the provider';

export interface AddOn {
  id: string;
  name: string;
  description: string;
  price: number;
  perLanguage?: boolean;
  /** Listed under AI features. */
  ai?: boolean;
  /** Add-on id ticked along with this one. */
  requires?: string;
}

export const DEFAULT_LANGUAGE = 'English';
export const SITE_LANGUAGES = [
  'English',
  'Malay',
  'Chinese',
  'Tamil',
  'Arabic',
  'Indonesian',
  'Japanese',
  'Korean',
  'Other',
];
export const MAX_EXTRA_LANGUAGES = 3;

export const languageAddOn = (item: AddOn, languages: string[]): AddOn => ({
  ...item,
  name: `${item.name} (${languages.join(', ')})`,
  price: item.price * languages.length,
});

export interface Bundle {
  id: string;
  name: string;
  shortName?: string;
  summary: string;
  /** The full price, or the starting price when `from` is set. */
  price: number;
  from?: boolean;
  recommended?: boolean;
  /** Bundle id whose list this one builds on ("Everything in …, plus"). */
  basedOn?: string;
  includes: string[];
  excludes?: string[];
  includeInfo?: {
    item: string;
    heading: string;
    items: string[];
    note?: string;
  };
  /** A running cost paid to someone else, in plain words. */
  runningCost?: string;
  /** The hosting tier it needs after launch. */
  care?: CareId;
  addOns?: AddOn[];
}

export const includesOf = (bundle: Bundle) =>
  bundle.basedOn ? bundle.includes : [...bundle.includes, BUG_FIX_INCLUDE];

export interface PricingTab {
  id: string;
  label: string;
  /** A shorter name for phones, such as "Apps". */
  shortLabel?: string;
  tagline: string;
  bundles: Bundle[];
  /** One line under the bundles. */
  note?: string;
  link?: { href: string; label: string };
  /** Only fixed prices take promo codes. */
  promoTarget?: string;
  /** "website", "online store", used in the WhatsApp message. */
  noun: string;
  /** Prices are per month, such as maintenance. */
  monthly?: boolean;
  layout?: 'cards' | 'bento' | 'builder' | 'quote';
  /** For tabs quoted per project instead of packages. */
  quote?: { includes: string[]; examples: string; placeholder: string };
  others?: { name: string; summary: string; placeholder: string };
}

const CUSTOM_DESIGN = 'Custom design, not a template';
const CHAT_INTEGRATION = 'WhatsApp/Telegram integration';

const ONLINE_PAYMENT: AddOn = {
  id: 'payment',
  name: 'Online payment',
  description: `A pay-now button for orders or bookings, by FPX, card or e-wallet. The gateway account is in your business name. ${GATEWAY_FEES}.`,
  price: 1000,
};
const PAGE_LIMITS = ['1-page website', 'Up to 6 pages'];

export const WEBSITES: PricingTab = {
  id: 'website',
  label: 'Websites',
  shortLabel: 'Web',
  tagline: 'Ready-made, custom-designed, or a full system',
  noun: 'website',
  promoTarget: WEBSITE_PROMO_TARGET.id,
  note: 'Need something not listed? It is quoted before any work starts.',
  bundles: [
    {
      id: 'starter',
      name: 'Starter',
      summary: 'A one-page website to get found and contacted.',
      price: 800,
      care: 'starter',
      includes: [
        PAGE_LIMITS[0],
        CUSTOM_DESIGN,
        'Mobile responsive',
        'Contact and map buttons',
        'Basic SEO',
      ],
      excludes: ['Content editor (CMS)', CHAT_INTEGRATION],
    },
    {
      id: 'business',
      name: 'Business',
      summary: 'A bigger website you edit yourself.',
      price: 1700,
      recommended: true,
      care: 'business',
      basedOn: 'starter',
      includeInfo: {
        item: CHAT_INTEGRATION,
        heading: CHAT_INTEGRATION,
        items: ['Order forms', 'Booking forms', 'Enquiry forms'],
        note: 'Each one arrives in your WhatsApp or Telegram, so you can reply from your phone.',
      },
      includes: [
        PAGE_LIMITS[1],
        'Basic CMS (text, photos and prices)',
        CHAT_INTEGRATION,
        'On-page SEO for every page',
      ],
      excludes: ['Order and stock management', 'Customer logins'],
      addOns: [ONLINE_PAYMENT],
    },
  ],
};

const alerts = (when: string): AddOn => ({
  id: 'alerts',
  name: 'WhatsApp or Telegram alerts',
  description: `You get a message the moment ${when}. WhatsApp message fees paid by you to Meta; Telegram is free.`,
  price: 500,
});

const aiAssistant = (update: string): AddOn => ({
  id: 'ai-assistant',
  name: 'AI business assistant',
  description: `Messages you each morning on what needs attention, like "${update}", and answers when you ask. WhatsApp message fees paid by you to Meta; Telegram is free.`,
  price: 2500,
  ai: true,
});

export const SYSTEMS: PricingTab = {
  id: 'systems',
  label: 'Systems',
  tagline: 'Pick a system, then the features it needs',
  noun: 'system',
  layout: 'builder',
  others: {
    name: 'Others',
    summary:
      "Need something else? Describe it and I'll reply on WhatsApp with a quote.",
    placeholder:
      'For example: a system for my workshop to track repair jobs, parts used and when customers can collect.',
  },
  bundles: [
    {
      id: 'online-store',
      name: 'Online store',
      summary: 'Customers order and pay on your site.',
      price: 14400,
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
      addOns: [
        {
          id: 'accounts',
          name: 'Customer accounts',
          description: 'Customers sign in, save addresses and see past orders.',
          price: 2000,
        },
        {
          id: 'shipping',
          name: 'Shipping labels and tracking',
          description:
            'Print courier labels and send tracking numbers from the admin portal.',
          price: 3000,
        },
        {
          id: 'loyalty',
          name: 'Loyalty points',
          description: 'Points on every order, redeemed at checkout.',
          price: 3500,
        },
        {
          id: 'reviews',
          name: 'Product reviews',
          description: 'Star ratings and reviews from customers who bought.',
          price: 1500,
        },
        {
          id: 'languages',
          name: 'Extra language',
          description: 'Translated for you.',
          price: 2000,
          perLanguage: true,
        },
        {
          id: 'reports',
          name: 'Sales reports',
          description: 'Sales by day and product, with CSV exports.',
          price: 2000,
        },
        {
          id: 'import',
          name: 'Product import',
          description: 'Up to 500 products loaded from your spreadsheet.',
          price: 1500,
        },
        alerts('a new order is paid'),
        {
          id: 'ai-shopping',
          name: 'AI shopping assistant',
          description:
            'A chat on your store answers questions about products, stock, delivery and orders, and hands over to WhatsApp when unsure.',
          price: 3000,
          ai: true,
        },
        aiAssistant('12 orders yesterday, 2 still to ship'),
      ],
    },
    {
      id: 'booking-system',
      shortName: 'Booking',
      name: 'Booking system',
      summary: 'Customers book a time, and you see it all in one calendar.',
      price: 12900,
      from: true,
      care: 'system',
      includes: [
        'Services, staff and time slots',
        'Online booking with confirmations',
        'Reminder emails before each booking',
        'Admin portal with a bookings calendar',
      ],
      addOns: [
        {
          id: 'deposits',
          name: 'Deposits and online payment',
          description: `Customers pay a deposit or in full by FPX, card or e-wallet. ${GATEWAY_FEES}.`,
          price: 3000,
        },
        {
          id: 'branches',
          name: 'Multiple branches',
          description: 'Separate locations, staff and hours in one system.',
          price: 3000,
        },
        {
          id: 'whatsapp',
          name: 'WhatsApp reminders',
          description:
            'Reminders on WhatsApp before each booking. Message fees paid by you to Meta.',
          price: 1500,
        },
        {
          id: 'packages',
          name: 'Packages and prepaid sessions',
          description: "Sell 5 or 10 session packages and track what's left.",
          price: 3500,
        },
        {
          id: 'accounts',
          name: 'Customer accounts',
          description: 'Customers sign in to see and change their bookings.',
          price: 2000,
        },
        {
          id: 'calendar',
          name: 'Google Calendar sync',
          description:
            "Bookings appear in each staff member's Google Calendar.",
          price: 1500,
        },
        {
          id: 'reports',
          name: 'Booking reports',
          description:
            'Bookings by day, service and staff, no-shows and CSV exports.',
          price: 2000,
        },
        alerts('a new booking comes in'),
        {
          id: 'ai-booking',
          name: 'AI booking assistant',
          description:
            'Customers ask in chat, like "Saturday afternoon with Aina?", and it books a free slot for them.',
          price: 3500,
          ai: true,
        },
        aiAssistant('8 bookings tomorrow, 2 not paid yet'),
      ],
    },
    {
      id: 'qr-ordering',
      shortName: 'Food ordering',
      name: 'Food ordering system',
      summary: 'Customers scan, order and pay at the table.',
      price: 10900,
      from: true,
      care: 'system',
      includes: [
        'Menu with photos, options and a sold-out switch',
        'A QR code for each table',
        'Orders go straight to a kitchen screen',
        'Admin portal for the menu, tables and daily sales',
      ],
      addOns: [
        {
          id: 'payment',
          name: 'Pay at the table',
          description: `Customers pay by FPX, card, e-wallet or DuitNow QR. ${GATEWAY_FEES}.`,
          price: 3000,
        },
        {
          id: 'takeaway',
          name: 'Takeaway and delivery',
          description:
            'Customers order ahead for pickup or delivery from your own link.',
          price: 2000,
        },
        {
          id: 'printers',
          name: 'Kitchen and receipt printers',
          description: 'Orders print on your kitchen and receipt printers.',
          price: 2000,
        },
        {
          id: 'outlets',
          name: 'Multiple outlets',
          description: 'Each outlet with its own menu, tables and sales.',
          price: 3000,
        },
        {
          id: 'loyalty',
          name: 'Loyalty points',
          description: 'Points on every order, redeemed on the next visit.',
          price: 3000,
        },
        {
          id: 'reports',
          name: 'Sales reports',
          description: 'Sales by day, item and table, with CSV exports.',
          price: 2000,
        },
        alerts('a table places an order'),
        {
          id: 'ai-menu',
          name: 'AI menu helper',
          description:
            'Customers ask about spice, allergies or ingredients in their own language. It answers only from what you enter for each dish.',
          price: 2500,
          ai: true,
        },
        aiAssistant('Nasi lemak sold out twice this week'),
      ],
    },
    {
      id: 'inventory',
      shortName: 'Inventory',
      name: 'Inventory and stock',
      summary: 'Know what you have, where it is and when to reorder.',
      price: 10900,
      from: true,
      care: 'system',
      includes: [
        'Products with SKUs, units and categories',
        'Stock in, stock out and transfers',
        'Low-stock alerts',
        'Sign-in for you and your staff',
      ],
      addOns: [
        {
          id: 'barcodes',
          name: 'Barcode scanning',
          description: 'Scan items with a phone camera or a barcode scanner.',
          price: 3000,
        },
        {
          id: 'locations',
          name: 'Multiple warehouses',
          description: 'Stock counted per shop or warehouse, with transfers.',
          price: 3000,
        },
        {
          id: 'purchasing',
          name: 'Purchase orders and suppliers',
          description: 'Raise purchase orders and receive stock against them.',
          price: 3500,
        },
        {
          id: 'expiry',
          name: 'Batch and expiry dates',
          description: 'Track batches and get alerts before items expire.',
          price: 3000,
        },
        {
          id: 'store-sync',
          name: 'Online store sync',
          description: 'Stock stays in step with your online store.',
          price: 3500,
        },
        {
          id: 'reports',
          name: 'Stock reports',
          description:
            'Stock value, movement and slow sellers, with CSV exports.',
          price: 2000,
        },
        alerts('stock runs low'),
        {
          id: 'ai-stock-in',
          name: 'AI stock-in from photos',
          description:
            "Snap a supplier's invoice or delivery order, and the items and quantities fill in for staff to confirm.",
          price: 2500,
          ai: true,
        },
        aiAssistant('5 items will run out this week'),
      ],
    },
    {
      id: 'invoicing',
      shortName: 'Invoicing',
      name: 'Quotation and invoicing',
      summary: 'Quotes, invoices and payments in one place.',
      price: 8600,
      from: true,
      care: 'system',
      includes: [
        'Customers and products saved for reuse',
        'Quotations that turn into invoices',
        'PDF invoices with your logo, sent by email',
        'Payment tracking and an outstanding list',
      ],
      addOns: [
        {
          id: 'e-invoice',
          name: 'e-Invoice (LHDN MyInvois)',
          description:
            'Invoices are submitted to MyInvois and carry the validated QR code.',
          price: 4500,
        },
        {
          id: 'payment-links',
          name: 'Online payment links',
          description: `Customers pay an invoice by FPX, card or e-wallet. ${GATEWAY_FEES}.`,
          price: 2000,
        },
        {
          id: 'recurring',
          name: 'Recurring invoices',
          description: 'Monthly or yearly invoices that send themselves.',
          price: 2000,
        },
        {
          id: 'delivery-orders',
          name: 'Delivery orders',
          description: 'Delivery orders and receipts from the same records.',
          price: 1500,
        },
        {
          id: 'reminders',
          name: 'Payment reminders',
          description: 'Overdue reminders by email or WhatsApp.',
          price: 1500,
        },
        {
          id: 'reports',
          name: 'Sales and SST reports',
          description:
            'Sales, outstanding amounts and SST summaries, with exports.',
          price: 2000,
        },
        alerts('an invoice is paid or goes overdue'),
        {
          id: 'ai-quotes',
          name: 'AI quotation drafts',
          description:
            "Paste the customer's request and get a draft quote from your saved products and prices, ready to check and send.",
          price: 2000,
          ai: true,
        },
        aiAssistant('3 invoices are overdue, RM4,200 in total'),
      ],
    },
    {
      id: 'hr',
      shortName: 'HR & leave',
      name: 'HR: leave, claims and attendance',
      summary: 'Staff apply, managers approve, and every record is kept.',
      price: 12900,
      from: true,
      care: 'system',
      includes: [
        'Staff profiles and sign-in',
        'Leave applications with balances',
        'Claims with receipt photos',
        'One-tap approvals for managers',
      ],
      addOns: [
        {
          id: 'attendance',
          name: 'Clock-in attendance',
          description: 'Staff clock in from their phone, with location.',
          price: 3500,
        },
        {
          id: 'shifts',
          name: 'Shift schedules',
          description: 'Plan shifts and let staff see their roster.',
          price: 3000,
        },
        {
          id: 'payroll',
          name: 'Payroll export',
          description:
            'Leave, claims and attendance exported each month to the payroll app you use.',
          price: 1500,
        },
        {
          id: 'branches',
          name: 'Multiple branches',
          description: 'Leave rules, holidays and managers per branch.',
          price: 2000,
        },
        {
          id: 'reports',
          name: 'HR reports',
          description: 'Leave, claims and attendance summaries, with exports.',
          price: 2000,
        },
        alerts('a staff member applies for leave or submits a claim'),
        {
          id: 'ai-receipts',
          name: 'AI receipt reading',
          description:
            'Claims fill in from the receipt photo, and duplicate or over-limit claims are flagged.',
          price: 2500,
          ai: true,
        },
        aiAssistant('2 leave requests are waiting for you'),
      ],
    },
    {
      id: 'crm',
      shortName: 'Sales tracking',
      name: 'Customer and sales tracking',
      summary: 'Every lead, follow-up and deal in one place.',
      price: 10900,
      from: true,
      care: 'system',
      includes: [
        'Leads from your website forms saved automatically',
        'A sales pipeline by stage',
        'Follow-up reminders for your team',
        'Customer history and notes',
      ],
      addOns: [
        {
          id: 'whatsapp',
          name: 'WhatsApp chats on each lead',
          description:
            'See and reply to WhatsApp chats from the lead. Message fees paid by you to Meta.',
          price: 3500,
        },
        {
          id: 'quotes',
          name: 'Quotations from each deal',
          description:
            'Send a quote from a deal and track when it is accepted.',
          price: 3000,
        },
        {
          id: 'team',
          name: 'Team roles and targets',
          description: 'Assign leads, set targets and see who closed what.',
          price: 2000,
        },
        {
          id: 'campaigns',
          name: 'Email campaigns',
          description: 'Send updates and promotions to customer lists.',
          price: 2000,
        },
        {
          id: 'reports',
          name: 'Sales dashboards',
          description: 'Pipeline value, win rates and sales by person.',
          price: 2000,
        },
        alerts('a new lead comes in from your website'),
        {
          id: 'ai-follow-ups',
          name: 'AI lead follow-ups',
          description:
            'A summary of each lead, the next step to take and a drafted follow-up message.',
          price: 2500,
          ai: true,
        },
        aiAssistant("4 leads haven't been followed up"),
      ],
    },
    {
      id: 'tuition',
      shortName: 'Tuition centre',
      name: 'Tuition and training centre',
      summary: 'Students, classes, attendance and fees in one system.',
      price: 12900,
      from: true,
      care: 'system',
      includes: [
        'Students, parents and classes',
        'Class schedules and attendance',
        'Monthly fee invoices and payment tracking',
        'Sign-in for teachers and staff',
      ],
      addOns: [
        {
          id: 'parents',
          name: 'Parent portal',
          description: 'Parents see attendance, fees and announcements.',
          price: 3500,
        },
        {
          id: 'fees',
          name: 'Online fee payment',
          description: `Parents pay by FPX, card or e-wallet. ${GATEWAY_FEES}.`,
          price: 3000,
        },
        {
          id: 'whatsapp',
          name: 'WhatsApp reminders',
          description:
            'Class and fee reminders on WhatsApp. Message fees paid by you to Meta.',
          price: 1500,
        },
        {
          id: 'progress',
          name: 'Exams and progress reports',
          description: 'Record marks and share progress reports.',
          price: 3000,
        },
        {
          id: 'branches',
          name: 'Multiple branches',
          description: 'Classes, teachers and fees per branch.',
          price: 3000,
        },
        {
          id: 'materials',
          name: 'Class materials',
          description:
            'Notes, videos and homework only enrolled students can open.',
          price: 2000,
        },
        alerts('a fee is paid or goes overdue'),
        {
          id: 'ai-comments',
          name: 'AI report comments',
          description:
            'A drafted comment for each student from their marks and attendance, for teachers to edit. Comes with exams and progress reports.',
          price: 2000,
          ai: true,
          requires: 'progress',
        },
        aiAssistant("3 parents haven't paid this month"),
      ],
    },
    {
      id: 'membership',
      shortName: 'Membership',
      name: 'Membership and loyalty',
      summary: 'Members, plans, check-ins and rewards.',
      price: 11900,
      from: true,
      care: 'system',
      includes: [
        'Member profiles and plans',
        'Renewal reminders by email',
        'Check-in with a member QR code',
        'Admin portal for members and plans',
      ],
      addOns: [
        {
          id: 'payments',
          name: 'Online payment and auto-renewal',
          description: `Members pay and renew online. ${GATEWAY_FEES}.`,
          price: 3500,
        },
        {
          id: 'rewards',
          name: 'Points and rewards',
          description: 'Points for visits or spending, redeemed for rewards.',
          price: 3000,
        },
        {
          id: 'classes',
          name: 'Class booking',
          description:
            'Members book classes or sessions, with limits per class.',
          price: 3500,
        },
        {
          id: 'app',
          name: 'Member app',
          description:
            'Members add it to their home screen and open it like an app.',
          price: 2000,
        },
        {
          id: 'whatsapp',
          name: 'WhatsApp reminders',
          description:
            'Renewal and class reminders on WhatsApp. Message fees paid by you to Meta.',
          price: 1500,
        },
        {
          id: 'reports',
          name: 'Member reports',
          description: 'Sign-ups, renewals and check-ins, with exports.',
          price: 2000,
        },
        alerts('someone joins, renews or checks in'),
        {
          id: 'ai-win-back',
          name: 'AI win-back messages',
          description:
            'Spots members who come less or are about to expire, and drafts a personal renewal message.',
          price: 2000,
          ai: true,
        },
        aiAssistant('6 memberships expire this week'),
      ],
    },
    {
      id: 'rentals',
      shortName: 'Rentals',
      name: 'Rental management',
      summary: "Track what's rented, to whom and when it's due back.",
      price: 11900,
      from: true,
      care: 'system',
      includes: [
        'Items or units with an availability calendar',
        'Bookings with deposits and return dates',
        'Customer records and rental agreements',
        'Sign-in for you and your staff',
      ],
      addOns: [
        {
          id: 'online-booking',
          name: 'Online booking',
          description: 'Customers check availability and book on your site.',
          price: 3500,
        },
        {
          id: 'deposits',
          name: 'Online deposit payment',
          description: `Customers pay the deposit by FPX, card or e-wallet. ${GATEWAY_FEES}.`,
          price: 3000,
        },
        {
          id: 'signatures',
          name: 'Digital agreements',
          description: 'Customers sign the rental agreement on their phone.',
          price: 3000,
        },
        {
          id: 'charges',
          name: 'Late and damage charges',
          description: 'Late returns and damage charges added to the bill.',
          price: 2000,
        },
        {
          id: 'branches',
          name: 'Multiple branches',
          description: 'Items and bookings per branch.',
          price: 3000,
        },
        {
          id: 'reports',
          name: 'Rental reports',
          description: 'Utilisation, income and overdue returns, with exports.',
          price: 2000,
        },
        alerts('a booking is made or an item is due back'),
        {
          id: 'ai-availability',
          name: 'AI availability assistant',
          description:
            'Customers ask in chat, like "3-ton lorry free next Friday?", and it checks the calendar, quotes the price and takes the booking.',
          price: 3000,
          ai: true,
        },
        aiAssistant('2 items are due back today'),
      ],
    },
  ],
};

const SYSTEM_CHOICES = 'Online store, booking, HR and more';

export const CUSTOM_SYSTEM: Bundle = {
  id: 'custom-system',
  name: 'Enterprise',
  summary: 'Customise a system for your business, with anything you need.',
  price: Math.min(...SYSTEMS.bundles.map((bundle) => bundle.price)),
  from: true,
  care: 'system',
  includeInfo: {
    item: SYSTEM_CHOICES,
    heading: 'Systems you can pick',
    items: SYSTEMS.bundles.map((bundle) => bundle.shortName ?? bundle.name),
    note: 'Not listed? Pick "Something Else" in the estimate and describe it.',
  },
  includes: [
    SYSTEM_CHOICES,
    'Payment gateway, if needed',
    'AI features, if needed',
    'Staff or customer logins',
    'Database with daily backups',
    'Admin dashboard',
  ],
};

export const MOBILE_APPS: PricingTab = {
  id: 'mobile-app',
  label: 'Mobile apps',
  shortLabel: 'Apps',
  tagline: 'Android and iOS apps',
  noun: 'mobile app',
  layout: 'quote',
  note: 'Apple and Google charge you for the store accounts: USD 99 a year and USD 25 once.',
  bundles: [],
  quote: {
    includes: [
      'Android and iOS',
      'App Store and Google Play publishing',
      'Admin dashboard',
      BUG_FIX_INCLUDE,
    ],
    examples:
      'For example: loyalty and member apps, booking apps, ordering apps or apps for your staff.',
    placeholder:
      'For example: an app for my gym where members book classes, pay monthly and check in with a QR code.',
  },
};

export const AUTOMATION: PricingTab = {
  id: 'automation',
  label: 'Automation',
  shortLabel: 'Automate',
  tagline: 'Reports, WhatsApp orders, chatbots and approvals',
  noun: 'automation',
  layout: 'bento',
  note: 'Each one works with the tools you already use, and is tested with your real data before it goes live.',
  bundles: [
    {
      id: 'reports',
      name: 'Reports and alerts',
      summary: 'A summary of your business, sent to you.',
      price: 550,
      from: true,
      care: 'automation',
      includes: [
        'Scheduled sales, stock or booking reports',
        'Sent to WhatsApp or email',
        'Alerts when something needs attention',
      ],
      runningCost:
        'WhatsApp message fees are paid by you to Meta. Email is free',
    },
    {
      id: 'whatsapp-orders',
      name: 'WhatsApp orders',
      summary: 'Orders on WhatsApp, saved for you.',
      price: 1100,
      from: true,
      care: 'automation',
      includes: [
        'Orders saved to Google Sheets',
        'Auto-reply to customers',
        'Staff alerts for new orders',
        'WhatsApp Business API setup',
      ],
      runningCost:
        'Meta must approve your number, and message fees are paid by you to Meta',
    },
    {
      id: 'chatbot',
      name: 'Chatbot',
      summary: 'Answers your common questions, day and night.',
      price: 1400,
      from: true,
      care: 'automation',
      includes: [
        'Website or WhatsApp chatbot',
        'Trained on your prices, hours and FAQ',
        'Human handover',
      ],
      runningCost: AI_USAGE_FEES,
    },
    {
      id: 'approvals',
      name: 'Approval flows',
      summary: 'Requests reach the right person, and get answered.',
      price: 1700,
      from: true,
      care: 'automation',
      includes: [
        'Leave, claims or purchase requests',
        'One-tap approve or reject',
        'Full audit trail',
      ],
    },
  ],
};

export const PRICING_TABS = [WEBSITES, SYSTEMS, MOBILE_APPS, AUTOMATION];

/** Package tabs that end with an Enterprise card and its estimate builder. */
export const CUSTOM_BUILDS: Record<
  string,
  { bundle: Bundle; builder: PricingTab }
> = {
  [WEBSITES.id]: { bundle: CUSTOM_SYSTEM, builder: SYSTEMS },
};

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

export const TEMPLATE_CATEGORIES = [...SITE_TYPES, ...TEMPLATE_KINDS];

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

export function packageOfTemplate(template: {
  package?: string | null;
  category: string;
}): { tab: PricingTab; bundle: Bundle } {
  const id =
    template.package ??
    (isStoreTemplate(template.category) ? 'online-store' : 'business');
  for (const tab of [WEBSITES, SYSTEMS]) {
    const bundle = tab.bundles.find((item) => item.id === id);
    if (bundle) return { tab, bundle };
  }
  return { tab: WEBSITES, bundle: WEBSITES.bundles[1] };
}

export function fullIncludesOf(tab: PricingTab, bundle: Bundle): string[] {
  const chain = (item: Bundle): string[] => {
    const base = tab.bundles.find((other) => other.id === item.basedOn);
    return base ? [...chain(base), ...item.includes] : item.includes;
  };
  return [...chain(bundle), BUG_FIX_INCLUDE];
}

export const templateIncludesOf = (tab: PricingTab, bundle: Bundle) =>
  fullIncludesOf(tab, bundle).filter(
    (item) => item !== CUSTOM_DESIGN && !PAGE_LIMITS.includes(item)
  );

export function careForTemplate(template: {
  package?: string | null;
  category: string;
}): CareTier {
  if (isStoreTemplate(template.category)) return CARE.store;
  const { bundle } = packageOfTemplate(template);
  return CARE[bundle.care ?? 'business'];
}

export const TEMPLATE_PACKAGES = [
  { id: 'starter', label: 'Starter' },
  { id: 'business', label: 'Business' },
  { id: 'online-store', label: 'Online store' },
] as const;

export const TEMPLATE_SETUP = 'Set up with your logo, colours and content';

export const BUSINESS_MAX_PAGES = 6;

export interface TemplateAddOn extends AddOn {
  perPage?: boolean;
}

// Works like Spooky, the bot on this site, trained on the client's own details.
const AI_CHATBOT: TemplateAddOn = {
  id: 'ai-chatbot',
  name: 'AI chatbot',
  description:
    "Answers customers' questions about your prices, hours and services, day and night, and hands over to WhatsApp. Works like Spooky, the bot on this site.",
  price: 800,
  ai: true,
};

const LANGUAGES = {
  id: 'languages',
  name: 'Extra language',
  description: 'Translated for you.',
  perLanguage: true,
};

// Store templates are for small shops, so they keep small-shop add-on prices.
const STORE_TEMPLATE_PRICES: Record<string, number> = {
  accounts: 1200,
  shipping: 1500,
  loyalty: 1800,
  reviews: 800,
  languages: 1000,
  reports: 1200,
  alerts: 500,
  'ai-shopping': 1800,
  'ai-assistant': 1500,
};

const STORE_ADD_ONS = (
  SYSTEMS.bundles.find((bundle) => bundle.id === 'online-store')?.addOns ?? []
).map((item) => ({
  ...item,
  price: STORE_TEMPLATE_PRICES[item.id] ?? item.price,
}));

const TEMPLATE_ADD_ONS: Record<string, TemplateAddOn[]> = {
  starter: [
    {
      id: 'cms',
      name: 'Content editor (CMS)',
      description: 'Change your text, photos and prices yourself.',
      price: 400,
    },
    {
      id: 'chat',
      name: 'WhatsApp/Telegram integration',
      description:
        'Orders or bookings sent to your WhatsApp or Telegram. You confirm each one.',
      price: 300,
    },
    { ...LANGUAGES, price: 300 },
    AI_CHATBOT,
  ],
  business: [
    {
      id: 'page',
      name: 'Extra page',
      description: `Up to ${BUSINESS_MAX_PAGES} pages in total, such as About or Contact.`,
      price: 150,
      perPage: true,
    },
    { ...LANGUAGES, price: 400 },
    ONLINE_PAYMENT,
    {
      id: 'content',
      name: 'Products or projects added for you',
      description: 'Up to 30, from your list and photos.',
      price: 200,
    },
    AI_CHATBOT,
  ],
  'online-store': [
    {
      id: 'page-editor',
      name: 'Content editor for banners and pages',
      description: 'Change your home banners, photos and page text yourself.',
      price: 800,
    },
    // The template already loads 50 products, so the import add-on is left out.
    ...STORE_ADD_ONS.filter((item) => item.id !== 'import'),
  ],
};

export const templateAddOnsOf = (template: {
  package?: string | null;
  category: string;
}) => TEMPLATE_ADD_ONS[packageOfTemplate(template).bundle.id] ?? [];

export const TAKEOVER = {
  options: [
    {
      id: 'website',
      name: 'Website',
      summary: 'A business website or online shop.',
      check: 300,
      care: { name: 'Takeover', for: 'Websites', monthly: 100, from: true },
    },
    {
      id: 'system',
      name: 'System or app',
      summary: 'A booking, inventory or HR system, or a mobile app.',
      check: 800,
      care: {
        name: 'Takeover',
        for: 'Systems and apps',
        monthly: 350,
        from: true,
      },
    },
  ] satisfies {
    id: string;
    name: string;
    summary: string;
    check: number;
    care: CareTier;
  }[],
  checkIncludes: [
    'Access to your hosting, domain and code, moved into your name if needed',
    'A full backup before anything is touched',
    'A review of the code, security and speed',
    'A written list of issues, each with a fixed price',
  ],
  careIncludes: [
    'Security and software updates',
    'Regular backups',
    'Anything my changes break is fixed free',
  ],
  platforms: [
    'WordPress',
    'React, Next.js and Node.js',
    'React Native apps',
    'Wix, Shopify and Webflow (content and settings only)',
  ],
};
