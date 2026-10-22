import type { Metadata } from 'next';
import { Mail } from 'lucide-react';
import { getCachedPortfolio } from '@lib/data';
import HomeShell from '@app/HomeShell';
import PageHeader from '@components/Common/PageHeader';
import ContactOptions from '@components/ContactOptions';
import Footer from '@components/Layout/Footer';

export const metadata: Metadata = {
  title: 'Contact | Haziq Haiqal',
  description:
    'Get in touch on WhatsApp, email or phone about a website, app or automation project.',
};

export default async function ContactPage() {
  const { profile } = await getCachedPortfolio();

  return (
    <HomeShell profile={profile} footer={<Footer profile={profile} />}>
      <main className="relative z-10">
        <section className="px-6 pb-24 pt-28 sm:px-10 md:pb-32 md:pt-40 lg:px-16">
          <PageHeader
            icon={Mail}
            title="Let's build something"
            subtitle="Have a project in mind, or not sure where to start? Send a message and get a clear recommendation."
          />
          <ContactOptions profile={profile} />
        </section>
      </main>
    </HomeShell>
  );
}
