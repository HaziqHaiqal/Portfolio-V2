'use client';

import { useEffect, useRef, type RefObject } from 'react';
import { KEY_ORDER } from './data';

const timers = new WeakMap<Element, number>();

export function flash(key: Element | null) {
  if (!key) return;
  key.classList.add('down');
  clearTimeout(timers.get(key));
  timers.set(key, window.setTimeout(() => key.classList.remove('down'), 200));
}

/**
 * Press, or drag across, any [data-note] inside `root`; A to ; on a computer
 * keyboard plays C4 to E5 while `root` is on screen.
 */
export function usePlayable(
  root: RefObject<HTMLElement | null>,
  onPress: (midi: number, key: Element | null) => void
) {
  const latest = useRef(onPress);
  useEffect(() => {
    latest.current = onPress;
  });
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const press = (m: number, key: Element | null) => latest.current(m, key);
    let held = false;
    let visible = false;
    const hit = (key: Element) => {
      flash(key);
      press(Number(key.getAttribute('data-note')), key);
    };
    const keyAt = (e: Event) => {
      const key = (e.target as Element | null)?.closest?.('[data-note]');
      return key && el.contains(key) ? key : null;
    };
    const down = (e: PointerEvent) => {
      const key = keyAt(e);
      if (!key || e.button > 0) return;
      e.preventDefault();
      held = true;
      try {
        (e.target as Element).releasePointerCapture(e.pointerId);
      } catch {}
      hit(key);
    };
    const over = (e: PointerEvent) => {
      const key = held ? keyAt(e) : null;
      if (key) hit(key);
    };
    const up = () => {
      held = false;
    };
    const keydown = (e: KeyboardEvent) => {
      if (!visible || e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
      const i = KEY_ORDER.indexOf(e.key.toLowerCase());
      if (i < 0) return;
      e.preventDefault();
      const key = el.querySelector(`[data-note="${60 + i}"]`);
      if (key) hit(key);
      else press(60 + i, null);
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointerover', over);
    addEventListener('pointerup', up);
    addEventListener('pointercancel', up);
    addEventListener('keydown', keydown);
    return () => {
      io.disconnect();
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointerover', over);
      removeEventListener('pointerup', up);
      removeEventListener('pointercancel', up);
      removeEventListener('keydown', keydown);
    };
  }, [root]);
}

/** Sizes a canvas to its box at device pixel ratio; returns CSS-pixel size. */
export function fitCanvas(canvas: HTMLCanvasElement) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  const g = canvas.getContext('2d')!;
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { g, w, h };
}

/** "58 75 255" palette channels → rgb() with alpha. */
export function tokenColour(el: Element, role: string) {
  const channels = getComputedStyle(el).getPropertyValue(`--tpl-${role}`).trim();
  return (alpha = 1) => `rgb(${channels} / ${alpha})`;
}

export const reducedMotion = () =>
  typeof window !== 'undefined' &&
  matchMedia('(prefers-reduced-motion: reduce)').matches;
