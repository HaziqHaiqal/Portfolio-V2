'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import WhatsAppButton from '@components/Templates/WhatsAppButton';
import { Reveal } from '@components/Templates/motion';
import { analyser, playNotes, progressOf, stopPlaying, useNowPlaying } from './audio';
import { clock, CONTACT_LINE, lengthOf, MUSIC_LINE, Socials, useStopOnLeave } from './bits';
import { BIO, EMAIL, FACTS, HELLO, PHOTO, PIECES } from './data';
import { reducedMotion } from './keys';
import { PlayIcon, StopIcon } from './ui';

export function Music() {
  const now = useNowPlaying();
  const grid = useRef<HTMLDivElement>(null);
  useStopOnLeave();

  useEffect(() => {
    const disc = now && grid.current?.querySelector<HTMLElement>(`[data-piece="${now.id}"]`);
    const ring = disc?.querySelector<SVGCircleElement>('.disc-on');
    if (!now || !disc || !ring) return;
    const data = new Uint8Array(1024);
    const still = reducedMotion();
    let raf = 0;
    const tick = () => {
      ring.style.strokeDashoffset = `${1 - progressOf(now)}`;
      const a = analyser();
      if (a && !still) {
        a.getByteFrequencyData(data);
        const bin = a.context.sampleRate / a.fftSize;
        let bass = 0;
        for (let b = 1; b < 160 / bin; b++) bass = Math.max(bass, data[b] / 255);
        disc.style.setProperty('--beat', `${Math.max(0, (bass - 0.55) / 0.45)}`);
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => {
      cancelAnimationFrame(raf);
      ring.style.strokeDashoffset = '1';
      disc.style.removeProperty('--beat');
    };
  }, [now]);

  return (
    <section id="music" className="sapa-section">
      <div className="sapa-wrap">
        <Reveal className="ring-head">
          <h2 className="sapa-h2">Music</h2>
          <p className="sapa-lead">{MUSIC_LINE}</p>
        </Reveal>
        <div ref={grid} className="ring-discs">
          {PIECES.map((piece) => {
            const on = now?.id === piece.id;
            return (
              <button
                key={piece.id}
                type="button"
                data-piece={piece.id}
                aria-pressed={on}
                className="ring-disc-card"
                onClick={() => (on ? stopPlaying() : playNotes(piece.id, piece.notes))}
              >
                <svg viewBox="0 0 100 100" aria-hidden="true">
                  <circle cx="50" cy="50" r="48.5" className="disc-track" />
                  <circle cx="50" cy="50" r="48.5" className="disc-on" pathLength={1} />
                </svg>
                <span className="ring-disc-body">
                  <i>{on ? <StopIcon size={14} /> : <PlayIcon size={15} />}</i>
                  <b>{piece.title}</b>
                  <small>
                    {piece.by.split(',')[0]} · {clock(lengthOf(piece.notes))}
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
      <div className="sapa-wrap ring-about">
        <Reveal className="ring-me">
          <span className="ring-me-disc">
            <Image
              src={PHOTO.src}
              width={PHOTO.width}
              height={PHOTO.height}
              alt="Paper-cut illustration of Haziq Haiqal"
              sizes="(max-width: 767px) 70vw, 420px"
            />
          </span>
        </Reveal>
        <Reveal>
          <h2 className="sapa-h2">About</h2>
          <p className="ring-bio">{BIO[0]}</p>
          <p className="sapa-lead">{BIO[1]}</p>
          <dl className="ring-facts">
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

export function Contact() {
  return (
    <section id="contact" className="sapa-section">
      <Reveal className="sapa-wrap ring-contact">
        <h2 className="sapa-h2">Contact</h2>
        <p className="sapa-lead">{CONTACT_LINE}</p>
        <a className="ring-mail" href={`mailto:${EMAIL}`}>
          {EMAIL}
        </a>
        <div className="ring-links">
          <WhatsAppButton message={HELLO} className="ring-link wa">
            <span>WhatsApp</span>
          </WhatsAppButton>
          <Socials className="ring-link" labels />
        </div>
      </Reveal>
    </section>
  );
}
