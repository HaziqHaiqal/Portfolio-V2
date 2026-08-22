'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { m, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useTheme } from '@components/Provider/ThemeProvider';
import { useUIStore } from '@lib/stores';
import type { Profile } from '@lib/supabase';

const ContactSection = dynamic(() => import('@components/ContactSection'), {
  ssr: false,
});

interface ContactModalProps {
  profile: Partial<Profile> | null;
}

/**
 * Floating launcher that opens the contact terminal as a centered modal.
 * Replaces the old "Let's Connect" section — the NavBar "Contact" link opens
 * this too, via the UI store.
 *
 * Closing is handled here — by this button, the backdrop or Escape — so the
 * window itself carries no close control.
 */
const ContactModal = ({ profile }: ContactModalProps) => {
  const { isDarkMode } = useTheme();
  const { isContactOpen, toggleContact, closeContact } = useUIStore();

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
              className={`fixed inset-0 z-[60] backdrop-blur-sm ${isDarkMode ? 'bg-black/70' : 'bg-gray-900/40'}`}
              onClick={closeContact}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />

            {/* Centering frame. Spans the viewport so the console sits in the
                middle, but stays click-through so the backdrop below still
                closes on an outside click and the launcher stays reachable. */}
            <div className="pointer-events-none fixed inset-0 z-[70] flex items-center justify-center px-3 pb-16 pt-20 sm:px-6 sm:pb-24">
              <m.div
                role="dialog"
                aria-modal="true"
                aria-label="Contact terminal"
                className={`pointer-events-auto relative h-[680px] max-h-full w-full max-w-5xl overflow-hidden rounded-2xl border ${
                  isDarkMode
                    ? 'border-gray-700/60 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.75)]'
                    : 'border-gray-200 shadow-[0_40px_120px_-20px_rgba(15,23,42,0.35)]'
                }`}
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

      {/* Floating launcher */}
      <m.button
        onClick={toggleContact}
        className={`group fixed bottom-4 right-4 z-[70] flex h-10 w-10 items-center justify-center rounded-full border shadow-lg transition-colors sm:bottom-6 sm:right-6 sm:h-12 sm:w-12 ${
          isDarkMode
            ? 'border-gray-700 bg-gray-800 text-emerald-400 hover:border-emerald-400/50'
            : 'border-gray-200 bg-white text-emerald-600 hover:border-emerald-500/50'
        }`}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 26, delay: 0.6 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        aria-expanded={isContactOpen}
        aria-label={
          isContactOpen ? 'Close contact terminal' : 'Open contact terminal'
        }
        title={isContactOpen ? 'Close terminal' : 'Get in touch'}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isContactOpen ? (
            <m.span
              key="close"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              transition={{ duration: 0.12 }}
            >
              <X size={18} />
            </m.span>
          ) : (
            <m.span
              key="prompt"
              className="flex items-center font-mono text-sm font-bold"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.12 }}
            >
              ❯
              <span className="ml-0.5 inline-block h-[2px] w-[7px] animate-pulse bg-emerald-400" />
            </m.span>
          )}
        </AnimatePresence>
      </m.button>
    </>
  );
};

export default ContactModal;
