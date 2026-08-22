import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import Reveal from '@components/Common/Reveal';

const ServiceSection = () => {
  return (
    <section id="services" className="relative overflow-hidden px-6 py-20">
      <div className="relative z-10 mx-auto max-w-7xl">
        <Reveal
          className="gradient-border rounded-[28px] px-6 py-24 text-center md:py-32"
          y={30}
          duration={0.7}
        >
          <h2 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
            Let&apos;s build something.
          </h2>

          <p className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-gray-600 dark:text-gray-400 md:text-xl">
            Open for new opportunities and interesting projects. Feel free to
            reach out if you want to collaborate or just say hi.
          </p>

          <Link
            href="/service"
            className="group inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white/60 px-6 py-3 text-sm font-medium text-gray-800 shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-blue-500/60 hover:bg-white hover:text-blue-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800/60 dark:text-gray-200 dark:hover:border-blue-400/60 dark:hover:bg-gray-800 dark:hover:text-blue-400 sm:text-base"
          >
            View Services
            <ArrowUpRight
              size={18}
              strokeWidth={2.25}
              className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </Link>
        </Reveal>
      </div>
    </section>
  );
};

export default ServiceSection;
