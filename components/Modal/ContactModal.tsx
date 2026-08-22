'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { m, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
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

      {/* Floating launcher */}
      <m.button
        onClick={toggleContact}
        className="group fixed bottom-4 right-4 z-[70] flex h-10 w-10 items-center justify-center overflow-visible rounded-full border-2 border-emerald-500/60 bg-white text-emerald-600 shadow-[0_8px_24px_-10px_rgba(16,185,129,0.7)] outline-none transition-colors duration-200 hover:bg-emerald-50 hover:text-emerald-700 focus-visible:ring-4 focus-visible:ring-emerald-400/30 dark:border-emerald-400/60 dark:bg-gray-900 dark:text-emerald-300 dark:hover:bg-gray-800 dark:hover:text-emerald-200 sm:bottom-6 sm:right-6 sm:h-12 sm:w-12"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 26, delay: 0.6 }}
        whileHover={{ scale: 1.08, y: -2 }}
        whileTap={{ scale: 0.94, y: 0 }}
        aria-expanded={isContactOpen}
        aria-label={
          isContactOpen ? 'Close contact terminal' : 'Open contact terminal'
        }
      >
        <span className="pointer-events-none absolute bottom-full right-0 mb-2 translate-y-1 whitespace-nowrap rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-800 opacity-0 shadow-lg transition duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100">
          {isContactOpen ? 'Close' : "Let's talk"}
        </span>

        <AnimatePresence mode="wait" initial={false}>
          {isContactOpen ? (
            <m.span
              key="close"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              transition={{ duration: 0.12 }}
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.5} />
            </m.span>
          ) : (
            <m.span
              key="prompt"
              aria-hidden="true"
              className="flex items-center font-mono text-xs font-bold sm:text-sm"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.12 }}
            >
              ❯
              <span className="ml-0.5 inline-block h-[2px] w-2 bg-current motion-safe:animate-pulse" />
            </m.span>
          )}
        </AnimatePresence>
      </m.button>
    </>
  );
};

export default ContactModal;
