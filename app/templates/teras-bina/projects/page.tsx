import type { Metadata } from 'next';
import ProjectGrid from '@components/Templates/teras-bina/Projects';
import { RevealText } from '@components/Templates/motion';

export const metadata: Metadata = { title: 'Projects' };

export default function TerasBinaProjects() {
  return (
    <section className="mx-auto max-w-7xl px-5 pb-24 pt-16 md:px-8 md:pb-36 md:pt-24">
      <h1 className="text-5xl font-semibold tracking-[-0.045em] md:text-8xl">
        <RevealText text="Projects" />
      </h1>
      <p className="mt-6 max-w-xl text-lg leading-relaxed text-tpl-muted">
        A selection from the last five years. Tap a project for the client,
        value and scope.
      </p>
      <div className="mt-12">
        <ProjectGrid />
      </div>
    </section>
  );
}
