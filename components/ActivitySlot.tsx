'use client';

import dynamic from 'next/dynamic';
import { Github } from 'lucide-react';
import SectionHeader from '@components/Common/SectionHeader';

function ActivityFallback() {
  return (
    <section className="relative px-4 py-16 md:px-6 md:py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          icon={Github}
          label="github.activity()"
          title="GitHub Activity"
          accentClass="text-cyan-500"
          gradientClass="from-cyan-600 to-cyan-400"
        />
        <div className="flex justify-center">
          <div className="min-h-[240px] w-full max-w-[920px] rounded-2xl border border-white/50 bg-white/90 shadow-2xl backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-800/90 md:min-h-[344px] md:rounded-3xl" />
        </div>
      </div>
    </section>
  );
}

const ActivityOverview = dynamic(() => import('@components/ActivityOverview'), {
  ssr: false,
  loading: () => <ActivityFallback />,
});

export default function ActivitySlot() {
  return <ActivityOverview />;
}
