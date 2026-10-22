import Link from 'next/link';
import type { ComponentType } from 'react';
import { ArrowRight, Mail, MapPin, Phone } from 'lucide-react';
import { SiGithub, SiLinkedin, SiWhatsapp } from 'react-icons/si';
import type { Profile } from '@lib/supabase';
import { DEFAULT_CONTACT } from '@constants/contact';

interface ContactOption {
  label: string;
  detail: string;
  href: string;
  icon: ComponentType<{ size?: number; 'aria-hidden'?: boolean | 'true' }>;
  external?: boolean;
  primary?: boolean;
}

export default function ContactOptions({
  profile,
}: {
  profile: Profile | null;
}) {
  const whatsapp = new URL(profile?.whatsapp_url || DEFAULT_CONTACT.whatsapp);
  whatsapp.searchParams.set('text', "Hi Haziq, I'd like to discuss a project.");
  const email = profile?.email || DEFAULT_CONTACT.email;
  const phone = profile?.phone?.trim();

  const options: ContactOption[] = [
    {
      label: 'WhatsApp',
      detail: 'Fastest reply',
      href: whatsapp.toString(),
      icon: SiWhatsapp,
      external: true,
      primary: true,
    },
    { label: 'Email', detail: email, href: `mailto:${email}`, icon: Mail },
    ...(phone
      ? [
          {
            label: 'Call',
            detail: phone,
            href: `tel:${phone.replace(/\s+/g, '')}`,
            icon: Phone,
          },
        ]
      : []),
    {
      label: 'LinkedIn',
      detail: 'Connect professionally',
      href: profile?.linkedin_url || DEFAULT_CONTACT.linkedin,
      icon: SiLinkedin,
      external: true,
    },
    {
      label: 'GitHub',
      detail: 'See the code',
      href: profile?.github_url || DEFAULT_CONTACT.github,
      icon: SiGithub,
      external: true,
    },
  ];

  return (
    <div className="mx-auto max-w-4xl">
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {options.map((option) => {
          const Icon = option.icon;
          return (
            <li key={option.label}>
              <a
                href={option.href}
                {...(option.external && {
                  target: '_blank',
                  rel: 'noopener noreferrer',
                })}
                className={`group flex h-full items-center gap-4 rounded-2xl border p-5 shadow-xl backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-500/20 ${
                  option.primary
                    ? 'border-green-600 bg-green-600 text-white shadow-green-600/20 hover:bg-green-700'
                    : 'border-gray-200 bg-white/70 text-gray-900 hover:border-green-500/50 dark:border-gray-700 dark:bg-gray-800/70 dark:text-gray-100 dark:hover:border-green-400/50'
                }`}
              >
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                    option.primary
                      ? 'bg-white/15'
                      : 'bg-gray-100 dark:bg-gray-900/60'
                  }`}
                >
                  <Icon size={19} aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold">{option.label}</span>
                  <span
                    className={`block truncate text-sm ${
                      option.primary
                        ? 'text-white/80'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {option.detail}
                  </span>
                </span>
              </a>
            </li>
          );
        })}
      </ul>

      <div className="mt-10 flex flex-col items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
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
          Want to see prices first? See pricing
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
