import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { Geist } from 'next/font/google';
import { Mail, Phone } from 'lucide-react';
import DemoBar from '@components/Templates/DemoBar';
import { PaletteRoot } from '@components/Templates/Palette';
import Header, { Logo } from '@components/Templates/teras-bina/Header';
import {
  BRAND,
  CREDENTIALS,
  LEGAL_NAME,
  NAV,
  OFFICES,
} from '@components/Templates/teras-bina/data';

const font = Geist({ subsets: ['latin'], variable: '--tpl-font' });

export const metadata: Metadata = {
  title: { template: `%s, ${BRAND}`, default: `${BRAND}, building contractor` },
  description:
    'Company profile template for contractors and engineering firms.',
};

export default function TerasBinaLayout({ children }: { children: ReactNode }) {
  return (
    <PaletteRoot slug="teras-bina" className={font.variable}>
      <DemoBar slug="teras-bina" />
      <Header />
      <main>{children}</main>

      <footer className="bg-[#0B0D10] px-5 pb-10 pt-16 text-white md:px-8">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/60">
              {LEGAL_NAME} (199801012345). Building, civil and M&E contractor
              since 1998.
            </p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {CREDENTIALS.map((item) => (
                <li
                  key={item.name}
                  className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/80"
                >
                  {item.name}
                </li>
              ))}
            </ul>
          </div>
          <nav aria-label="Footer" className="text-sm">
            <p className="font-medium">Company</p>
            <ul className="mt-4 space-y-3 text-white/60">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="space-y-5 text-sm">
            <p className="font-medium">Offices</p>
            {OFFICES.map((office) => (
              <div key={office.city}>
                <p>{office.city}</p>
                <p className="mt-1 flex items-center gap-2 text-white/60">
                  <Phone size={14} aria-hidden="true" />
                  {office.phone}
                </p>
              </div>
            ))}
            <p className="flex items-center gap-2 text-white/60">
              <Mail size={14} aria-hidden="true" />
              tender@terasbina.com.my
            </p>
          </div>
        </div>
        <p className="mx-auto mt-14 max-w-7xl border-t border-white/10 pt-6 text-xs text-white/40">
          © {LEGAL_NAME}. Demo content for template preview.
        </p>
      </footer>
    </PaletteRoot>
  );
}
