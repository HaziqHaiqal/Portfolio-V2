import React from "react";
import { motion } from "framer-motion";
import { Code2 } from "lucide-react";
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
} from "react-icons/si";
import { useTheme } from "@components/providers/ThemeProvider";

const TechStackSection = () => {
  const { isDarkMode } = useTheme();

  const stacks = [
    { name: "Next.js", icon: SiNextdotjs },
    { name: "React", icon: SiReact },
    { name: "Tailwind CSS", icon: SiTailwindcss },
    { name: "JavaScript", icon: SiJavascript },
    { name: "TypeScript", icon: SiTypescript },
    { name: "Node.js", icon: SiNodedotjs },
    { name: "MySQL", icon: SiMysql },
    { name: "PostgreSQL", icon: SiPostgresql },
    { name: "Git", icon: SiGit },
    { name: "GitHub", icon: SiGithub },
    { name: "Python", icon: SiPython },
  ];

  return (
    <section
      className={`py-32 px-6 relative overflow-hidden`}
    >
      {/* Matrix-style background */}
      <div className="absolute inset-0 opacity-20">
        <div className="matrix-rain" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full font-bold text-xl mb-8 shadow-xl"
            whileHover={{ scale: 1.05 }}
          >
            <Code2 size={24} />
            tech.stack()
          </motion.div>
          <p
            className={`text-xl leading-relaxed max-w-3xl mx-auto font-mono ${isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
          >
            <span className="text-blue-600">$</span> npm install --save expertise
          </p>
        </motion.div>

        {/* Icon grid displaying tech stacks */}
        <motion.div
          className={`rounded-3xl p-10 shadow-2xl max-w-5xl mx-auto ${isDarkMode ? "bg-gray-800/70 border border-gray-700" : "bg-white/70 border border-gray-200"
            }`}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-8 place-items-center">
            {stacks.map((stack) => (
              <div key={stack.name} className="group relative flex items-center justify-center w-12 h-12">
                {/* Icon */}
                <stack.icon
                  size={40}
                  className={`absolute inset-0 m-auto transition-all duration-300 ${isDarkMode ? "text-gray-300" : "text-gray-700"
                    } group-hover:opacity-0 group-hover:scale-0`}
                />
                {/* Text replaces icon on hover */}
                <span
                  className={`absolute inset-0 m-auto flex items-center justify-center text-xs font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 ${isDarkMode ? "text-blue-400" : "text-blue-600"
                    }`}
                >
                  {stack.name}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TechStackSection; 