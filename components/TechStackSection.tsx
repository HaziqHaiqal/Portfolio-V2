import React from 'react';
import Reveal from '@components/Common/Reveal';
import { Code2 } from 'lucide-react';
import SectionHeader from '@components/Common/SectionHeader';
import {
  SiNextdotjs,
  SiReact,
  SiTailwindcss,
  SiJavascript,
  SiTypescript,
  SiNodedotjs,
  SiMysql,
  SiPostgresql,
  SiGit,
  SiGithub,
  SiPython,
} from 'react-icons/si';

const TechStackSection = () => {
  const stacks = [
    { name: 'Next.js', icon: SiNextdotjs },
    { name: 'React', icon: SiReact },
    { name: 'Tailwind CSS', icon: SiTailwindcss },
    { name: 'JavaScript', icon: SiJavascript },
    { name: 'TypeScript', icon: SiTypescript },
    { name: 'Node.js', icon: SiNodedotjs },
    { name: 'MySQL', icon: SiMysql },
    { name: 'PostgreSQL', icon: SiPostgresql },
    { name: 'Git', icon: SiGit },
    { name: 'GitHub', icon: SiGithub },
    { name: 'Python', icon: SiPython },
  ];

  return (
    <section className={`relative overflow-hidden px-6 py-32`}>
      {/* Matrix-style background */}
      <div className="absolute inset-0 opacity-20">
        <div className="matrix-rain" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <SectionHeader
          icon={Code2}
          label="tech.stack()"
          title="Tech Stack"
          accentClass="text-blue-500"
          gradientClass="from-blue-600 to-blue-400"
        />

        {/* Icon grid displaying tech stacks */}
        <Reveal
          className="mx-auto max-w-5xl rounded-3xl border border-gray-200 bg-white/70 p-10 shadow-2xl dark:border-gray-700 dark:bg-gray-800/70"
          y={50}
          duration={0.8}
          delay={0.2}
        >
          <div className="grid grid-cols-4 place-items-center gap-8 sm:grid-cols-6 md:grid-cols-8">
            {stacks.map((stack) => (
              <div
                key={stack.name}
                className="group relative flex h-12 w-12 items-center justify-center"
              >
                {/* Icon */}
                <stack.icon
                  size={40}
                  className="absolute inset-0 m-auto text-gray-700 transition-all duration-300 group-hover:scale-0 group-hover:opacity-0 dark:text-gray-300"
                />
                {/* Text replaces icon on hover */}
                <span className="absolute inset-0 m-auto flex items-center justify-center text-xs font-semibold text-blue-600 opacity-0 transition-all duration-300 group-hover:opacity-100 dark:text-blue-400">
                  {stack.name}
                </span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default TechStackSection;
