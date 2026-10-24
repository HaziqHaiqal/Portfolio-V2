import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, PlayCircle } from 'lucide-react';
import {
  getCachedFeaturedDeals,
  getCachedPortfolio,
  getCachedTemplates,
} from '@lib/data';
import { DEFAULT_CONTACT } from '@constants/contact';
import { themeClasses } from '@constants/theme';
import GridBackground from '@components/Layout/GridBackground';
import NavBar from '@components/Layout/NavBar';
import Footer from '@components/Layout/Footer';
import PageHeader from '@components/Common/PageHeader';
import TemplateGallery from '@components/Service/TemplateGallery';
import { PromoProvider } from '@components/Promo/PromoProvider';

export const metadata: Metadata = {
  title: 'Live demos | Haziq Haiqal',
  description:
    'Try every website template, online store, 3D and automation demo before you buy.',
};

export default async function DemosPage() {
  const [{ profile }, templates, deals] = await Promise.all([
    getCachedPortfolio(),
    getCachedTemplates(),
    getCachedFeaturedDeals().catch(() => []),
  ]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className={`relative ${themeClasses.bg.primary}`}>
        <GridBackground />
        <NavBar />
        <PromoProvider>
          <main className="relative z-10">
            <section className="px-6 pb-24 pt-28 sm:px-10 md:pb-32 md:pt-40 lg:px-16">
              <div className="mx-auto max-w-6xl">
                <Link
                  href="/services"
                  className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  <ArrowLeft size={15} aria-hidden="true" />
                  Services & Pricing
                </Link>
                <PageHeader
                  icon={PlayCircle}
                  title="Live Demos"
                  accent="green"
                  subtitle="Try every template, store, 3D and automation demo. Each one shows its price."
                />
                <TemplateGallery
                  templates={templates}
                  whatsappHref={
                    profile?.whatsapp_url || DEFAULT_CONTACT.whatsapp
                  }
                  deals={deals}
                  pricesElsewhere
                />
              </div>
            </section>
          </main>
        </PromoProvider>
      </div>
      <Footer profile={profile} />
    </div>
  );
}
