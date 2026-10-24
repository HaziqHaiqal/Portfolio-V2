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

const FAQS: FaqItem[] = [
  {
    category: 'After launch',
    question: 'Will you fix bugs after launch?',
    answer:
      'Yes. If a website, app or system I built stops working as agreed, I fix the bug free for life. This excludes issues caused by later changes from others or third-party services.',
  },
  {
    category: 'Starting a project',
    question: 'How do we get started?',
    answer:
      `Choose a website package and message me. Systems and apps start with a ${formatRM(BLUEPRINT.price)} ${BLUEPRINT.name}; it maps your needs and gives you a written scope and fixed quote. The fee comes off the build if you proceed.`,
  },
  {
    category: 'Costs and ownership',
    question: 'What will I pay after launch?',
    answer:
      'The agreed hosting cost, including database hosting if needed, plus your domain renewal and any third-party service fees. There is no separate fee just for using a database.',
  },
  {
    category: 'Starting a project',
    question: 'What if I need something outside the package?',
    answer:
      'New pages, features, integrations and improvements are quoted separately and agreed before work starts.',
  },
  {
    category: 'After launch',
    question: 'Can I change things myself after launch?',
    answer:
      'Business and Premium websites include a Site editor; systems include an Admin portal for your own updates.',
  },
  {
    category: 'Costs and ownership',
    question: 'Who owns the finished work?',
    answer:
      'Your domain and app store accounts are in your name. Once the final payment is made, the code and content are yours.',
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
    price: `From ${formatRM(startingPriceOf(tab))}${tab.monthly ? '/month' : ''}`,
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
                  title="Common Questions"
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
