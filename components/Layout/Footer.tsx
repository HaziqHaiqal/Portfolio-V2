import { Mail } from 'lucide-react';
import { SiGithub, SiLinkedin } from 'react-icons/si';
import { getCurrentYear } from '@lib/format';
import { DEFAULT_CONTACT } from '@constants/contact';
import type { Profile } from '@lib/supabase';

interface FooterProps {
  profile: Partial<Profile> | null;
}

const iconClass =
  'flex h-12 w-12 items-center justify-center rounded-xl bg-gray-800 transition-all duration-300 hover:scale-110';

const Footer = ({ profile }: FooterProps) => (
  <footer className="relative z-10 bg-gray-900 px-6 py-12 text-white">
    <div className="mx-auto max-w-4xl text-center">
      <div className="mb-8 flex justify-center gap-6">
        <a
          href={profile?.github_url || DEFAULT_CONTACT.github}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
          className={`${iconClass} hover:rotate-[5deg] hover:bg-blue-600`}
        >
          <SiGithub size={20} />
        </a>
        <a
          href={profile?.linkedin_url || DEFAULT_CONTACT.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
          className={`${iconClass} hover:-rotate-[5deg] hover:bg-blue-600`}
        >
          <SiLinkedin size={20} />
        </a>
        <a
          href={`mailto:${profile?.email || DEFAULT_CONTACT.email}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Email"
          className={`${iconClass} hover:rotate-[5deg] hover:bg-purple-600`}
        >
          <Mail size={20} />
        </a>
      </div>

      <div className="border-t border-gray-800 pt-8">
        <p className="text-gray-500">
          © {getCurrentYear()} {profile?.full_name}
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
