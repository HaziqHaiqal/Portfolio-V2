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
  "I grew up on my grandmother's upright piano in Ipoh. Now I play slow, quiet music in Kuala Lumpur: Beethoven, Yiruma, film themes and old Malay songs.",
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

function moonlight(): Note[] {
  const beat = 0.9;
  const tri = { cm: [56, 61, 64], a: [57, 61, 64], d: [57, 62, 66], g7: [56, 60, 66], g: [56, 61, 64], gs: [56, 61, 63], fs: [54, 60, 63] };
  // One entry per beat: [bass, triplet].
  const beats: [number, number[]][] = [
    ...Array(4).fill([37, tri.cm]),
    ...Array(4).fill([35, tri.cm]),
    [33, tri.a], [33, tri.a], [30, tri.d], [30, tri.d],
    [32, tri.g7], [32, tri.g], [32, tri.gs], [32, tri.fs],
    ...Array(4).fill([37, tri.cm]),
    [37, tri.cm], [37, tri.cm], [33, tri.a], [33, tri.a],
    [30, tri.d], [30, tri.d], [32, tri.g7], [32, tri.g7],
  ];
  const notes: Note[] = [];
  beats.forEach(([bass, chord], i) => {
    const t = i * beat;
    if (i % 2 === 0) notes.push([bass, t, beat * 2.2, 0.11], [bass + 12, t, beat * 2.2, 0.08]);
    chord.forEach((m, k) => notes.push([m, t + (k * beat) / 3, 1.2, 0.1]));
  });
  const tune = [[68, 19, 0.75], [68, 19.75, 0.25], [68, 20, 2], [69, 22, 1], [68, 23, 1], [66, 24, 2], [68, 26, 1.5], [67, 27.5, 0.5]];
  tune.forEach(([m, at, len]) => notes.push([m, at * beat, len * beat + 0.8, 0.17]));
  const end = beats.length * beat;
  [37, 49, 56, 61, 64, 68].forEach((m) => notes.push([m, end, 3.2, m === 68 ? 0.15 : 0.08]));
  return notes;
}

function fifth(): Note[] {
  const e = 0.17;
  const motifs = [[67, 63, 1.4, 48], [65, 62, 1.9, 43], [67, 63, 0.55, 48], [68, 67, 0.55, 44], [75, 72, 2.2, 48]];
  const notes: Note[] = [];
  let t = 0;
  for (const [short, long, hold, bass] of motifs) {
    t += e;
    for (let k = 0; k < 3; k++, t += e) notes.push([short, t, 0.3, 0.17], [short - 12, t, 0.3, 0.12]);
    notes.push([long, t, hold + 0.6, 0.17], [long - 12, t, hold + 0.6, 0.13], [bass - 12, t, hold + 0.6, 0.1]);
    t += hold;
  }
  return notes;
}

function ode(): Note[] {
  const b = 0.46;
  const tune = [64, 64, 65, 67, 67, 65, 64, 62, 60, 60, 62, 64, 64, 62, 62, 64, 64, 65, 67, 67, 65, 64, 62, 60, 60, 62, 64, 62, 60, 60];
  const lens = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5, 0.5, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5, 0.5, 2];
  const notes: Note[] = [];
  let t = 0;
  tune.forEach((m, i) => {
    notes.push([m + 12, t * b, lens[i] * b * 1.6, 0.16]);
    t += lens[i];
  });
  const left = [[48, 55, 60, 64], [43, 55, 59, 62]];
  for (let bar = 0; bar < 8; bar++) {
    const [bass, ...chord] = left[bar === 7 ? 1 : bar % 2];
    const at = bar * 4 * b;
    notes.push([bass, at, 4 * b, 0.11]);
    chord.forEach((m, k) => notes.push([m, at + (k + 1) * b, b * 1.4, 0.06]));
  }
  notes.push([48, 30 * b, 2.6, 0.11], [55, 30 * b, 2.6, 0.06], [64, 30 * b, 2.6, 0.06]);
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

export const PIECES = [
  { id: 'moonlight', title: 'Moonlight Sonata', by: 'Ludwig van Beethoven, 1801', notes: moonlight() },
  { id: 'elise', title: 'Für Elise', by: 'Ludwig van Beethoven, 1810', notes: furElise() },
  { id: 'fifth', title: 'Symphony No. 5', by: 'Ludwig van Beethoven, 1808', notes: fifth() },
  { id: 'ode', title: 'Ode to Joy', by: 'Ludwig van Beethoven, 1824', notes: ode() },
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

/** The tune of a piece: the top melody note at each moment. */
export function melodyOf(notes: Note[]) {
  const steps: number[] = [];
  let at = -1;
  [...notes]
    .filter((note) => note[3] >= 0.1)
    .sort((a, b) => a[1] - b[1])
    .forEach(([m, t]) => {
      if (Math.abs(t - at) > 0.03) {
        steps.push(m);
        at = t;
      } else if (m > steps[steps.length - 1]) {
        steps[steps.length - 1] = m;
      }
    });
  return steps;
}
