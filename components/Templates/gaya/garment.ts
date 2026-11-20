'use client';

import { useActivePalette } from '@components/Templates/Palette';
import { artOf, DARK_PALETTE, SLUG, type Item } from './data';

export function useDark() {
  return useActivePalette() === DARK_PALETTE;
}

/** Cut-outs in every theme: iOS Safari drops multiply inside scrolling rows, so white-ground photos show boxes. */
export function useGarment() {
  return (item: Item) => artOf(item);
}

/** Bag and summary thumbnails: cream-ground photos turn into squares on the dark theme. */
export function useThumb() {
  const dark = useDark();
  return (src: string) =>
    dark ? src.replace(`/${SLUG}/clothes/`, `/${SLUG}/ampaian/cut/`) : src;
}
