import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Github,
  Linkedin,
  MapPin,
  Terminal
} from "lucide-react";
import { useTheme } from "./providers/ThemeProvider";

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
  profile_image_url?: string;
}

const terminalCommands = [
  "npm install creativity",
  "git commit -m 'Add awesome features'",
  "docker run --rm innovation",
  "yarn build --production",
  "git push origin main",
];

const roleTitles = ["Software Developer", "Gamer", "Music & Piano Lover 🎹"];

const HeroSection = ({ profile }: HeroSectionProps) => {
  const { isDarkMode } = useTheme();

  // Terminal command cycling
  const [terminalText, setTerminalText] = useState(terminalCommands[0]);

  // Role titles typing effect
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

  const codeSnippet = `const developer = {\n  name: '${profile?.display_name
    }',\n  location: '${profile?.location
    }',\n  skills: ['Coding', 'Playing Music']\n};`;

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  } as const;

  return (
    <section id="home" className={`min-h-screen flex items-center justify-center px-6 pt-48 relative overflow-hidden`}>
      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Terminal Window */}
        <motion.div
          className="absolute -top-40 -right-80 hidden lg:block"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: 1,
            scale: 1,
            x: [-5, 5, -5],
            y: [-3, 3, -3]
          }}
          transition={{
            duration: 0.8,
            delay: 0.5,
            x: { duration: 8, repeat: Infinity, ease: "easeInOut" },
            y: { duration: 6, repeat: Infinity, ease: "easeInOut" }
          }}
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
          animate={{
            opacity: 1,
            x: 0,
            y: [-8, 8, -8],
            rotate: [-1, 1, -1]
          }}
          transition={{
            duration: 0.8,
            delay: 0.3,
            y: { duration: 7, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 9, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          <div
            className={`backdrop-blur-sm rounded-lg p-4 shadow-xl border ${isDarkMode
              ? "bg-gray-800/80 border-gray-700 text-gray-300"
              : "bg-white/80 border-gray-200 text-gray-700"
              }`}
          >
            <pre className="text-xs text-left font-mono whitespace-pre-wrap ">{codeSnippet}</pre>
          </div>
        </motion.div>

        {/* Avatar & Social */}
        <motion.div
          className="mb-12 relative"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="relative w-72 h-72 mx-auto mb-8">
            {/* Animated Rings around Avatar */}
            {[1, 2, 3].map((ring) => (
              <motion.div
                key={ring}
                className="absolute inset-0 rounded-full border-2 pointer-events-none"
                style={{
                  borderColor: isDarkMode
                    ? `rgba(59, 130, 246, ${0.3 - ring * 0.08})`
                    : `rgba(59, 130, 246, ${0.4 - ring * 0.1})`,
                  top: `-${ring * 12}px`,
                  left: `-${ring * 12}px`,
                  right: `-${ring * 12}px`,
                  bottom: `-${ring * 12}px`,
                }}
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.6, 0.2, 0.6],
                  rotate: ring % 2 === 0 ? [0, 360] : [360, 0],
                }}
                transition={{
                  duration: 4 + ring,
                  delay: ring * 0.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            ))}

            {/* Pulsing Background Glow */}
            <motion.div
              className="absolute -inset-16 rounded-full pointer-events-none"
              style={{
                background: isDarkMode
                  ? "radial-gradient(circle, transparent 20%, rgba(59, 130, 246, 0.15) 40%, transparent 80%)"
                  : "radial-gradient(circle, transparent 20%, rgba(59, 130, 246, 0.1) 40%, transparent 80%)",
                filter: "blur(12px)",
              }}
              animate={{
                scale: [0.8, 1.3, 0.8],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Container for Avatar and Status Dot Movement */}
            <motion.div
              className="absolute inset-0"
              animate={{
                x: [-8, 8, -8],
                y: [-5, 5, -5],
              }}
              transition={{
                x: { duration: 6, repeat: Infinity, ease: "easeInOut" },
                y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
              }}
            >
              {/* Avatar image container with scaling */}
              <motion.div
                className={`absolute inset-8 rounded-full overflow-hidden border-4 shadow-2xl ${isDarkMode
                  ? "border-gray-700 bg-gradient-to-br from-gray-700 via-gray-800 to-gray-700"
                  : "border-white bg-gradient-to-br from-blue-100 via-white to-purple-100"
                  }`}
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                }}
              >
                {profile?.profile_image_url ? (
                  <Image
                    src={profile.profile_image_url}
                    alt={profile.display_name || 'Profile Picture'}
                    layout="fill"
                    objectFit="cover"
                    className="w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {(profile?.display_name || "H").charAt(0)}
                    </span>
                  </div>
                )}
              </motion.div>

              {/* Glowing Status indicator */}
              <motion.div
                className={`absolute bottom-12 right-12 w-6 h-6 bg-green-500 rounded-full border-4 ${isDarkMode ? "border-gray-800" : "border-white"}`}
                animate={{
                  boxShadow: [
                    "0 0 0 0px rgba(34, 197, 94, 0.7)",
                    "0 0 0 10px rgba(34, 197, 94, 0)",
                  ],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.div>
          </div>

          {/* Social Icons with Enhanced Movement */}
          <div className="flex justify-center gap-4 mb-8">
            {[
              {
                href: profile?.linkedin_url,
                icon: <Linkedin size={20} className="text-white" />,
              },
              {
                href: profile?.github_url,
                icon: <Github size={20} className="text-white" />,
              }
            ].map((link, idx) => (
              <motion.a
                key={idx}
                href={link.href}
                className="w-12 h-12 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl flex items-center justify-center hover:scale-110 transition-transform duration-300 shadow-lg"
                animate={{
                  y: idx % 2 === 0 ? [-3, 3, -3] : [3, -3, 3],
                  rotate: [-2, 2, -2]
                }}
                transition={{
                  y: { duration: 3 + idx, repeat: Infinity, ease: "easeInOut" },
                  rotate: { duration: 4 + idx, repeat: Infinity, ease: "easeInOut" }
                }}
                whileHover={{
                  rotate: idx % 2 === 0 ? 15 : -15,
                  scale: 1.2
                }}
                whileTap={{ scale: 0.95 }}
              >
                {link.icon}
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* Intro + stats with subtle movement */}
        <motion.div
          className="space-y-6 relative"
          variants={fadeInUp}
          initial="initial"
          animate="animate"
        >
          <motion.div
            className="relative"
            animate={{
              y: [-2, 2, -2]
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <h1
              className={`text-5xl md:text-7xl font-black mb-4 ${isDarkMode ? "text-gray-100" : "text-gray-900"
                }`}
            >
              Hi, I&apos;m{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {"Haziq"}
              </span>
            </h1>
          </motion.div>

          <div className="space-y-2">
            <motion.h2
              className={`text-2xl font-bold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                x: [-1, 1, -1]
              }}
              transition={{
                duration: 1,
                delay: 0.5,
                x: { duration: 6, repeat: Infinity, ease: "easeInOut" }
              }}
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
              animate={{
                opacity: 1,
                y: 0,
                x: [-0.5, 0.5, -0.5]
              }}
              transition={{
                duration: 0.6,
                delay: 0.8,
                x: { duration: 7, repeat: Infinity, ease: "easeInOut" }
              }}
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
