'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { SiInstagram, SiSpotify, SiYoutube } from 'react-icons/si';
import { useActivePalette } from '@components/Templates/Palette';
import SiteHeader from '@components/Templates/SiteHeader';
import WhatsAppButton from '@components/Templates/WhatsAppButton';
import { Reveal } from '@components/Templates/motion';
import { analyser, playNotes, progressOf, stopPlaying, useNowPlaying } from './audio';
import { BIO, EMAIL, FACTS, HELLO, LINKS, NAME, PHOTO, PIECES, SOCIALS } from './data';
import EqualiserHero from './EqualiserHero';
import LightHero from './LightHero';
import RingHero from './RingHero';
import { PlayIcon, StopIcon } from './ui';

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

const clock = (s: number) =>
  `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;

export function Music() {
  const now = useNowPlaying();
  const list = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const el = list.current;
    if (!now || !el) return;
    const bars = el.querySelectorAll<HTMLElement>(`[data-piece="${now.id}"] .track-eq i`);
    const data = new Uint8Array(1024);
    const bands = [3, 6, 10, 16];
    let raf = 0;
    const tick = () => {
      el.style.setProperty('--p', `${progressOf(now)}`);
      const a = analyser();
      if (a) {
        a.getByteFrequencyData(data);
        bars.forEach((bar, i) => {
          const v = Math.max(0, data[bands[i]] / 255 - 0.3) / 0.7;
          bar.style.transform = `scaleY(${0.25 + v * 0.75})`;
        });
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [now]);

  return (
    <section id="music" className="sapa-section">
      <div className="sapa-wrap">
        <Reveal className="sapa-head">
          <h2 className="sapa-h2">Music</h2>
          <p>A few pieces I keep coming back to.</p>
        </Reveal>
        <Reveal className="music-card">
          <div className="cover" aria-hidden="true">
            <span className="cover-bars">
              {[0.45, 0.8, 0.6, 1, 0.7, 0.4, 0.55].map((height, i) => (
                <i key={i} style={{ height: `${height * 100}%` }} />
              ))}
            </span>
            <p>
              <b>Piano pieces</b>
              <span>{NAME}</span>
            </p>
          </div>
          <ol ref={list} className="tracks">
            {PIECES.map((piece) => {
              const on = now?.id === piece.id;
              const length = Math.max(...piece.notes.map(([, at]) => at)) + 1.2;
              return (
                <li key={piece.id} data-piece={piece.id} data-on={on || undefined}>
                  <button
                    type="button"
                    className="track"
                    aria-pressed={on}
                    onClick={() => (on ? stopPlaying() : playNotes(piece.id, piece.notes))}
                  >
                    <span className="track-btn">{on ? <StopIcon size={13} /> : <PlayIcon size={14} />}</span>
                    <span className="track-title">
                      <b>{piece.title}</b>
                      <small>{piece.by}</small>
                    </span>
                    <span className="track-eq" aria-hidden="true">
                      <i />
                      <i />
                      <i />
                      <i />
                    </span>
                    <span className="track-len">{clock(length)}</span>
                  </button>
                  <span className="track-progress" aria-hidden="true" />
                </li>
              );
            })}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}

export function About() {
  return (
    <section id="about" className="sapa-section">
      <div className="sapa-wrap about">
        <Reveal className="about-me">
          <Image
            src={PHOTO.src}
            width={PHOTO.width}
            height={PHOTO.height}
            alt="Paper-cut illustration of Haziq Haiqal"
            sizes="(max-width: 767px) 70vw, 380px"
          />
        </Reveal>
        <Reveal>
          <h2 className="sapa-h2">About</h2>
          <p className="about-text">{BIO[0]}</p>
          <p className="about-more">{BIO[1]}</p>
          <dl className="facts">
            {FACTS.map((fact) => (
              <div key={fact.label}>
                <dd>{fact.value}</dd>
                <dt>{fact.label}</dt>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}

const SOCIAL_ICONS = { instagram: SiInstagram, youtube: SiYoutube, spotify: SiSpotify };

export function Contact() {
  return (
    <section id="contact" className="sapa-section">
      <Reveal className="sapa-wrap contact">
        <h2 className="sapa-h2">Contact</h2>
        <p>Song requests, questions or just a hello.</p>
        <a className="contact-mail" href={`mailto:${EMAIL}`}>
          {EMAIL}
        </a>
        <div className="contact-row">
          <WhatsAppButton message={HELLO} className="contact-wa">
            WhatsApp
          </WhatsAppButton>
          {SOCIALS.map((social) => {
            const Icon = SOCIAL_ICONS[social.id];
            return (
              <a
                key={social.id}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                aria-label={social.label}
                className="contact-icon"
              >
                <Icon size={17} aria-hidden="true" />
              </a>
            );
          })}
        </div>
      </Reveal>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="sapa-footer">
      <span>© {new Date().getFullYear()} {NAME}</span>
      <span>Melodies are in the public domain.</span>
    </footer>
  );
}
