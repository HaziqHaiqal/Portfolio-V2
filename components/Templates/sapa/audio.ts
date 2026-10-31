'use client';

import { useSyncExternalStore } from 'react';

/** midi, start (s), length (s), volume */
export type Note = [number, number, number, number];

let ctx: AudioContext | null = null;
let out: GainNode | null = null;
let an: AnalyserNode | null = null;

// Safari pauses ("interrupted") after tab or app switches and iOS only
// unlocks sound on pointerup, so every gesture tries to wake it again.
const wake = () => {
  if (ctx && ctx.state !== 'running') ctx.resume().catch(() => {});
};

if (typeof window !== 'undefined') {
  for (const type of ['pointerup', 'touchend', 'click', 'keydown']) {
    addEventListener(type, wake, { capture: true, passive: true });
  }
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) wake();
  });
  try {
    const session = (navigator as { audioSession?: { type: string } })
      .audioSession;
    if (session) session.type = 'playback';
  } catch {}
}

export function audio() {
  if (typeof window === 'undefined') return null;
  try {
    if (!ctx || ctx.state === 'closed') {
      ctx = new AudioContext();
      out = ctx.createGain();
      an = ctx.createAnalyser();
      an.fftSize = 2048;
      an.smoothingTimeConstant = 0.55;
      out.connect(an).connect(ctx.destination);
    }
    wake();
  } catch {
    ctx = null;
  }
  return ctx;
}

export const analyser = () => an;
export const hz = (m: number) => 440 * 2 ** ((m - 69) / 12);

export function piano(
  m: number,
  t: number,
  len = 2.4,
  vol = 0.16,
  dest: AudioNode | null = out
) {
  if (!ctx || !dest) return;
  const f = hz(m);
  const g = ctx.createGain();
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.setValueAtTime(f * 7, t);
  lp.frequency.exponentialRampToValueAtTime(f * 1.3, t + len * 0.8);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.006);
  g.gain.exponentialRampToValueAtTime(0.0001, t + len);
  for (const [mul, type, v] of [
    [1, 'triangle', 1],
    [2, 'sine', 0.3],
    [3, 'sine', 0.08],
  ] as const) {
    const o = ctx.createOscillator();
    const og = ctx.createGain();
    o.type = type;
    o.frequency.value = f * mul;
    og.gain.value = v;
    o.connect(og).connect(lp);
    o.start(t);
    o.stop(t + len + 0.05);
  }
  lp.connect(g).connect(dest);
}

export function strike(m: number, vol = 0.17) {
  const c = audio();
  if (c) piano(m, c.currentTime, 2.4, vol);
}

export interface Playing {
  id: string;
  start: number;
  length: number;
}

let playing: (Playing & { stop: () => void }) | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());

/** Plays one piece at a time; `onNote` fires in step with each note for visuals. */
export function playNotes(
  id: string,
  notes: Note[],
  onNote?: (midi: number, index: number) => void
) {
  stopPlaying();
  const c = audio();
  if (!c || !out) return;
  const bus = c.createGain();
  bus.connect(out);
  const t0 = c.currentTime + 0.05;
  notes.forEach(([m, at, len, vol]) => piano(m, t0 + at, len, vol, bus));
  const length = Math.max(...notes.map(([, at]) => at)) + 1.2;
  const timers = onNote
    ? notes.map(([m, at], i) =>
        window.setTimeout(() => onNote(m, i), (at + 0.05) * 1000)
      )
    : [];
  const end = window.setTimeout(stopPlaying, (length + 0.3) * 1000);
  playing = {
    id,
    start: t0,
    length,
    stop: () => {
      timers.forEach(clearTimeout);
      clearTimeout(end);
      bus.gain.setTargetAtTime(0.0001, c.currentTime, 0.05);
      window.setTimeout(() => bus.disconnect(), 500);
    },
  };
  emit();
}

export function stopPlaying(id?: string) {
  if (!playing || (id && playing.id !== id)) return;
  playing.stop();
  playing = null;
  emit();
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export function useNowPlaying(): Playing | null {
  return useSyncExternalStore(
    subscribe,
    () => playing,
    () => null
  );
}

export const progressOf = (p: Playing) =>
  ctx ? Math.min(1, Math.max(0, (ctx.currentTime - p.start) / p.length)) : 0;
