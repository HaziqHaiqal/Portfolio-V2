'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { m, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useUIStore } from '@lib/stores';
import type { Profile } from '@lib/supabase';
import SpookyBot from '@components/Common/SpookyBot';

const ContactSection = dynamic(() => import('@components/ContactSection'), {
  ssr: false,
});

const GREETED_KEY = 'spooky-greeted-at';
const GREET_EVERY = 10 * 60 * 1000;
const GREET_FOR = 4000;
const GREETINGS = ["Hi, I'm Spooky!", "Let's talk!"];

const lastGreeted = () => {
  try {
    return Number(localStorage.getItem(GREETED_KEY)) || 0;
  } catch {
    return 0;
  }
};

const markGreeted = () => {
  try {
    localStorage.setItem(GREETED_KEY, String(Date.now()));
  } catch {
    return;
  }
};

interface ContactModalProps {
  profile: Partial<Profile> | null;
}

const ContactModal = ({ profile }: ContactModalProps) => {
  const { isContactOpen, isChatVisible, toggleContact, closeContact } =
    useUIStore();
  const [hovered, setHovered] = useState(false);
  const [greeting, setGreeting] = useState<string | null>(null);

  useEffect(() => {
    let timer = 0;
    const schedule = () => {
      const soonest = Date.now() + 4000 + Math.random() * 8000;
      const due = Math.max(soonest, lastGreeted() + GREET_EVERY);
      timer = window.setTimeout(greet, due - Date.now());
    };
    const greet = () => {
      const { isContactOpen, isChatVisible } = useUIStore.getState();
      markGreeted();
      if (isContactOpen || !isChatVisible || document.hidden) return schedule();
      setGreeting(GREETINGS[Math.floor(Math.random() * GREETINGS.length)]);
      timer = window.setTimeout(() => {
        setGreeting(null);
        schedule();
      }, GREET_FOR);
    };
    schedule();
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isContactOpen) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isContactOpen]);

  useEffect(() => {
    if (!isContactOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeContact();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isContactOpen, closeContact]);

  return (
    <>
      <AnimatePresence>
        {isContactOpen && (
          <>
            <m.div
              className={`fixed inset-0 z-[60] bg-gray-900/40 backdrop-blur-sm dark:bg-black/70`}
              onClick={closeContact}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />

            <div className="pointer-events-none fixed inset-0 z-[70] flex items-center justify-center px-3 pb-16 pt-20 sm:px-6 sm:pb-24">
              <m.div
                role="dialog"
                aria-modal="true"
                aria-label="Contact terminal"
                className={`pointer-events-auto relative h-[680px] max-h-full w-full max-w-5xl overflow-hidden rounded-2xl border border-gray-200 shadow-[0_40px_120px_-20px_rgba(15,23,42,0.35)] dark:border-gray-700/60 dark:shadow-[0_40px_120px_-20px_rgba(0,0,0,0.75)]`}
                initial={{ opacity: 0, scale: 0.97, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: 16 }}
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              >
                <ContactSection profile={profile} />
              </m.div>
            </div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isChatVisible && (
          <m.button
            key="contact-launcher"
            onClick={toggleContact}
            className="group fixed bottom-[max(0.5rem,env(safe-area-inset-bottom))] right-3 z-[70] flex h-12 w-12 items-center justify-center overflow-visible rounded-full outline-none focus-visible:ring-4 focus-visible:ring-emerald-400/30 sm:bottom-6 sm:right-6 sm:h-14 sm:w-14"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.15 } }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 26,
              delay: 0.6,
            }}
            whileHover={{ scale: 1.08, y: -2 }}
            onHoverStart={() => setHovered(true)}
            onHoverEnd={() => setHovered(false)}
            whileTap={{ scale: 0.94, y: 0 }}
            aria-expanded={isContactOpen}
            aria-label={
              isContactOpen ? 'Close contact terminal' : 'Open contact terminal'
            }
          >
            <AnimatePresence>
              {greeting && !isContactOpen && (
                <m.span
                  key="greeting"
                  aria-hidden="true"
                  className="absolute bottom-full right-0 mb-1 origin-[calc(100%-24px)_100%] whitespace-nowrap rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-semibold text-gray-900 shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 sm:mb-0 sm:origin-[calc(100%-28px)_100%]"
                  initial={{ opacity: 0, y: 6, scale: 0.85 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 24 }}
                >
                  {greeting}
                  <span className="absolute -bottom-[7px] right-[18px] h-3 w-3 rotate-45 border-b border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 sm:right-[22px]" />
                </m.span>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait" initial={false}>
              {isContactOpen ? (
                <m.span
                  key="close"
                  className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-emerald-500/60 bg-white text-emerald-600 shadow-[0_8px_24px_-10px_rgba(16,185,129,0.7)] transition-colors duration-200 group-hover:bg-emerald-50 dark:border-emerald-400/60 dark:bg-gray-900 dark:text-emerald-300 dark:group-hover:bg-gray-800 sm:h-12 sm:w-12"
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.12 }}
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.5} />
                </m.span>
              ) : (
                <m.span
                  key="spooky"
                  aria-hidden="true"
                  className="absolute inset-0 flex items-end justify-center"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.12 }}
                >
                  <SpookyBot
                    excited={hovered || !!greeting}
                    className="h-10 w-10 drop-shadow-[0_5px_7px_rgba(15,23,42,0.28)] sm:h-11 sm:w-11"
                  />
                </m.span>
              )}
            </AnimatePresence>
          </m.button>
        )}
      </AnimatePresence>
    </>
  );
};

export default ContactModal;
