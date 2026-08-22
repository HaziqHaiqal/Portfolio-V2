import React from 'react';
import { m } from 'framer-motion';
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
import { useTheme } from '@components/Provider/ThemeProvider';

const TechStackSection = () => {
  const { isDarkMode } = useTheme();

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
        <m.div
          className={`mx-auto max-w-5xl rounded-3xl p-10 shadow-2xl ${
            isDarkMode
              ? 'border border-gray-700 bg-gray-800/70'
              : 'border border-gray-200 bg-white/70'
          }`}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
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
                  className={`absolute inset-0 m-auto transition-all duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  } group-hover:scale-0 group-hover:opacity-0`}
                />
                {/* Text replaces icon on hover */}
                <span
                  className={`absolute inset-0 m-auto flex items-center justify-center text-xs font-semibold opacity-0 transition-all duration-300 group-hover:opacity-100 ${
                    isDarkMode ? 'text-blue-400' : 'text-blue-600'
                  }`}
                >
                  {stack.name}
                </span>
              </div>
            ))}
          </div>
        </m.div>
      </div>
    </section>
  );
};

export default TechStackSection;
