'use client';

import { useEffect } from 'react';
import { SiInstagram, SiSpotify, SiYoutube } from 'react-icons/si';
import { stopPlaying, type Note } from './audio';
import { SOCIALS } from './data';

export const MUSIC_LINE = 'A few pieces I keep coming back to.';
export const CONTACT_LINE = 'Song requests, questions or just a hello.';

export const clock = (s: number) =>
  `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;

export const lengthOf = (notes: Note[]) => Math.max(...notes.map(([, at]) => at)) + 1.2;

/** Stops the music when the theme is switched. */
export function useStopOnLeave() {
  useEffect(() => () => stopPlaying(), []);
}

const ICONS = { instagram: SiInstagram, youtube: SiYoutube, spotify: SiSpotify };

export function Socials({ className, labels = false }: { className: string; labels?: boolean }) {
  return SOCIALS.map((social) => {
    const Icon = ICONS[social.id];
    return (
      <a
        key={social.id}
        href={social.href}
        target="_blank"
        rel="noreferrer"
        aria-label={social.label}
        className={className}
      >
        <Icon size={17} aria-hidden="true" />
        {labels && <span>{social.label}</span>}
      </a>
    );
  });
}
