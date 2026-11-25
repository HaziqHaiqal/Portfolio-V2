import type { Metadata } from 'next';
import { getCachedPortfolio } from '@lib/data';
import { HOME_DESCRIPTION, jsonLd, personJsonLd } from '@lib/seo';
import SplashScreen from '@components/Layout/SplashScreen';
import HomeShell from './HomeShell';
import HeroSection from '@components/HeroSection';
import ActivitySlot from '@components/ActivitySlot';
import TechStackSection from '@components/TechStackSection';
import ExperienceSection from '@components/ExperienceSection';
import EducationSection from '@components/EducationSection';
import GetInTouchSection from '@components/GetInTouchSection';
import Footer from '@components/Layout/Footer';

export const metadata: Metadata = {
  title: 'Haziq Haiqal | Software Developer Portfolio',
  description: HOME_DESCRIPTION,
  alternates: { canonical: '/' },
};

// Always dynamic (the layout reads the theme cookie), so caching lives in the data layer.
export default async function Home() {
  const portfolio = await getCachedPortfolio();
  const { profile, experience, education } = portfolio;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(personJsonLd(portfolio))}
      />
      <SplashScreen />
      <HomeShell profile={profile} footer={<Footer profile={profile} />}>
        <HeroSection profile={profile} />
        <ActivitySlot />
        <ExperienceSection experience={experience} />
        <EducationSection education={education} />
        <TechStackSection />
        <GetInTouchSection profile={profile} />
      </HomeShell>
    </>
  );
}
