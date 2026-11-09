'use client';

import { useEffect, useRef, type CSSProperties } from 'react';
import Image from 'next/image';
import WhatsAppButton from '@components/Templates/WhatsAppButton';
import { Reveal } from '@components/Templates/motion';
import { playNotes, progressOf, stopPlaying, useNowPlaying } from './audio';
import { clock, CONTACT_LINE, lengthOf, MUSIC_LINE, Socials, useStopOnLeave } from './bits';
import { BIO, EMAIL, FACTS, HELLO, PHOTO, PIECES } from './data';
import { PlayIcon, StopIcon } from './ui';

const HEIGHTS = [1, 0.78, 0.9, 0.7];
const hueAt = (i: number, of: number) => 195 + (i / Math.max(1, of - 1)) * 100;
const shortBy = (by: string) => {
  const [name, year] = by.split(', ');
  return `${name.split(' ').pop()}, ${year}`;
};

export function Music() {
  const now = useNowPlaying();
  const row = useRef<HTMLDivElement>(null);
  useStopOnLeave();

  useEffect(() => {
    const bar = now && row.current?.querySelector<HTMLElement>(`[data-piece="${now.id}"]`);
    if (!now || !bar) return;
    let raf = 0;
    const tick = () => {
      bar.style.setProperty('--p', `${progressOf(now)}`);
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => {
      cancelAnimationFrame(raf);
      bar.style.removeProperty('--p');
    };
  }, [now]);

  return (
    <section id="music" className="sapa-section">
      <div className="sapa-wrap">
        <Reveal className="lt-head">
          <h2 className="sapa-h2">Music</h2>
          <p className="sapa-lead">{MUSIC_LINE}</p>
        </Reveal>
        <div ref={row} className="lt-bars">
          {PIECES.map((piece, i) => {
            const on = now?.id === piece.id;
            return (
              <button
                key={piece.id}
                type="button"
                data-piece={piece.id}
                aria-pressed={on}
                className="lt-piece"
                style={{ '--hue': hueAt(i, PIECES.length), '--h': HEIGHTS[i % HEIGHTS.length] } as CSSProperties}
                onClick={() => (on ? stopPlaying() : playNotes(piece.id, piece.notes))}
              >
                <span className="lt-bar">
                  <span className="lt-fill" />
                  <i>{on ? <StopIcon size={13} /> : <PlayIcon size={14} />}</i>
                </span>
                <span className="lt-cap">
                  <b>{piece.title}</b>
                  <small>
                    {shortBy(piece.by)} · {clock(lengthOf(piece.notes))}
                  </small>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function About() {
  return (
    <section id="about" className="sapa-section">
      <div className="sapa-wrap lt-about">
        <Reveal className="lt-me">
          <Image
            src={PHOTO.src}
            width={PHOTO.width}
            height={PHOTO.height}
            alt="Paper-cut illustration of Haziq Haiqal"
            sizes="(max-width: 767px) 80vw, 420px"
          />
        </Reveal>
        <Reveal>
          <h2 className="sapa-h2">About</h2>
          <p className="lt-bio">{BIO[0]}</p>
          <p className="sapa-lead">{BIO[1]}</p>
          <dl className="lt-facts">
            {FACTS.map((fact, i) => (
              <div key={fact.label} style={{ '--hue': hueAt(i, FACTS.length) } as CSSProperties}>
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

export function Contact() {
  return (
    <section id="contact" className="sapa-section">
      <Reveal className="sapa-wrap lt-contact">
        <h2 className="sapa-h2">Contact</h2>
        <p className="sapa-lead">{CONTACT_LINE}</p>
        <a className="lt-mail" href={`mailto:${EMAIL}`}>
          {EMAIL}
        </a>
        <div className="lt-row">
          <WhatsAppButton message={HELLO} className="lt-wa">
            WhatsApp
          </WhatsAppButton>
          <Socials className="lt-icon" />
        </div>
      </Reveal>
    </section>
  );
}
