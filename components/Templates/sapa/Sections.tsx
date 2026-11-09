'use client';

import { useActivePalette } from '@components/Templates/Palette';
import SiteHeader from '@components/Templates/SiteHeader';
import { LINKS, NAME } from './data';
import EqualiserHero from './EqualiserHero';
import * as EqualiserSections from './EqualiserSections';
import LightHero from './LightHero';
import * as LightSections from './LightSections';
import RingHero from './RingHero';
import * as RingSections from './RingSections';

export function Header() {
  return (
    <SiteHeader
      brand={
        <a href="#top" className="text-[17px] font-semibold tracking-tight">
          {NAME}
        </a>
      }
      links={LINKS}
    >
      <a
        href="#contact"
        className="inline-flex h-9 items-center rounded-full bg-tpl-ink px-4 text-sm font-medium text-tpl-bg md:hidden"
      >
        Contact
      </a>
    </SiteHeader>
  );
}

export function Hero() {
  const theme = useActivePalette();
  if (theme === 'ring') return <RingHero />;
  if (theme === 'light') return <LightHero />;
  return <EqualiserHero />;
}

/** Every section after the hero follows the hero's theme. */
function useSections() {
  const theme = useActivePalette();
  if (theme === 'ring') return RingSections;
  if (theme === 'light') return LightSections;
  return EqualiserSections;
}

export function Music() {
  const { Music: Section } = useSections();
  return <Section />;
}

export function About() {
  const { About: Section } = useSections();
  return <Section />;
}

export function Contact() {
  const { Contact: Section } = useSections();
  return <Section />;
}

export function Footer() {
  return (
    <footer className="sapa-footer">
      <span>© {new Date().getFullYear()} {NAME}</span>
      <span>Melodies are in the public domain.</span>
    </footer>
  );
}
