import type { Note } from './audio';

export const SLUG = 'sapa';
export const NAME = 'Haziq Haiqal';
export const EMAIL = 'hello@haziqhaiqal.com';
export const HELLO = 'Hi Haziq, I found your page and wanted to say hello.';

export const PHOTO = {
  src: '/templates/sapa/haziq-paper.png',
  width: 557,
  height: 584,
};

export const LINKS = [
  { href: '#music', label: 'Music' },
  { href: '#about', label: 'About' },
  { href: '#contact', label: 'Contact' },
];

export const SOCIALS = [
  { id: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/' },
  { id: 'youtube', label: 'YouTube', href: 'https://www.youtube.com/' },
  { id: 'spotify', label: 'Spotify', href: 'https://open.spotify.com/' },
] as const;

export const BIO = [
  "I grew up on my grandmother's upright piano in Ipoh. Now I play slow, quiet music in Kuala Lumpur: Satie, Bach, film themes and old Malay songs.",
  'I post a new piece every Friday and play live most weekends.',
];

export const FACTS = [
  { label: 'Playing since', value: '2004' },
  { label: 'ABRSM', value: 'Grade 8' },
  { label: 'New piece', value: 'Every Friday' },
];

export const KEY_ORDER = 'awsedftgyhujkolp;';
export const WSTEP = [0, 2, 4, 5, 7, 9, 11];
export const HAS_BLACK = [true, true, false, true, true, true, false];
const NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
export const noteName = (m: number) => NAMES[m % 12] + (Math.floor(m / 12) - 1);
export const whiteNote = (base: number, i: number) =>
  base + 12 * Math.floor(i / 7) + WSTEP[i % 7];

function gymnopedie(): Note[] {
  const melody = [[66, 1.4], [69, 0.7], [67, 0.7], [66, 0.7], [61, 0.7], [59, 0.7], [61, 0.7], [62, 0.7], [57, 2.1], [66, 1.4], [69, 0.7], [67, 0.7], [66, 0.7], [61, 0.7], [59, 0.7], [61, 0.7], [62, 0.7], [64, 2.1]];
  const notes: Note[] = [];
  let t = 0;
  for (const [m, d] of melody) {
    notes.push([m, t, Math.max(1.6, d * 2.4), 0.17]);
    t += d;
  }
  for (let b = 0, tb = 0; tb < t; b++, tb += 2.1) {
    notes.push(
      [b % 2 ? 50 : 43, tb, 2.6, 0.11],
      [b % 2 ? 57 : 59, tb + 0.7, 2.2, 0.06],
      [b % 2 ? 61 : 62, tb + 0.7, 2.2, 0.06],
      [66, tb + 0.7, 2.2, 0.05]
    );
  }
  return notes;
}

function prelude(): Note[] {
  const bars = [[60, 64, 67, 72, 76], [60, 62, 69, 74, 77], [59, 62, 67, 74, 77], [60, 64, 67, 72, 76], [60, 64, 69, 76, 81], [60, 62, 66, 69, 74], [59, 62, 67, 74, 79], [59, 60, 64, 67, 72]];
  const s = 0.16;
  const notes: Note[] = [];
  bars.forEach((c, b) => {
    for (let h = 0; h < 2; h++) {
      const t = (b * 16 + h * 8) * s;
      notes.push([c[0], t, 8 * s + 1, 0.11], [c[1], t + s, 7 * s + 1, 0.09]);
      [2, 3, 4, 2, 3, 4].forEach((k, j) => notes.push([c[k], t + (j + 2) * s, 1.2, 0.12]));
    }
  });
  return notes;
}

function furElise(): Note[] {
  const steps: (number | number[])[] = [76, 75, 76, 75, 76, 71, 74, 72, [69, 45], 52, 57, 60, 64, 69, [71, 40], 52, 56, 64, 68, 71, [72, 45], 52, 57, 64, 76, 75, 76, 75, 76, 71, 74, 72, [69, 45], 52, 57, 60, 64, 69, [71, 40], 52, 56, 64, 72, 71, [69, 45], 52, 57];
  const s = 0.19;
  const notes: Note[] = [];
  steps.forEach((step, i) => {
    for (const m of [step].flat()) {
      notes.push([m, i * s, i === steps.length - 3 ? 2.6 : 1.4, m < 58 ? 0.09 : 0.15]);
    }
  });
  return notes;
}

function canon(): Note[] {
  const bass = [50, 45, 47, 42, 43, 38, 43, 45];
  const chords = [[62, 66, 69], [61, 64, 69], [62, 66, 71], [61, 66, 69], [62, 67, 71], [62, 66, 69], [62, 67, 71], [61, 64, 69]];
  const melody = [[78, 76, 74, 73, 71, 69, 71, 73], [74, 73, 71, 69, 67, 66, 67, 64]];
  const d = 1.5;
  const notes: Note[] = [];
  for (let r = 0; r < 2; r++) {
    bass.forEach((b, i) => {
      const t = (r * 8 + i) * d;
      notes.push([b, t, d * 1.6, 0.12], [melody[r][i], t, d * 1.2, 0.15]);
      chords[i].forEach((m, j) => notes.push([m, t + ((j + 1) * d) / 4, 1.4, 0.06]));
    });
  }
  notes.push([50, 16 * d, 3, 0.12], [62, 16 * d, 3, 0.08], [66, 16 * d, 3, 0.08], [74, 16 * d, 3, 0.14]);
  return notes;
}

export const PIECES = [
  { id: 'gymnopedie', title: 'Gymnopédie No. 1', by: 'Erik Satie, 1888', notes: gymnopedie() },
  { id: 'prelude', title: 'Prelude in C major', by: 'J. S. Bach, 1722', notes: prelude() },
  { id: 'elise', title: 'Für Elise', by: 'Ludwig van Beethoven, 1810', notes: furElise() },
  { id: 'canon', title: 'Canon in D', by: 'Johann Pachelbel, c. 1680', notes: canon() },
];

export interface Song {
  id: string;
  title: string;
  beat: number;
  notes: number[];
  beats: number[];
}

// Melodies to learn, all inside the keyboard's C4 to E5 (A to ; keys).
export const SONGS: Song[] = [
  { id: 'twinkle', title: 'Twinkle Twinkle', beat: 0.45, notes: [60, 60, 67, 67, 69, 69, 67, 65, 65, 64, 64, 62, 62, 60], beats: [1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 2] },
  { id: 'ode', title: 'Ode to Joy', beat: 0.42, notes: [64, 64, 65, 67, 67, 65, 64, 62, 60, 60, 62, 64, 64, 62, 62], beats: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5, 0.5, 2] },
  { id: 'jingle', title: 'Jingle Bells', beat: 0.32, notes: [64, 64, 64, 64, 64, 64, 64, 67, 60, 62, 64, 65, 65, 65, 65, 65, 64, 64, 64, 64, 64, 62, 62, 64, 62, 67], beats: [1, 1, 2, 1, 1, 2, 1, 1, 1.5, 0.5, 4, 1, 1, 1.5, 0.5, 1, 1, 1, 0.5, 0.5, 1, 1, 1, 1, 2, 2] },
  { id: 'birthday', title: 'Happy Birthday', beat: 0.42, notes: [60, 60, 62, 60, 65, 64, 60, 60, 62, 60, 67, 65, 60, 60, 72, 69, 65, 64, 62, 70, 70, 69, 65, 67, 65], beats: [0.75, 0.25, 1, 1, 1, 2, 0.75, 0.25, 1, 1, 1, 2, 0.75, 0.25, 1, 1, 1, 1, 2, 0.75, 0.25, 1, 1, 1, 2] },
  { id: 'elise', title: 'Für Elise', beat: 0.36, notes: [76, 75, 76, 75, 76, 71, 74, 72, 69, 60, 64, 69, 71, 64, 68, 71, 72, 64, 76, 75, 76, 75, 76, 71, 74, 72, 69], beats: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 1.5, 0.5, 0.5, 0.5, 1.5, 0.5, 0.5, 0.5, 1.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 1.5] },
];

export function songNotes(song: Song): Note[] {
  let t = 0;
  return song.notes.map((m, i) => {
    const note: Note = [m, t, Math.max(0.9, song.beats[i] * song.beat * 1.8), 0.17];
    t += song.beats[i] * song.beat;
    return note;
  });
}
