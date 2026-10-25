'use client';

import { useState, type ComponentType } from 'react';
import { ArrowRight, Mail, Phone } from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import type { Profile } from '@lib/supabase';
import { DEFAULT_CONTACT } from '@constants/contact';
import { useUIStore } from '@lib/stores';
import HoonBot from '@components/Common/HoonBot';

interface Tile {
  key: string;
  href: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  name: string;
  detail: string;
}

export default function ContactOptions({
  profile,
}: {
  profile: Profile | null;
}) {
  const openContact = useUIStore((state) => state.openContact);
  const [hoonHovered, setHoonHovered] = useState(false);

  const whatsapp = new URL(profile?.whatsapp_url || DEFAULT_CONTACT.whatsapp);
  whatsapp.searchParams.set('text', "Hi Haziq, I'd like to discuss a project.");
  const email = profile?.email || DEFAULT_CONTACT.email;
  const phone = profile?.phone?.trim();

  const tiles: Tile[] = [
    {
      key: 'whatsapp',
      href: whatsapp.toString(),
      icon: SiWhatsapp,
      name: 'WhatsApp',
      detail: 'Fastest reply',
    },
    {
      key: 'email',
      href: `mailto:${email}`,
      icon: Mail,
      name: 'Email',
      detail: email,
    },
    ...(phone
      ? [
          {
            key: 'call',
            href: `tel:${phone.replace(/\s+/g, '')}`,
            icon: Phone,
            name: 'Call',
            detail: phone,
          },
        ]
      : []),
  ];

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div
        className={`mx-auto grid max-w-xs gap-3 sm:max-w-none ${tiles.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}
      >
        {tiles.map(({ key, href, icon: Icon, name, detail }) => (
          <a
            key={key}
            href={href}
            {...(key === 'whatsapp'
              ? { target: '_blank', rel: 'noopener noreferrer' }
              : {})}
            className="group flex flex-col items-center gap-2 rounded-2xl text-center text-gray-900 transition duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-500/30 dark:text-gray-100 sm:bg-white sm:p-5 sm:ring-1 sm:ring-gray-200 sm:hover:-translate-y-0.5 sm:hover:ring-gray-300 sm:dark:bg-gray-800/70 sm:dark:ring-gray-700 sm:dark:hover:ring-gray-600"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-gray-600 ring-1 ring-gray-200 transition-transform group-active:scale-95 dark:bg-gray-800/70 dark:text-gray-300 dark:ring-gray-700 sm:h-auto sm:w-auto sm:bg-transparent sm:text-gray-500 sm:ring-0 sm:dark:bg-transparent sm:dark:text-gray-400">
              <Icon size={22} />
            </span>
            <span className="w-full min-w-0">
              <span className="block text-sm font-medium sm:text-base sm:font-semibold">
                {name}
              </span>
              <span className="mt-0.5 hidden truncate text-sm text-gray-500 dark:text-gray-400 sm:block">
                {detail}
              </span>
            </span>
          </a>
        ))}
      </div>

      <div className="mt-8 flex justify-center text-sm">
        <button
          type="button"
          onClick={openContact}
          onMouseEnter={() => setHoonHovered(true)}
          onMouseLeave={() => setHoonHovered(false)}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded font-medium text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/40 dark:text-gray-300"
        >
          <HoonBot excited={hoonHovered} className="h-6 w-6" />
          Not sure yet? Ask Hoon
          <ArrowRight size={15} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
