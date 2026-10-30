import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Calculator, CircleHelp, PlayCircle } from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import {
  getCachedFeaturedDeals,
  getCachedPortfolio,
  getCachedTemplates,
} from '@lib/data';
import {
  CARE,
  carePrice,
  isStoreTemplate,
  PRICING_TABS,
  startingPriceOf,
  TAKEOVER,
  WEBSITES,
} from '@constants/services';
import { SERVICE_FAQ } from '@constants/faq';
import { SITE_URL } from '@lib/site';
import { DEFAULT_CONTACT } from '@constants/contact';
import { themeClasses } from '@constants/theme';
import { PAGE_ACCENTS } from '@constants/colors';
import { formatRM } from '@lib/format';
import GridBackground from '@components/Layout/GridBackground';
import FloatingElements from '@components/Layout/FloatingElements';
import NavBar from '@components/Layout/NavBar';
import Footer from '@components/Layout/Footer';
import ContactModal from '@components/Modal/ContactModal';
import SplashScreen from '@components/Layout/SplashScreen';
import SectionHeader from '@components/Common/SectionHeader';
import Packages from '@components/Service/Packages';
import ServiceTabs, { type ServiceTab } from '@components/Service/ServiceTabs';
import TemplateGallery from '@components/Service/TemplateGallery';
import FaqList from '@components/Service/FaqList';
import Maintenance from '@components/Service/Maintenance';
import { MAINTENANCE_TAB } from '@components/Service/PriceParts';
import { PromoProvider } from '@components/Promo/PromoProvider';

const GREEN = PAGE_ACCENTS.green;

const FROM = formatRM(
  Math.min(
    ...PRICING_TABS.filter((tab) => tab.bundles.length).map(startingPriceOf)
  )
);

const TITLE = 'Services | Haziq Haiqal';
const DESCRIPTION = `Ready-made and custom websites from ${FROM}, online stores, booking, inventory and HR systems, mobile apps and WhatsApp automation for Malaysian businesses. Clear prices and a free quote.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/services' },
  openGraph: {
    title: TITLE,
    siteName: 'Haziq Haiqal Portfolio',
    locale: 'en_MY',
    type: 'website',
  },
};

const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: 'Haziq Haiqal',
  url: `${SITE_URL}/services`,
  description: DESCRIPTION,
  areaServed: { '@type': 'Country', name: 'Malaysia' },
  priceRange: `${FROM}+`,
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Websites, systems, mobile apps and automation',
    itemListElement: [
      ...PRICING_TABS.flatMap((tab) =>
        tab.bundles.map((bundle) => ({
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: `${bundle.name} (${tab.label})`,
            description: bundle.summary,
          },
          priceSpecification: {
            '@type': 'PriceSpecification',
            priceCurrency: 'MYR',
            ...(bundle.from
              ? { minPrice: bundle.price }
              : { price: bundle.price }),
          },
        }))
      ),
      ...TAKEOVER.options.map((option) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: `Takeover check and maintenance (${option.name})`,
          description: `Maintenance for a ${option.name.toLowerCase()} someone else built, after a one-time check.`,
        },
        priceSpecification: {
          '@type': 'PriceSpecification',
          priceCurrency: 'MYR',
          price: option.check,
        },
      })),
    ],
  },
};

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

  const fromOf = (tab: (typeof PRICING_TABS)[number]) =>
    tab === WEBSITES
      ? Math.min(
          startingPriceOf(tab),
          ...templates
            .filter((template) => !isStoreTemplate(template.category))
            .map((template) => template.price)
        )
      : startingPriceOf(tab);

  const tabs: ServiceTab[] = [
    ...PRICING_TABS.filter((tab) => tab.layout !== 'builder').map((tab) => ({
      id: tab.id,
      label: tab.label,
      shortLabel: tab.shortLabel,
      tagline: tab.tagline,
      price:
        tab.layout === 'quote' ? 'Free quote' : `From ${formatRM(fromOf(tab))}`,
      panel: <Packages tab={tab} whatsappHref={whatsappUrl} />,
    })),
    {
      id: MAINTENANCE_TAB,
      label: 'Maintenance',
      shortLabel: 'Care',
      tagline: 'Hosting, updates and backups after launch',
      price: `From ${carePrice(CARE.starter)}`,
      panel: <Maintenance whatsappHref={whatsappUrl} />,
    },
  ];

  return (
    <div className="relative min-h-screen overflow-x-clip">
      <SplashScreen />
      <div className={`relative ${themeClasses.bg.primary}`}>
        <GridBackground />
        <FloatingElements />
        <NavBar />

        <PromoProvider>
          <main className="relative z-10">
            <h1 className="sr-only">Services & Pricing</h1>
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify(JSON_LD).replace(/</g, '\\u003c'),
              }}
            />
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
                <FaqList items={SERVICE_FAQ} />

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
                  <Link
                    href="/projects"
                    className="mt-4 flex items-center justify-center gap-1.5 text-sm font-semibold text-gray-600 underline-offset-4 hover:text-gray-900 hover:underline dark:text-gray-400 dark:hover:text-white"
                  >
                    See projects I&apos;ve built
                    <ArrowRight size={14} aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </section>
          </main>
        </PromoProvider>
      </div>

      <Footer profile={profile} />

      <ContactModal profile={profile} />
    </div>
  );
}
