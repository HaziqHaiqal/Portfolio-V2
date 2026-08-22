import { getCachedPortfolio } from '@lib/data';
import SplashScreen from '@components/Layout/SplashScreen';
import HomeShell from './HomeShell';
import HeroSection from '@components/HeroSection';
import ActivitySlot from '@components/ActivitySlot';
import TechStackSection from '@components/TechStackSection';
import ExperienceSection from '@components/ExperienceSection';
import EducationSection from '@components/EducationSection';
import ProjectSection from '@components/ProjectSection';
import ServiceSection from '@components/ServiceSection';
import Footer from '@components/Layout/Footer';

// The root layout reads the theme cookie, so this route is always dynamic and
// a route-level `revalidate` would never apply. Caching lives in the data layer.
export default async function Home() {
  const { profile, experience, education, projects } =
    await getCachedPortfolio();

  return (
    <>
      <SplashScreen />
      <HomeShell profile={profile} footer={<Footer profile={profile} />}>
        <HeroSection profile={profile} />
        <ActivitySlot />
        <TechStackSection />
        <ExperienceSection experience={experience} />
        <EducationSection education={education} />
        <ProjectSection projects={projects} />
        <ServiceSection />
      </HomeShell>
    </>
  );
}
