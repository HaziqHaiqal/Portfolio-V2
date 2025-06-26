import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Github,
  Linkedin,
  Mail,
  Terminal,
  MapPin,
} from "lucide-react";
import { useTheme, useThemeClasses } from "./providers/ThemeProvider";

interface HeroSectionProps {
  profile: Partial<Profile> | null;
}

export interface Profile {
  display_name: string;
  title: string;
  location: string;
  bio: string;
  years_coding: number;
  projects_count: number;
  coffee_consumed: string;
  lines_of_code: string;
  github_url: string;
  linkedin_url: string;
  email: string;
  full_name: string;
  phone: string;
}

const HeroSection = ({ profile }: HeroSectionProps) => {
  const { isDarkMode } = useTheme();
  const classes = useThemeClasses();

  // Terminal command cycling
  const terminalCommands = [
    "npm install creativity",
    "git commit -m 'Add awesome features'",
    "docker run --rm innovation",
    "yarn build --production",
    "git push origin main",
  ];
  const [terminalText, setTerminalText] = useState(terminalCommands[0]);

  // Role titles typing effect
  const roleTitles = ["Software Developer", "Gamer", "Music & Piano Lover 🎹"];
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  const [displayedRole, setDisplayedRole] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % terminalCommands.length;
      setTerminalText(terminalCommands[currentIndex]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const currentRole = roleTitles[currentRoleIndex];
    let charIndex = 0;

    if (isTyping) {
      // Typing effect
      const typeInterval = setInterval(() => {
        if (charIndex <= currentRole.length) {
          setDisplayedRole(currentRole.slice(0, charIndex));
          charIndex++;
        } else {
          clearInterval(typeInterval);
          // Pause before erasing
          setTimeout(() => {
            setIsTyping(false);
          }, 2000);
        }
      }, 100);

      return () => clearInterval(typeInterval);
    } else {
      // Erasing effect
      const eraseInterval = setInterval(() => {
        if (charIndex < currentRole.length) {
          setDisplayedRole(currentRole.slice(0, currentRole.length - charIndex));
          charIndex++;
        } else {
          clearInterval(eraseInterval);
          setCurrentRoleIndex((prev) => (prev + 1) % roleTitles.length);
          setIsTyping(true);
        }
      }, 50);

      return () => clearInterval(eraseInterval);
    }
  }, [currentRoleIndex, isTyping]);

  const codeSnippet = `const developer = {\n  name: '${profile?.display_name || "Haziq"
    }',\n  role: '${profile?.title || "Full-Stack Developer"
    }',\n  location: '${profile?.location || "Damansara, Malaysia"
    }',\n  skills: ['React', 'Java', 'Python'],\n  passion: 'Building amazing things ✨'\n};`;

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  } as const;

  return (
    <section id="home" className={`min-h-screen flex items-center justify-center px-6 pt-48 relative`}>
      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Terminal Window */}
        <motion.div
          className="absolute -top-40 -right-80 hidden lg:block"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="bg-gray-900 rounded-lg p-4 shadow-2xl w-80">
            <div className="flex gap-2 mb-3">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <div className="w-3 h-3 bg-yellow-500 rounded-full" />
              <div className="w-3 h-3 bg-green-500 rounded-full" />
            </div>
            <div className="font-mono text-green-400 text-xs">
              <div className="text-gray-500">$ {terminalText}</div>
              <div className="animate-pulse text-green-400">█</div>
            </div>
          </div>
        </motion.div>

        {/* Code Snippet */}
        <motion.div
          className="absolute -top-20 -left-80 hidden xl:block"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div
            className={`backdrop-blur-sm rounded-lg p-4 shadow-xl border ${isDarkMode
              ? "bg-gray-800/80 border-gray-700 text-gray-300"
              : "bg-white/80 border-gray-200 text-gray-700"
              }`}
          >
            <pre className="text-xs font-mono whitespace-pre-wrap">{codeSnippet}</pre>
          </div>
        </motion.div>

        {/* Avatar & Social */}
        <motion.div
          className="mb-12 relative"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="relative w-56 h-56 mx-auto mb-8">
            {/* Animated rings */}
            <motion.div
              className="absolute inset-0 border-2 border-dashed border-blue-300 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-4 border border-purple-300 rounded-full"
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            />

            <div
              className={`absolute inset-8 rounded-full overflow-hidden border-4 shadow-2xl ${isDarkMode
                ? "border-gray-700 bg-gradient-to-br from-gray-700 via-gray-800 to-gray-700"
                : "border-white bg-gradient-to-br from-blue-100 via-white to-purple-100"
                }`}
            >
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  H
                </span>
              </div>
            </div>

            {/* Status indicator */}
            <div
              className={`absolute bottom-8 right-8 w-8 h-8 bg-green-500 rounded-full border-4 flex items-center justify-center ${isDarkMode ? "border-gray-700" : "border-white"
                }`}
            >
              <motion.div
                className="w-2 h-2 bg-white rounded-full"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>

            {/* Floating skill */}
            <motion.div
              className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium"
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              React Expert
            </motion.div>
          </div>

          <div className="flex justify-center gap-4 mb-8">
            {[
              {
                href: "#",
                icon: <Linkedin size={20} className="text-white" />,
              },
              {
                href: "#",
                icon: <Github size={20} className="text-white" />,
              }
            ].map((link, idx) => (
              <motion.a
                key={idx}
                href={link.href}
                className="w-12 h-12 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl flex items-center justify-center hover:scale-110 transition-transform duration-300 shadow-lg"
                whileHover={{ rotate: idx % 2 === 0 ? 5 : -5 }}
                whileTap={{ scale: 0.95 }}
              >
                {link.icon}
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* Intro + stats */}
        <motion.div className="space-y-6 relative" variants={fadeInUp} initial="initial" animate="animate">
          <div className="relative">
            <h1
              className={`text-5xl md:text-7xl font-black mb-4 ${isDarkMode ? "text-gray-100" : "text-gray-900"
                }`}
            >
              Hi, I'm {" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {"Haziq"}
              </span>
            </h1>
          </div>

          <div className="space-y-2">
            <motion.h2
              className={`text-2xl font-bold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              <span className="inline-flex items-center justify-center gap-2">
                <Terminal size={24} className="text-blue-600" />
                <span className="min-w-[200px] text-center">
                  {displayedRole}
                  <span className="animate-pulse">|</span>
                </span>
              </span>
            </motion.h2>

            <motion.div
              className={`flex items-center justify-center gap-2 font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <MapPin size={16} className="text-red-500" />
              <span>{profile?.location || "Damansara, Selangor"}</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection; 
