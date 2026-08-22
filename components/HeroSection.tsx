'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { m } from 'framer-motion';
import { Terminal } from 'lucide-react';
import { SiGithub, SiLinkedin, SiWhatsapp } from 'react-icons/si';
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

const TerminalLine = () => {
  const [terminalText, setTerminalText] = useState(terminalCommands[0]);

  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % terminalCommands.length;
      setTerminalText(terminalCommands[currentIndex]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return <div className="text-gray-500">$ {terminalText}</div>;
};

const TypedRole = () => {
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  const [displayedRole, setDisplayedRole] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    const currentRole = roleTitles[currentRoleIndex];
    let charIndex = 0;

    if (isTyping) {
      const typeInterval = setInterval(() => {
        if (charIndex <= currentRole.length) {
          setDisplayedRole(currentRole.slice(0, charIndex));
          charIndex++;
        } else {
          clearInterval(typeInterval);
          setTimeout(() => {
            setIsTyping(false);
          }, 2000);
        }
      }, 100);

      return () => clearInterval(typeInterval);
    } else {
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

  return (
    <span className="min-w-[200px] text-center">
      {displayedRole}
      <span className="animate-pulse">|</span>
    </span>
  );
};

const HeroSection = ({ profile }: HeroSectionProps) => {
  const whatsappUrl = profile?.whatsapp_url;
  const codeSnippet = `const developer = {\n  name: '${
    profile?.display_name
  }',\n  location: '${
    profile?.location
  }',\n  skills: ['Coding', 'Playing Music']\n};`;

  return (
    <section
      id="home"
      className={`relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-20 sm:pt-24 md:pt-36`}
    >
      <div className="relative z-10 mx-auto max-w-4xl text-center">
        {/* Terminal Window */}
        <div
          className="enter-pop absolute -left-80 -top-24 hidden lg:block"
          style={{ animationDuration: '0.8s', animationDelay: '0.5s' }}
        >
          <div className="hero-drift-terminal w-80 rounded-lg bg-gray-900 p-4 shadow-2xl">
            <div className="mb-3 flex gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <div className="h-3 w-3 rounded-full bg-yellow-500" />
              <div className="h-3 w-3 rounded-full bg-green-500" />
            </div>
            <div className="font-mono text-xs text-green-400">
              <TerminalLine />
              <div className="animate-pulse text-green-400">█</div>
            </div>
          </div>
        </div>

        {/* Code Snippet */}
        <div
          className="enter-right absolute -right-80 -top-20 hidden xl:block"
          style={{ animationDuration: '0.8s', animationDelay: '0.3s' }}
        >
          <div
            className={`hero-drift-code rounded-lg border border-gray-200 bg-white/80 p-4 text-gray-700 shadow-xl backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/80 dark:text-gray-300`}
          >
            <pre className="whitespace-pre-wrap text-left font-mono text-xs">
              {codeSnippet}
            </pre>
          </div>
        </div>

        {/* Avatar & Social */}
        <div
          className="enter-pop relative mb-8 md:mb-12"
          style={{ animationDuration: '0.8s' }}
        >
          <div className="relative mx-auto mb-6 h-60 w-60 sm:h-64 sm:w-64 md:mb-8 md:h-72 md:w-72">
            {/* Animated Rings around Avatar */}
            {[1, 2, 3].map((ring) => (
              <div
                key={ring}
                className="hero-ring pointer-events-none absolute inset-0 rounded-full border-2"
                style={{
                  borderColor: `rgb(59 130 246 / calc(var(--hero-ring-base) - ${ring} * var(--hero-ring-step)))`,
                  top: `-${ring * 12}px`,
                  left: `-${ring * 12}px`,
                  right: `-${ring * 12}px`,
                  bottom: `-${ring * 12}px`,
                  animationDuration: `${4 + ring}s`,
                  animationDelay: `${ring * 0.5}s`,
                  animationDirection: ring % 2 === 0 ? 'reverse' : 'normal',
                }}
              />
            ))}

            {/* Pulsing Background Glow */}
            <div
              className="hero-glow pointer-events-none absolute -inset-16 rounded-full"
              style={{
                background:
                  'radial-gradient(circle, transparent 20%, rgb(59 130 246 / var(--hero-glow-a)) 40%, transparent 80%)',
                filter: 'blur(12px)',
              }}
            />

            {/* Container for Avatar and Status Dot Movement */}
            <div className="hero-drift-avatar absolute inset-0">
              {/* Avatar image container with scaling */}
              <div
                className={`hero-breathe absolute inset-8 overflow-hidden rounded-full border-4 border-white bg-gradient-to-br from-blue-100 via-white to-purple-100 shadow-2xl dark:border-gray-700 dark:bg-gradient-to-br dark:from-gray-700 dark:via-gray-800 dark:to-gray-700`}
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
              </div>

              {/* Glowing Status indicator */}
              <div className="absolute bottom-12 right-12 h-6 w-6">
                <span
                  aria-hidden
                  className="hero-ping absolute inset-0 rounded-full bg-green-500/70"
                />
                <span
                  className={`absolute inset-0 rounded-full border-4 border-white bg-green-500 dark:border-gray-800`}
                />
              </div>
            </div>
          </div>

          {/* Social Icons with Enhanced Movement */}
          <div className="mb-8 flex justify-center gap-4">
            {[
              {
                href: profile?.linkedin_url,
                icon: <SiLinkedin size={20} className="text-white" />,
              },
              {
                href: profile?.github_url,
                icon: <SiGithub size={20} className="text-white" />,
              },
              {
                href: whatsappUrl,
                icon: <SiWhatsapp size={20} className="text-white" />,
              },
            ]
              .filter((link) => link.href)
              .map((link, idx) => (
                <div
                  key={idx}
                  className="hero-bob"
                  style={{
                    animationDuration: `${3 + idx}s`,
                    animationDirection: idx % 2 === 0 ? 'normal' : 'reverse',
                  }}
                >
                  <m.a
                    href={link.href || undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-gray-800 to-gray-900 shadow-lg"
                    whileHover={{
                      rotate: idx % 2 === 0 ? 15 : -15,
                      scale: 1.2,
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {link.icon}
                  </m.a>
                </div>
              ))}
          </div>
        </div>

        {/* Intro + stats with subtle movement */}
        <div className="enter-up relative space-y-6">
          <div className="hero-float relative">
            <h1
              className={`mb-4 text-5xl font-black text-gray-900 dark:text-gray-100 md:text-7xl`}
            >
              Hi, I&apos;m{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {'Haziq'}
              </span>
            </h1>
          </div>

          <div className="space-y-2">
            <div className="hero-float" style={{ animationDuration: '6s' }}>
              <h2
                className={`enter-fade text-2xl font-bold text-gray-700 dark:text-gray-300`}
                style={{ animationDuration: '1s', animationDelay: '0.5s' }}
              >
                <span className="inline-flex items-center justify-center gap-2">
                  <Terminal size={24} className="text-blue-600" />
                  <TypedRole />
                </span>
              </h2>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
