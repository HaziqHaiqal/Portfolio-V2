import Link from 'next/link';
import { ArrowRight, Mail, MapPin, Phone } from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import type { Profile } from '@lib/supabase';
import { DEFAULT_CONTACT } from '@constants/contact';

const LINE_LINK =
  'inline-flex items-center gap-1.5 rounded font-medium text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/40 dark:text-gray-300';

export default function ContactOptions({
  profile,
}: {
  profile: Profile | null;
}) {
  const whatsapp = new URL(profile?.whatsapp_url || DEFAULT_CONTACT.whatsapp);
  whatsapp.searchParams.set('text', "Hi Haziq, I'd like to discuss a project.");
  const email = profile?.email || DEFAULT_CONTACT.email;
  const phone = profile?.phone?.trim();

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center text-center">
      <a
        href={whatsapp.toString()}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-12 items-center gap-2 rounded-full bg-green-600 px-7 text-sm font-semibold text-white shadow-lg shadow-green-600/20 transition-colors hover:bg-green-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-500/30"
      >
        <SiWhatsapp size={18} aria-hidden="true" />
        Chat on WhatsApp
      </a>

      <div className="mt-6 flex flex-col items-center gap-x-4 gap-y-2 text-sm sm:flex-row">
        <a href={`mailto:${email}`} className={LINE_LINK}>
          <Mail size={15} aria-hidden="true" />
          {email}
        </a>
        {phone && (
          <>
            <span
              aria-hidden="true"
              className="hidden text-gray-400 dark:text-gray-600 sm:inline"
            >
              ·
            </span>
            <a href={`tel:${phone.replace(/\s+/g, '')}`} className={LINE_LINK}>
              <Phone size={15} aria-hidden="true" />
              {phone}
            </a>
          </>
        )}
      </div>

      <div className="mt-8 flex flex-col items-center justify-center gap-x-6 gap-y-3 text-sm text-gray-600 dark:text-gray-400 sm:flex-row">
        {profile?.location && (
          <p className="inline-flex items-center gap-1.5">
            <MapPin size={15} aria-hidden="true" />
            Based in {profile.location}
          </p>
        )}
        <Link
          href="/services"
          className="group inline-flex items-center gap-1 font-medium underline-offset-4 hover:text-green-700 hover:underline dark:hover:text-green-400"
        >
          See services and prices
          <ArrowRight
            size={15}
            aria-hidden="true"
            className="transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      </div>
    </div>
  );
}
