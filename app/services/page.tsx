import type { Metadata } from 'next';
import {
  BriefcaseBusiness,
  Check,
  CircleHelp,
  Sparkles,
  Tag,
} from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import {
  getCachedFeaturedDeals,
  getCachedPortfolio,
  getCachedTemplates,
} from '@lib/data';
import {
  addOnById,
  CARE_RESPONSE,
  CARE_YEARLY_SAVING,
  careMonthly,
  careYearly,
  getPromoTargets,
  getServiceGroups,
  MOBILE_APP_ESTIMATOR,
  MULTI_LANGUAGE,
  PAYMENT_TERMS,
  promoTargetsOf,
  startingPriceOf,
  TEMPLATE_SECTION,
  TEMPLATE_SUMMARY,
  WEBSITE_CMS,
  WEBSITE_ESTIMATOR,
} from '@constants/services';
import { DEFAULT_CONTACT } from '@constants/contact';
import { themeClasses } from '@constants/theme';
import { formatRM } from '@lib/format';
import GridBackground from '@components/Layout/GridBackground';
import FloatingElements from '@components/Layout/FloatingElements';
import NavBar from '@components/Layout/NavBar';
import Footer from '@components/Layout/Footer';
import SectionHeader from '@components/Common/SectionHeader';
import PageHeader from '@components/Common/PageHeader';
import Estimator from '@components/Service/Estimator';
import ServiceTabs, { type ServiceTab } from '@components/Service/ServiceTabs';
import TemplateGallery from '@components/Service/TemplateGallery';
import Recommender from '@components/Service/Recommender';
import FaqTabs, { type FaqItem } from '@components/Service/FaqTabs';
import { PromoProvider } from '@components/Promo/PromoProvider';
import { PromoLink } from '@components/Promo/PromoParts';
import DealList from '@components/Promo/DealList';

export const metadata: Metadata = {
  title: 'Services | Haziq Haiqal',
  description:
    'Ready-made website templates, custom websites, mobile apps and business automation, with clear prices.',
};

const SOLID_BUTTON =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-green-600 px-6 text-sm font-semibold text-white shadow-lg shadow-green-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-green-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-500/30';

const OUTLINE_BUTTON =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-gray-300 bg-white/60 px-6 text-sm font-medium text-gray-800 backdrop-blur-sm transition-all duration-200 hover:border-green-500/60 hover:text-green-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-500/20 dark:border-gray-600 dark:bg-gray-800/60 dark:text-gray-200 dark:hover:text-green-400';

const STEPS = [
  'Choose a template or package, or describe a custom build.',
  'Send your choices in one WhatsApp message.',
  'Pages, features, price and timeline are agreed before work starts.',
  'Go live with lifetime bug fixes, kept online by the Care Plan.',
];

const formatStartingPrice = (config: typeof WEBSITE_ESTIMATOR) => {
  const from = startingPriceOf(config);
  return from === null ? 'By quotation' : `From ${formatRM(from)}`;
};

const fixedPackages = WEBSITE_ESTIMATOR.packages.filter(
  (pkg) => pkg.price !== undefined
);
const customFrom = Math.min(
  ...WEBSITE_ESTIMATOR.customPackages.map((build) => build.from)
);
const pwa = addOnById('pwa');
const cart = addOnById('whatsapp-cart');
const appointments = addOnById('appointment-request');
const payments = addOnById('online-payments');

const lowerFirst = (text: string) =>
  /^[A-Z][a-z]*\b/.test(text)
    ? text.charAt(0).toLowerCase() + text.slice(1)
    : text;

const webCare = WEBSITE_ESTIMATOR.carePlan;
const CARE_PLANS = [
  {
    name: 'Website',
    price: `${formatRM(careMonthly(webCare, false))}/month`,
    yearly: `${formatRM(careYearly(webCare, false))}/year`,
    text: `${webCare.includes
      .map((item, index) => (index ? lowerFirst(item) : item))
      .join(', ')}.`,
  },
  {
    name: 'Website with database',
    price: `${formatRM(careMonthly(webCare, true))}/month`,
    yearly: `${formatRM(careYearly(webCare, true))}/year`,
    text: `Adds ${(webCare.databaseIncludes ?? []).map(lowerFirst).join(' and ')}. For an admin dashboard, online payments or a custom build.`,
  },
  {
    name: 'Mobile app',
    price: 'By quotation',
    text: 'Confirmed in your app quote.',
  },
];

const FAQS: FaqItem[] = [
  {
    question: 'How does it work?',
    answer: (
      <ol className="space-y-3">
        {STEPS.map((step, index) => (
          <li key={step} className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500/10 text-xs font-bold text-green-700 dark:text-green-400">
              {index + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>
    ),
  },
  {
    question: 'How much does a website or app cost?',
    answer: `Templates show their price on each design. Custom websites are ${fixedPackages
      .map((pkg) => `${formatRM(pkg.price ?? 0)} (${pkg.name})`)
      .join(
        ' or '
      )}, and stores, bookings and portals start at ${formatRM(customFrom)}. Mobile apps are quoted after a short chat. The ${webCare.name} is paid monthly or yearly, from ${formatRM(webCare.monthlyPrice)} a month.`,
  },
  {
    id: 'care-plan',
    question: `What is the ${webCare.name}?`,
    answer: (
      <>
        <p>
          Every project needs a plan to stay online. Pay monthly, or yearly and
          save {CARE_YEARLY_SAVING}%.
        </p>
        <ul className="mt-4 divide-y divide-gray-200 rounded-2xl bg-gray-100/80 px-4 dark:divide-gray-700/70 dark:bg-gray-900/40">
          {CARE_PLANS.map((plan) => (
            <li key={plan.name} className="py-3">
              <p className="flex flex-wrap items-baseline justify-between gap-x-4">
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {plan.name}
                </span>
                <span className="text-sm">
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {plan.price}
                  </span>
                  {plan.yearly && ` or ${plan.yearly}`}
                </span>
              </p>
              <p className="mt-0.5 text-sm">{plan.text}</p>
            </li>
          ))}
        </ul>
        <p className="mt-4">
          {CARE_RESPONSE} If the plan stops, the site or app goes offline, and
          the code is yours to host elsewhere.
        </p>
      </>
    ),
  },
  {
    question: 'What else will I pay for?',
    answer:
      'Your domain name, and any fees from other companies, which you pay to them directly: Apple Developer (USD 99 a year) and Google Play (USD 25 once) for mobile apps, payment gateway fees, WhatsApp or SMS charges and paid APIs. Prices on this page are in Malaysian Ringgit (RM).',
  },
  {
    question: 'How does payment work?',
    answer: `${PAYMENT_TERMS}. Terms are negotiable, and the final price and timeline are confirmed before work starts.`,
  },
  {
    question: 'What happens after launch?',
    answer: `Bug fixes are free for life: if the delivered work stops working as agreed, it is fixed free. This excludes problems caused by other people's changes or third-party services. New pages and features are quoted, and the cost is confirmed before any work starts.`,
  },
  {
    question: 'How do I update my content after launch?',
    answer:
      'With the admin dashboard, you update the parts you chose yourself, at no extra cost. Without it, every content change, even a new photo, price or line of text, is done for you and charged by how complex it is. The cost is confirmed before any work starts.',
  },
  {
    question: 'Who owns the website or app?',
    answer:
      'You do. Your domain and app store accounts are in your name from the start, and the code and content are yours once the final payment is made. Hosting is managed for you as part of the Care Plan.',
  },
  {
    question: 'What do I need to provide?',
    answer:
      'Your text, logo and photos. Copywriting can be quoted separately if you need help with the words.',
  },
  {
    question: 'What does a template include?',
    answer: `${TEMPLATE_SUMMARY} Add-ons have fixed prices: ${lowerFirst(TEMPLATE_SECTION.name)}s at ${formatRM(TEMPLATE_SECTION.price)} each, add-ons that fit your type of site${cart && appointments ? `, such as a ${lowerFirst(cart.name)} at ${formatRM(cart.price)} or ${lowerFirst(appointments.name)}s at ${formatRM(appointments.price)}` : ''}, extra languages at ${formatRM(MULTI_LANGUAGE.pricePerLanguage)} each, and an admin dashboard from ${formatRM(WEBSITE_CMS.price)}.${payments ? ` Shop templates can add online payments by FPX, card or e-wallet as a quoted add-on, from ${formatRM(payments.price)}.` : ''}`,
  },
  ...(pwa
    ? [
        {
          question: 'What is an installable app (PWA)?',
          answer: `Your website, installed on the phone home screen like an app. It opens full screen and works on a weak signal, without the App Store or Google Play. It costs ${formatRM(pwa.price)} on top of any website or template, much less than a mobile app.`,
        },
      ]
    : []),
  {
    question: 'Can I use a promo code?',
    answer:
      'Yes, on templates and on Standard and Advanced packages, depending on the code. Enter it before sending your order and it is added to your WhatsApp message.',
  },
];

const faq = (question: string) => {
  const item = FAQS.find((entry) => entry.question === question);
  if (!item) throw new Error(`Missing FAQ: ${question}`);
  return item;
};

const FAQ_GROUPS = [
  {
    id: 'start',
    label: 'Getting started',
    items: [
      faq('How does it work?'),
      faq('What do I need to provide?'),
      faq('What does a template include?'),
      ...FAQS.filter((item) => item.question.includes('(PWA)')),
    ],
  },
  {
    id: 'pricing',
    label: 'Pricing',
    items: [
      faq('How much does a website or app cost?'),
      faq('What else will I pay for?'),
      faq('How does payment work?'),
      faq('Can I use a promo code?'),
    ],
  },
  {
    id: 'after-launch',
    label: 'After launch',
    items: [
      faq(`What is the ${webCare.name}?`),
      faq('What happens after launch?'),
      faq('How do I update my content after launch?'),
      faq('Who owns the website or app?'),
    ],
  },
];

function withMessage(whatsappHref: string, message: string) {
  const url = new URL(whatsappHref);
  url.searchParams.set('text', message);
  return url.toString();
}

export default async function ServicePage() {
  const [{ profile }, templates, deals] = await Promise.all([
    getCachedPortfolio(),
    getCachedTemplates(),
    getCachedFeaturedDeals().catch(() => []),
  ]);
  const whatsappUrl = profile?.whatsapp_url || DEFAULT_CONTACT.whatsapp;
  const promoTargets = getPromoTargets();
  const automation = getServiceGroups(whatsappUrl)
    .flatMap((group) => group.items)
    .find((service) => service.id === 'automation');

  const templatesFrom = templates.length
    ? Math.min(...templates.map((template) => template.price))
    : null;

  const tabs: ServiceTab[] = [
    ...(templates.length
      ? [
          {
            id: 'templates',
            label: 'Templates',
            price: `From ${formatRM(templatesFrom ?? 0)}`,
            icon: 'templates' as const,
            panel: (
              <TemplateGallery
                templates={templates}
                whatsappHref={whatsappUrl}
              />
            ),
          },
        ]
      : []),
    ...[WEBSITE_ESTIMATOR, MOBILE_APP_ESTIMATOR].map((config) => ({
      id: config.id,
      label: config.label,
      price: formatStartingPrice(config),
      icon: (config.id === 'website' ? 'web' : 'mobile') as ServiceTab['icon'],
      panel: (
        <Estimator
          config={config}
          whatsappHref={whatsappUrl}
          promoTargets={promoTargets}
        />
      ),
    })),
    ...(automation
      ? [
          {
            id: 'automation',
            label: 'Automation',
            price: 'By quotation',
            icon: 'automation' as const,
            panel: (
              <div className="mx-auto grid max-w-5xl items-center gap-8 rounded-3xl border border-gray-200 bg-white/70 p-6 shadow-xl backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/70 sm:p-10 md:grid-cols-[1fr_auto]">
                <div>
                  <h3 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">
                    {automation.title}
                  </h3>
                  <p className="mt-3 max-w-xl leading-relaxed text-gray-600 dark:text-gray-400">
                    {automation.description}
                  </p>
                  <ul className="mt-6 space-y-2.5">
                    {automation.highlights?.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300"
                      >
                        <Check
                          size={16}
                          aria-hidden="true"
                          className="mt-0.5 shrink-0 text-green-500"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                  {automation.note && (
                    <p className="mt-6 max-w-xl text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                      {automation.note}
                    </p>
                  )}
                </div>
                {automation.cta && (
                  <PromoLink
                    href={automation.cta.href}
                    targets={promoTargetsOf(automation).map(
                      (target) => target.id
                    )}
                    className={SOLID_BUTTON}
                  >
                    Request a quote
                    <SiWhatsapp size={15} aria-hidden="true" />
                  </PromoLink>
                )}
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className={`relative ${themeClasses.bg.primary}`}>
        <GridBackground />
        <FloatingElements />
        <NavBar />

        <PromoProvider>
          <main className="relative z-10">
            <section className="px-6 pb-20 pt-28 sm:px-10 md:pb-28 md:pt-40 lg:px-16">
              <div className="mx-auto max-w-6xl">
                <PageHeader
                  icon={BriefcaseBusiness}
                  title="Services & Pricing"
                  subtitle="Pick a service to see what you get and what it costs."
                />

                <ServiceTabs tabs={tabs} />
              </div>
            </section>

            {deals.length > 0 && (
              <section className="px-6 pb-20 sm:px-10 md:pb-28 lg:px-16">
                <div className="mx-auto max-w-3xl">
                  <SectionHeader
                    icon={Tag}
                    title="Deals"
                    accentClass="text-green-500"
                    gradientClass="from-green-600 to-green-400"
                  />
                  <DealList deals={deals} />
                </div>
              </section>
            )}

            <section className="px-6 pb-20 sm:px-10 md:pb-28 lg:px-16">
              <div className="mx-auto max-w-3xl">
                <SectionHeader
                  icon={CircleHelp}
                  title="Good to Know"
                  accentClass="text-purple-500"
                  gradientClass="from-purple-600 to-purple-400"
                />
                <FaqTabs groups={FAQ_GROUPS} />

                <div className="mt-16 text-center">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 sm:text-2xl">
                    Not sure which to pick?
                  </h2>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Answer a few quick questions for a suggestion, or ask on
                    WhatsApp.
                  </p>
                  <div className="mt-6 grid gap-3 sm:flex sm:justify-center">
                    <Recommender
                      templatesFrom={templatesFrom}
                      className={SOLID_BUTTON}
                    >
                      <Sparkles size={15} aria-hidden="true" />
                      Get a suggestion
                    </Recommender>
                    <a
                      href={withMessage(
                        whatsappUrl,
                        "Hi Haziq, I'd like to discuss a project."
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={OUTLINE_BUTTON}
                    >
                      Chat on WhatsApp
                      <SiWhatsapp size={15} aria-hidden="true" />
                    </a>
                  </div>
                </div>
              </div>
            </section>
          </main>
        </PromoProvider>
      </div>

      <Footer profile={profile} />
    </div>
  );
}
