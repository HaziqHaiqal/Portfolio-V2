import Link from 'next/link';
import { ArrowRight, Mail, Phone } from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import type { Profile } from '@lib/supabase';
import { DEFAULT_CONTACT } from '@constants/contact';
import Reveal from '@components/Common/Reveal';

const BUTTON_SHAPE =
  'inline-flex h-12 w-12 items-center justify-center gap-2 rounded-full text-sm sm:w-auto sm:px-6';
const OUTLINE_BUTTON = `${BUTTON_SHAPE} border border-gray-300 bg-white/60 font-semibold text-gray-800 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-green-500/60 hover:text-green-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-500/20 dark:border-gray-600 dark:bg-gray-800/60 dark:text-gray-200 dark:hover:text-green-400`;

export default function GetInTouchSection({
  profile,
}: {
  profile: Profile | null;
}) {
  const whatsapp = new URL(profile?.whatsapp_url || DEFAULT_CONTACT.whatsapp);
  whatsapp.searchParams.set('text', "Hi Haziq, I'd like to discuss a project.");
  const email = profile?.email || DEFAULT_CONTACT.email;
  const phone = profile?.phone?.trim();

  return (
    <section id="contact" className="relative overflow-hidden px-6 py-20">
      <div className="relative z-10 mx-auto max-w-7xl">
        <Reveal
          className="gradient-border rounded-[28px] px-6 py-24 text-center md:py-32"
          y={30}
          duration={0.7}
        >
          <h2 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
            Let&apos;s build something.
          </h2>

          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-gray-600 dark:text-gray-400 md:text-xl">
            Have a project in mind, or not sure where to start? Send a message
            and get a clear recommendation.
          </p>

          <div className="flex items-center justify-center gap-3">
            <a
              href={whatsapp.toString()}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className={`${BUTTON_SHAPE} bg-green-600 font-semibold text-white shadow-lg shadow-green-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-green-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-500/30`}
            >
              <SiWhatsapp size={18} aria-hidden="true" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
            <a
              href={`mailto:${email}`}
              aria-label="Email"
              className={OUTLINE_BUTTON}
            >
              <Mail size={18} aria-hidden="true" />
              <span className="hidden sm:inline">Email</span>
            </a>
            {phone && (
              <a
                href={`tel:${phone.replace(/\s+/g, '')}`}
                aria-label="Call"
                className={OUTLINE_BUTTON}
              >
                <Phone size={18} aria-hidden="true" />
                <span className="hidden sm:inline">Call</span>
              </a>
            )}
          </div>

          <Link
            href="/services"
            className="group mt-8 inline-flex items-center gap-1 text-sm font-medium text-gray-600 underline-offset-4 hover:text-green-700 hover:underline dark:text-gray-400 dark:hover:text-green-400"
          >
            See services and pricing
            <ArrowRight
              size={15}
              aria-hidden="true"
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
