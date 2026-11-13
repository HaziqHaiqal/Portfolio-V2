'use client';

import { useActivePalette } from '@components/Templates/Palette';
import { cutOf, DARK_PALETTE, hungOf, SLUG } from './data';

export function useDark() {
  return useActivePalette() === DARK_PALETTE;
}

/** The hung garment photo for the active theme. */
export function useGarment() {
  const dark = useDark();
  return (id: string) => (dark ? cutOf(id) : hungOf(id));
}

/** Bag and summary thumbnails: cream-ground photos turn into squares on the dark theme. */
export function useThumb() {
  const dark = useDark();
  return (src: string) =>
    dark ? src.replace(`/${SLUG}/clothes/`, `/${SLUG}/ampaian/cut/`) : src;
}
