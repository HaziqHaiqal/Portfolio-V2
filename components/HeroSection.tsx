import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Github, Linkedin, MapPin, Terminal } from 'lucide-react';
import { useTheme } from '@components/Provider/ThemeProvider';
import type { Profile } from '@lib/supabase';

interface HeroSectionProps {
  profile: Partial<Profile> | null;
}

const terminalCommands = [
  'npm install creativity',
  "git commit -m 'Add awesome features'",
  'docker run --rm innovation',
  'yarn build --production',
  'git push origin main',
];

const roleTitles = ['Software Developer', 'Gamer', 'Music & Piano Lover 🎹'];

const HeroSection = ({ profile }: HeroSectionProps) => {
  const { isDarkMode } = useTheme();

  // Terminal command cycling
  const [terminalText, setTerminalText] = useState(terminalCommands[0]);

  // Role titles typing effect
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  const [displayedRole, setDisplayedRole] = useState('');
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
          setDisplayedRole(
            currentRole.slice(0, currentRole.length - charIndex)
          );
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

  const codeSnippet = `const developer = {\n  name: '${
    profile?.display_name
  }',\n  location: '${
    profile?.location
  }',\n  skills: ['Coding', 'Playing Music']\n};`;

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  } as const;

  return (
    <section
      id="home"
      className={`relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-28 sm:pt-32 md:pt-48`}
    >
      <div className="relative z-10 mx-auto max-w-4xl text-center">
        {/* Terminal Window */}
        <motion.div
          className="absolute -right-80 -top-40 hidden lg:block"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: 1,
            scale: 1,
            x: [-5, 5, -5],
            y: [-3, 3, -3],
          }}
          transition={{
            duration: 0.8,
            delay: 0.5,
            x: { duration: 8, repeat: Infinity, ease: 'easeInOut' },
            y: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
          }}
        >
          <div className="w-80 rounded-lg bg-gray-900 p-4 shadow-2xl">
            <div className="mb-3 flex gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <div className="h-3 w-3 rounded-full bg-yellow-500" />
              <div className="h-3 w-3 rounded-full bg-green-500" />
            </div>
            <div className="font-mono text-xs text-green-400">
              <div className="text-gray-500">$ {terminalText}</div>
              <div className="animate-pulse text-green-400">█</div>
            </div>
          </div>
        </motion.div>

        {/* Code Snippet */}
        <motion.div
          className="absolute -left-80 -top-20 hidden xl:block"
          initial={{ opacity: 0, x: -50 }}
          animate={{
            opacity: 1,
            x: 0,
            y: [-8, 8, -8],
            rotate: [-1, 1, -1],
          }}
          transition={{
            duration: 0.8,
            delay: 0.3,
            y: { duration: 7, repeat: Infinity, ease: 'easeInOut' },
            rotate: { duration: 9, repeat: Infinity, ease: 'easeInOut' },
          }}
        >
          <div
            className={`rounded-lg border p-4 shadow-xl backdrop-blur-sm ${
              isDarkMode
                ? 'border-gray-700 bg-gray-800/80 text-gray-300'
                : 'border-gray-200 bg-white/80 text-gray-700'
            }`}
          >
            <pre className="whitespace-pre-wrap text-left font-mono text-xs">
              {codeSnippet}
            </pre>
          </div>
        </motion.div>

        {/* Avatar & Social */}
        <motion.div
          className="relative mb-8 md:mb-12"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="relative mx-auto mb-6 h-60 w-60 sm:h-64 sm:w-64 md:mb-8 md:h-72 md:w-72">
            {/* Animated Rings around Avatar */}
            {[1, 2, 3].map((ring) => (
              <motion.div
                key={ring}
                className="pointer-events-none absolute inset-0 rounded-full border-2"
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
                  ease: 'easeInOut',
                }}
              />
            ))}

            {/* Pulsing Background Glow */}
            <motion.div
              className="pointer-events-none absolute -inset-16 rounded-full"
              style={{
                background: isDarkMode
                  ? 'radial-gradient(circle, transparent 20%, rgba(59, 130, 246, 0.15) 40%, transparent 80%)'
                  : 'radial-gradient(circle, transparent 20%, rgba(59, 130, 246, 0.1) 40%, transparent 80%)',
                filter: 'blur(12px)',
              }}
              animate={{
                scale: [0.8, 1.3, 0.8],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
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
                x: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
                y: { duration: 5, repeat: Infinity, ease: 'easeInOut' },
              }}
            >
              {/* Avatar image container with scaling */}
              <motion.div
                className={`absolute inset-8 overflow-hidden rounded-full border-4 shadow-2xl ${
                  isDarkMode
                    ? 'border-gray-700 bg-gradient-to-br from-gray-700 via-gray-800 to-gray-700'
                    : 'border-white bg-gradient-to-br from-blue-100 via-white to-purple-100'
                }`}
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  scale: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
                }}
              >
                {profile?.profile_image_url ? (
                  <Image
                    src={profile.profile_image_url}
                    alt={profile.display_name || 'Profile Picture'}
                    fill
                    priority
                    sizes="(max-width: 640px) 192px, 256px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-6xl font-bold text-transparent">
                      {(profile?.display_name || 'H').charAt(0)}
                    </span>
                  </div>
                )}
              </motion.div>

              {/* Glowing Status indicator */}
              <motion.div
                className={`absolute bottom-12 right-12 h-6 w-6 rounded-full border-4 bg-green-500 ${isDarkMode ? 'border-gray-800' : 'border-white'}`}
                animate={{
                  boxShadow: [
                    '0 0 0 0px rgba(34, 197, 94, 0.7)',
                    '0 0 0 10px rgba(34, 197, 94, 0)',
                  ],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </motion.div>
          </div>

          {/* Social Icons with Enhanced Movement */}
          <div className="mb-8 flex justify-center gap-4">
            {[
              {
                href: profile?.linkedin_url,
                icon: <Linkedin size={20} className="text-white" />,
              },
              {
                href: profile?.github_url,
                icon: <Github size={20} className="text-white" />,
              },
            ].map((link, idx) => (
              <motion.a
                key={idx}
                href={link.href}
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-gray-800 to-gray-900 shadow-lg transition-transform duration-300 hover:scale-110"
                animate={{
                  y: idx % 2 === 0 ? [-3, 3, -3] : [3, -3, 3],
                  rotate: [-2, 2, -2],
                }}
                transition={{
                  y: { duration: 3 + idx, repeat: Infinity, ease: 'easeInOut' },
                  rotate: {
                    duration: 4 + idx,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  },
                }}
                whileHover={{
                  rotate: idx % 2 === 0 ? 15 : -15,
                  scale: 1.2,
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
          className="relative space-y-6"
          variants={fadeInUp}
          initial="initial"
          animate="animate"
        >
          <motion.div
            className="relative"
            animate={{
              y: [-2, 2, -2],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <h1
              className={`mb-4 text-5xl font-black md:text-7xl ${
                isDarkMode ? 'text-gray-100' : 'text-gray-900'
              }`}
            >
              Hi, I&apos;m{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {'Haziq'}
              </span>
            </h1>
          </motion.div>

          <div className="space-y-2">
            <motion.h2
              className={`text-2xl font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                x: [-1, 1, -1],
              }}
              transition={{
                duration: 1,
                delay: 0.5,
                x: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
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
              className={`flex items-center justify-center gap-2 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: 1,
                y: 0,
                x: [-0.5, 0.5, -0.5],
              }}
              transition={{
                duration: 0.6,
                delay: 0.8,
                x: { duration: 7, repeat: Infinity, ease: 'easeInOut' },
              }}
            >
              <MapPin size={16} className="text-red-500" />
              <span>{profile?.location || 'Damansara, Selangor'}</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
