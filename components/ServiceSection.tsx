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
            className="group inline-flex items-center gap-2.5 rounded-full bg-gray-900 px-8 py-4 text-base font-medium text-white shadow-[0_0_45px_rgba(17,24,39,0.25)] transition-transform hover:scale-[1.03] dark:bg-white dark:text-gray-900 dark:shadow-[0_0_45px_rgba(255,255,255,0.3)]"
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
