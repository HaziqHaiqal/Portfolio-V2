export const PALETTE_ROLES = [
  'bg',
  'surface',
  'ink',
  'muted',
  'accent',
  'on-accent',
  'tint',
  'line',
] as const;

export type PaletteRole = (typeof PALETTE_ROLES)[number];

export interface Palette {
  id: string;
  name: string;
  colors: Record<PaletteRole, string>;
}

const light = (
  id: string,
  name: string,
  accent: string,
  tint: string,
  base: Partial<Record<PaletteRole, string>> = {}
): Palette => ({
  id,
  name,
  colors: {
    bg: '#FFFFFF',
    surface: '#FFFFFF',
    ink: '#16181D',
    muted: '#5F6470',
    accent,
    'on-accent': '#FFFFFF',
    tint,
    line: '#E7E8EB',
    ...base,
  },
});

const dark = (
  id: string,
  name: string,
  accent: string,
  colors: Partial<Record<PaletteRole, string>> = {}
): Palette => ({
  id,
  name,
  colors: {
    bg: '#111214',
    surface: '#1A1C1F',
    ink: '#F4F2EE',
    muted: '#A4A7AD',
    accent,
    'on-accent': '#111214',
    tint: '#202226',
    line: '#2C2F34',
    ...colors,
  },
});

export const TEMPLATE_PALETTES: Record<string, Palette[]> = {
  'seri-glow': [
    light('blush', 'Blush', '#B4475E', '#FBEFEC', { ink: '#231518' }),
    light('sage', 'Sage', '#3E6B55', '#EEF3EE', { ink: '#15211B' }),
    light('sky', 'Sky', '#2F69A0', '#EDF3F9', { ink: '#131C27' }),
    dark('midnight', 'Midnight', '#E9B3A5'),
  ],
  'atelier-nura': [
    light('noir', 'Noir', '#141414', '#F4F3F1', {
      ink: '#141414',
      muted: '#6B6B6B',
    }),
    light('olive', 'Olive', '#55623F', '#F2F3EC', { ink: '#1C2016' }),
    light('mauve', 'Mauve', '#8E4F68', '#F7EFF2', { ink: '#24161C' }),
    dark('night', 'Night', '#D9BC8C', { bg: '#0F0F0F', surface: '#181818' }),
  ],
  'teras-bina': [
    light('safety', 'Safety yellow', '#F5B800', '#F4F5F6', {
      ink: '#0E1116',
      'on-accent': '#0E1116',
    }),
    light('blueprint', 'Blueprint', '#1D4ED8', '#F1F4FA', { ink: '#0D1424' }),
    light('terracotta', 'Terracotta', '#C2410C', '#F8F3F0', {
      ink: '#1A120E',
    }),
    dark('graphite', 'Graphite', '#F5B800', {
      bg: '#0B0D10',
      surface: '#14171B',
    }),
  ],
  'kopi-teduh': [
    light('kopitiam', 'Kopitiam', '#0F6E4F', '#F1F6F2', { ink: '#10231B' }),
    light('teh-tarik', 'Teh tarik', '#9A4B1C', '#FAF3EC', { ink: '#24160D' }),
    light('pandan', 'Pandan', '#4D7C0F', '#F3F7EC', { ink: '#18210D' }),
    dark('malam', 'Malam', '#F2B34B', { bg: '#0F1A15', surface: '#16241D' }),
  ],
  ruang: [
    light('lime', 'Lime', '#C8EF4A', '#F5F5F2', {
      bg: '#ECECE8',
      ink: '#141414',
      muted: '#686864',
      'on-accent': '#141414',
      line: '#E2E2DE',
    }),
    light('tangerine', 'Tangerine', '#FF7A3D', '#F5F5F2', {
      bg: '#EEECE8',
      ink: '#161412',
      muted: '#6B6661',
      'on-accent': '#161412',
      line: '#E4E1DC',
    }),
    light('cobalt', 'Cobalt', '#3358F4', '#F4F5F7', {
      bg: '#EBECEF',
      ink: '#121521',
      muted: '#646976',
      line: '#E0E2E8',
    }),
    dark('night', 'Night', '#C8EF4A', {
      bg: '#0E0E0E',
      surface: '#191919',
      tint: '#222222',
      line: '#2C2C2C',
    }),
  ],
  petik: [
    light('hijau', 'Hijau', '#86BA09', '#CFFCBB', {
      bg: '#FFFFFF',
      surface: '#F3F6FD',
      ink: '#252525',
      muted: '#6E6E6E',
      line: '#DFF1D9',
    }),
    light('oren', 'Oren', '#E8761E', '#FFE5C7', {
      bg: '#FFFFFF',
      surface: '#FBF6F1',
      ink: '#252525',
      muted: '#6E6E6E',
      line: '#FCEBD9',
    }),
    light('biru', 'Biru', '#2F80ED', '#D3E7FF', {
      bg: '#FFFFFF',
      surface: '#F3F6FD',
      ink: '#1F2937',
      muted: '#667085',
      line: '#E1EDFC',
    }),
  ],
  langkah: [
    light('kapur', 'Kapur', '#FFB800', '#E9E5DB', {
      bg: '#F3F0E8',
      surface: '#FBFAF6',
      ink: '#141414',
      muted: '#5F5C55',
      line: '#DDD8CC',
      'on-accent': '#141414',
    }),
    dark('malam', 'Malam', '#FFB800', {
      bg: '#0E0E0E',
      surface: '#181818',
      tint: '#222222',
      line: '#2C2C2C',
      ink: '#F3F0E8',
      muted: '#A19D94',
      'on-accent': '#141414',
    }),
    light('pandan', 'Pandan', '#4E7F3A', '#E1E8D8', {
      bg: '#F1F3EC',
      surface: '#FAFBF7',
      ink: '#151A12',
      muted: '#59604F',
      line: '#D8DFCC',
    }),
  ],
};
