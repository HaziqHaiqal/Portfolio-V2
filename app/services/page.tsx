import type { Metadata } from 'next';
import { Calculator, CircleHelp, PlayCircle } from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import {
  getCachedFeaturedDeals,
  getCachedPortfolio,
  getCachedTemplates,
} from '@lib/data';
import {
  BLUEPRINT,
  CARE,
  CARE_PLAN,
  carePrice,
  PAYMENT_TERMS,
  PRICING_TABS,
  startingPriceOf,
} from '@constants/services';
import { DEFAULT_CONTACT } from '@constants/contact';
import { themeClasses } from '@constants/theme';
import { PAGE_ACCENTS } from '@constants/colors';
import { formatRM } from '@lib/format';
import GridBackground from '@components/Layout/GridBackground';
import FloatingElements from '@components/Layout/FloatingElements';
import NavBar from '@components/Layout/NavBar';
import Footer from '@components/Layout/Footer';
import SplashScreen from '@components/Layout/SplashScreen';
import SectionHeader from '@components/Common/SectionHeader';
import Packages from '@components/Service/Packages';
import ServiceTabs, { type ServiceTab } from '@components/Service/ServiceTabs';
import TemplateGallery from '@components/Service/TemplateGallery';
import FaqList, { type FaqItem } from '@components/Service/FaqList';
import { PromoProvider } from '@components/Promo/PromoProvider';

const GREEN = PAGE_ACCENTS.green;

const FROM = formatRM(Math.min(...PRICING_TABS.map(startingPriceOf)));

export const metadata: Metadata = {
  title: 'Services | Haziq Haiqal',
  description: `Custom and ready-made websites from ${FROM}, online stores, mobile apps and business automation, with clear prices.`,
};

const CARE_LIST = [
  CARE.starter,
  CARE.business,
  CARE.premium,
  CARE.store,
  CARE.system,
  CARE.app,
  CARE.automation,
];

const FAQS: FaqItem[] = [
  {
    question: `What is the ${CARE_PLAN}?`,
    answer: (
      <>
        <p>
          Every website, system and app needs one to stay online. It covers
          hosting, SSL, security updates and backups, and the price depends on
          how much there is to look after.
        </p>
        <ul className="mt-4 divide-y divide-gray-200 rounded-2xl bg-gray-100/80 px-4 dark:divide-gray-700/70 dark:bg-gray-900/40">
          {CARE_LIST.map((tier) => (
            <li
              key={tier.for}
              className="flex flex-wrap items-baseline justify-between gap-x-4 py-3"
            >
              <span>{tier.for}</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {carePrice(tier)}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4">
          Pay yearly and get 2 months free. Replies come within 1 working day,
          with same-day help when your site or app is down, where possible. If
          the plan stops, the site or app goes offline, and the code is yours to
          host elsewhere.
        </p>
      </>
    ),
  },
  {
    question: 'How does payment work?',
    answer: `${PAYMENT_TERMS}. Systems and apps start with a ${formatRM(BLUEPRINT.price)} ${BLUEPRINT.name}: ${BLUEPRINT.description.charAt(0).toLowerCase()}${BLUEPRINT.description.slice(1)} If you decide not to go ahead, the written scope is still yours.`,
  },
  {
    question: 'What if I need something that is not listed?',
    answer:
      'Ask on WhatsApp. Extra pages, languages and features are quoted, and the price is agreed in writing before any work starts. Have a promo code? Enter it when you order a template, or add it to your message.',
  },
  {
    question: 'What else will I pay for?',
    answer:
      'Your domain name, and fees you pay directly to other companies: payment gateway fees, WhatsApp message fees to Meta, AI usage fees, and for apps, Apple Developer (USD 99 a year) and Google Play (USD 25 once). Prices on this page are in Malaysian Ringgit (RM).',
  },
  {
    question: 'What happens after launch?',
    answer:
      'Bug fixes are free for life: if the delivered work stops working as agreed, it is fixed free. This excludes problems caused by other people’s changes or third-party services. Business and Premium websites come with a Site editor, so you update text, photos and prices yourself, and systems come with an Admin portal. Other changes are quoted before any work starts.',
  },
  {
    question: 'What do I need to provide?',
    answer:
      'Your text, logo and photos. Copywriting can be quoted separately if you need help with the words.',
  },
  {
    question: 'Who owns the website or app?',
    answer:
      'You do. Your domain and app store accounts are in your name from the start, and the code and content are yours once the final payment is made.',
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

  const tabs: ServiceTab[] = PRICING_TABS.map((tab) => ({
    id: tab.id,
    label: tab.label,
    shortLabel: tab.shortLabel,
    tagline: tab.tagline,
    price: `From ${formatRM(startingPriceOf(tab))}`,
    panel: <Packages tab={tab} whatsappHref={whatsappUrl} />,
  }));

  return (
    <div className="relative min-h-screen overflow-hidden">
      <SplashScreen />
      <div className={`relative ${themeClasses.bg.primary}`}>
        <GridBackground />
        <FloatingElements />
        <NavBar />

        <PromoProvider>
          <main className="relative z-10">
            <h1 className="sr-only">Services & Pricing</h1>
            <section className="px-6 pb-20 pt-28 sm:px-10 md:pb-28 md:pt-40 lg:px-16">
              <div className="mx-auto max-w-6xl">
                <SectionHeader
                  icon={PlayCircle}
                  title="Try a Live Demo"
                  accentClass={GREEN.icon}
                  gradientClass={GREEN.bar}
                />
                <TemplateGallery
                  templates={templates}
                  whatsappHref={whatsappUrl}
                  deals={deals}
                  limit={6}
                  seeAllHref="/services/demos"
                />
              </div>
            </section>

            <section className="px-6 pb-20 sm:px-10 md:pb-28 lg:px-16">
              <div className="mx-auto max-w-6xl">
                <SectionHeader
                  icon={Calculator}
                  title="Pricing"
                  accentClass={GREEN.icon}
                  gradientClass={GREEN.bar}
                />
                <ServiceTabs tabs={tabs} />
              </div>
            </section>

            <section className="px-6 pb-20 sm:px-10 md:pb-28 lg:px-16">
              <div className="mx-auto max-w-3xl">
                <SectionHeader
                  icon={CircleHelp}
                  title="Good to Know"
                  accentClass={GREEN.icon}
                  gradientClass={GREEN.bar}
                />
                <FaqList items={FAQS} />

                <div className="mt-16 text-center">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 sm:text-2xl">
                    Not sure which to pick?
                  </h2>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Tell me about your business and I&apos;ll suggest one.
                  </p>
                  <a
                    href={withMessage(
                      whatsappUrl,
                      "Hi Haziq, I'm not sure which package fits my business. Can you suggest one?"
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-green-600 px-6 text-sm font-semibold text-white shadow-lg shadow-green-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-green-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-500/30"
                  >
                    <SiWhatsapp size={15} aria-hidden="true" />
                    Chat on WhatsApp
                  </a>
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
