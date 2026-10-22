import type { Metadata } from 'next';
import { Zap } from 'lucide-react';
import { getCachedPortfolio } from '@lib/data';
import HomeShell from '@app/HomeShell';
import PageHeader from '@components/Common/PageHeader';
import ProjectCaseStudies from '@components/List/ProjectCaseStudies';
import GetInTouchSection from '@components/GetInTouchSection';
import Footer from '@components/Layout/Footer';

export const metadata: Metadata = {
  title: 'Projects | Haziq Haiqal',
  description:
    'Websites, apps and systems, from client projects to personal builds.',
};

export default async function ProjectsPage() {
  const { profile, projects } = await getCachedPortfolio();

  return (
    <HomeShell profile={profile} footer={<Footer profile={profile} />}>
      <main className="relative z-10">
        <section className="px-6 pb-24 pt-28 sm:px-10 md:pb-32 md:pt-40 lg:px-16">
          <div className="mx-auto max-w-6xl">
            <PageHeader
              icon={Zap}
              title="Projects"
              subtitle="Websites, apps and systems, from client projects to personal builds."
            />
            <ProjectCaseStudies projects={projects} />
          </div>
        </section>
        <GetInTouchSection profile={profile} />
      </main>
    </HomeShell>
  );
}
