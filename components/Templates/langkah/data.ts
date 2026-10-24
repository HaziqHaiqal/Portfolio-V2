export const BRAND = 'Langkah';
export const BASE_PATH = '/templates/langkah';
const ASSETS = '/templates/langkah';
export const MODEL_URL = `${ASSETS}/shoe.glb`;
export const FREE_DELIVERY_AT = 200;
export const DISCOUNT = { code: 'LANGKAH10', amount: 10, minSpend: 150 };

/**
 * Each colourway is one painted texture on the same 3D model. `stage`,
 * `ink` and `cta` colour the home page product stage when it is picked.
 */
export const COLOURWAYS = [
  {
    id: 'sinar',
    name: 'Sinar',
    note: 'Yellow knit, black pads',
    swatch: '#FFB800',
    accent: '#151515',
    sole: '#F2F0EA',
    stage: '#161616',
    ink: '#F6F1E3',
    muted: '#B5AE9F',
    cta: '#FFB800',
    ctaInk: '#141414',
    texture: `${ASSETS}/textures/sinar.webp`,
    image: `${ASSETS}/renders/sinar.webp`,
  },
  {
    id: 'malam',
    name: 'Malam',
    note: 'Black knit, yellow pads',
    swatch: '#222222',
    accent: '#FFB000',
    sole: '#F2F0EA',
    stage: '#FFB800',
    ink: '#141414',
    muted: '#5C4A10',
    cta: '#141414',
    ctaInk: '#FFFFFF',
    texture: `${ASSETS}/textures/malam.webp`,
    image: `${ASSETS}/renders/malam.webp`,
  },
  {
    id: 'awan',
    name: 'Awan',
    note: 'White knit, gum sole',
    swatch: '#ECE9E1',
    accent: '#151515',
    sole: '#C98F55',
    stage: '#EFE6D3',
    ink: '#141414',
    muted: '#6B6252',
    cta: '#141414',
    ctaInk: '#FFFFFF',
    texture: `${ASSETS}/textures/awan.webp`,
    image: `${ASSETS}/renders/awan.webp`,
  },
  {
    id: 'pandan',
    name: 'Pandan',
    note: 'Green knit, white pads',
    swatch: '#4E7F3A',
    accent: '#F2F0EA',
    sole: '#F2F0EA',
    stage: '#DCE7CF',
    ink: '#132310',
    muted: '#4F5E47',
    cta: '#132310',
    ctaInk: '#FFFFFF',
    texture: `${ASSETS}/textures/pandan.webp`,
    image: `${ASSETS}/renders/pandan.webp`,
  },
] as const;

export type Colourway = (typeof COLOURWAYS)[number];
export type ColourwayId = Colourway['id'];

export const SIZES = ['6', '7', '8', '9', '10', '11'] as const;

export const colourway = (id: string) =>
  COLOURWAYS.find((item) => item.id === id) ?? COLOURWAYS[0];

export interface Product {
  slug: string;
  name: string;
  tagline: string;
  price: number;
  compareAt?: number;
  blurb: string;
  /** Same upper, different insides: what changes from tier to tier. */
  specs: [string, string][];
  highlights: string[];
  rating: number;
  reviews: number;
  tag?: 'Bestseller' | 'New';
}

export const PRODUCTS: Product[] = [
  {
    slug: 'strider',
    name: 'Strider',
    tagline: 'The everyday pair',
    price: 189,
    blurb:
      'A light knit sneaker for work, class, the LRT and the walk to the mamak after.',
    specs: [
      ['Weight', '240 g (UK 8)'],
      ['Midsole', '32 mm foam'],
      ['Upper', 'Recycled knit'],
      ['Outsole', 'Wet-floor rubber'],
    ],
    highlights: ['240 g', '32 mm foam', 'Wet-floor grip'],
    rating: 4.8,
    reviews: 1240,
    tag: 'Bestseller',
  },
  {
    slug: 'strider-pro',
    name: 'Strider Pro',
    tagline: 'For long days on your feet',
    price: 239,
    blurb:
      'The same knit over thicker, springier foam, for shifts, events and full days out.',
    specs: [
      ['Weight', '255 g (UK 8)'],
      ['Midsole', '36 mm springy foam'],
      ['Insole', 'Removable, washable'],
      ['Outsole', 'Wet-floor rubber'],
    ],
    highlights: ['36 mm foam', 'Washable insole', 'All-day comfort'],
    rating: 4.9,
    reviews: 418,
    tag: 'New',
  },
  {
    slug: 'strider-max',
    name: 'Strider Max',
    tagline: 'Most cushion',
    price: 279,
    compareAt: 319,
    blurb:
      'Our softest pair, with the most foam we could fit under your foot. For people who walk all day.',
    specs: [
      ['Weight', '268 g (UK 8)'],
      ['Midsole', '40 mm dual-density foam'],
      ['Insole', 'Removable, washable'],
      ['Outsole', 'Wet-floor rubber'],
    ],
    highlights: ['40 mm foam', 'Dual-density', 'Softest ride'],
    rating: 4.7,
    reviews: 655,
  },
];

export const productBySlug = (slug: string) =>
  PRODUCTS.find((product) => product.slug === slug);

export const lineKey = (slug: string, colour: string, size: string) =>
  `${slug}|${colour}|${size}`;

/** A believable starting stock per size: a few sizes run low. */
export function startingStock(key: string) {
  const [, , size] = key.split('|');
  if (size === '6' || size === '11') return 3;
  let hash = 0;
  for (const char of key) hash = (hash * 31 + char.charCodeAt(0)) % 997;
  return 6 + (hash % 14);
}

export const DELIVERY = [
  { id: 'standard', name: 'Standard', detail: '2 to 4 working days', fee: 8 },
  { id: 'express', name: 'Express', detail: 'Next working day', fee: 15 },
  {
    id: 'pickup',
    name: 'Pick up',
    detail: 'Langkah studio, Shah Alam',
    fee: 0,
  },
] as const;

export type DeliveryId = (typeof DELIVERY)[number]['id'];

export function deliveryFee(id: DeliveryId, subtotal: number) {
  const option = DELIVERY.find((item) => item.id === id) ?? DELIVERY[0];
  return id === 'standard' && subtotal >= FREE_DELIVERY_AT ? 0 : option.fee;
}

export const PAY_METHODS = [
  { id: 'fpx', name: 'FPX online banking' },
  { id: 'card', name: 'Debit or credit card' },
  { id: 'ewallet', name: 'E-wallet or DuitNow QR' },
] as const;

export type PayMethod = (typeof PAY_METHODS)[number]['id'];

export const REVIEWS = [
  {
    name: 'Aiman R.',
    city: 'Shah Alam',
    rating: 5,
    text: 'Wore the Pro for a 12-hour wedding shift. Still fine at the end, which never happens.',
    product: 'Strider Pro',
  },
  {
    name: 'Nadia K.',
    city: 'Penang',
    rating: 5,
    text: 'Got caught in the evening rain at Gurney and did not slip once on the tiles.',
    product: 'Strider',
  },
  {
    name: 'Jason T.',
    city: 'Johor Bahru',
    rating: 4,
    text: 'The Max is like walking on a pillow. Runs half a size big, so size down.',
    product: 'Strider Max',
  },
];

export const rm = (amount: number) =>
  `RM${amount.toLocaleString('en-MY', { minimumFractionDigits: 0 })}`;
