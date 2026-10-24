import { RUANG as P } from '@components/Templates/photos';

export const BRAND = 'Ruang';
export const BASE_PATH = '/templates/ruang';
export const FREE_DELIVERY_AT = 250;
export const STUDIO = 'Ruang studio, Damansara Kim';

export const CATEGORIES = [
  { id: 'tableware', label: 'Tableware' },
  { id: 'glassware', label: 'Glassware' },
  { id: 'linen', label: 'Linen' },
  { id: 'scent', label: 'Scent' },
  { id: 'decor', label: 'Lamps & vases' },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]['id'];

export interface OptionValue {
  label: string;
  /** Added to the base price. */
  delta?: number;
  swatch?: string;
  /** Gallery photo to show when picked. */
  image?: number;
}

export interface ProductOption {
  name: string;
  values: OptionValue[];
}

/** A piece shown in 3D, turned from a profile in code rather than a model file. */
export interface Model3D {
  shape: 'cup' | 'plate' | 'bowl' | 'vase';
  finish: 'speckled' | 'matte';
  /** The glaze when no glaze option is picked. */
  color: string;
  /** Scale for each size option, the largest being 1. */
  sizes?: Record<string, number>;
}

export interface Product {
  slug: string;
  name: string;
  category: CategoryId;
  price: number;
  compareAt?: number;
  blurb: string;
  images: string[];
  options: ProductOption[];
  specs: [string, string][];
  care: string;
  /** Floor for every option's starting stock, for pieces the table builder sells in fours. */
  minStock?: number;
  model?: Model3D;
  rating: number;
  reviews: number;
  tag?: 'Bestseller' | 'New' | 'Set';
}

const STONEWARE_CARE =
  'Dishwasher and microwave safe. Each glaze pools a little differently, so no two pieces match exactly.';
const SCENTS: ProductOption = {
  name: 'Scent',
  values: [
    { label: 'Pandan & coconut' },
    { label: 'Teak & vetiver' },
    { label: 'White tea & jasmine' },
  ],
};

export const PRODUCTS: Product[] = [
  {
    slug: 'speckled-cup',
    name: 'Speckled stoneware cup',
    category: 'tableware',
    price: 48,
    blurb:
      'Thrown by hand and glazed in two earthy finishes. Holds a long black or a proper teh tarik.',
    images: [P.cupOat, P.cupRust],
    options: [
      {
        name: 'Glaze',
        values: [
          { label: 'Oat', swatch: '#D8CBB6', image: 0 },
          { label: 'Rust', swatch: '#C08A5E', image: 1 },
        ],
      },
      {
        name: 'Set',
        values: [{ label: 'Single' }, { label: 'Pair', delta: 44 }],
      },
    ],
    specs: [
      ['Material', 'Stoneware'],
      ['Capacity', '250 ml'],
      ['Made in', 'Selangor'],
    ],
    care: STONEWARE_CARE,
    minStock: 12,
    model: { shape: 'cup', finish: 'speckled', color: '#D8CBB6' },
    rating: 4.9,
    reviews: 186,
    tag: 'Bestseller',
  },
  {
    slug: 'rim-dinner-plate',
    name: 'Rim dinner plate',
    category: 'tableware',
    price: 58,
    blurb:
      'A wide, flat rim that frames food like a restaurant plate. Matte inside, glossy at the edge.',
    images: [P.plateChalk, P.plateStorm],
    options: [
      {
        name: 'Glaze',
        values: [
          { label: 'Chalk', swatch: '#EEEBE4', image: 0 },
          { label: 'Storm', swatch: '#9A9A96', image: 1 },
        ],
      },
      {
        name: 'Size',
        values: [{ label: '21 cm' }, { label: '27 cm', delta: 16 }],
      },
    ],
    specs: [
      ['Material', 'Stoneware, matte glaze'],
      ['Sizes', '21 cm side plate, 27 cm dinner plate'],
      ['Made in', 'Selangor'],
    ],
    care: STONEWARE_CARE,
    minStock: 12,
    model: {
      shape: 'plate',
      finish: 'matte',
      color: '#EEEBE4',
      sizes: { '21 cm': 0.78, '27 cm': 1 },
    },
    rating: 4.8,
    reviews: 241,
    tag: 'Bestseller',
  },
  {
    slug: 'stacking-side-plates',
    name: 'Stacking side plates, set of 4',
    category: 'tableware',
    price: 158,
    compareAt: 176,
    blurb:
      'Four low plates that stack neatly on an open shelf. For kuih, cake and sharing plates.',
    images: [P.plateStack],
    options: [],
    specs: [
      ['Material', 'Stoneware'],
      ['Size', '19 cm, 2 cm deep'],
      ['In the set', '4 plates'],
    ],
    care: STONEWARE_CARE,
    rating: 4.7,
    reviews: 98,
  },
  {
    slug: 'speckled-serving-bowl',
    name: 'Speckled serving bowl',
    category: 'tableware',
    price: 68,
    blurb:
      'Deep enough for a family curry, pretty enough to leave out with fruit in it.',
    images: [P.bowlsSpeckled, P.bowlStudio],
    options: [
      {
        name: 'Size',
        values: [
          { label: '14 cm' },
          { label: '18 cm', delta: 20 },
          { label: '24 cm', delta: 52 },
        ],
      },
    ],
    specs: [
      ['Material', 'Stoneware, speckled glaze'],
      ['Made in', 'Selangor'],
    ],
    care: STONEWARE_CARE,
    model: {
      shape: 'bowl',
      finish: 'speckled',
      color: '#E4DDD0',
      sizes: { '14 cm': 0.6, '18 cm': 0.76, '24 cm': 1 },
    },
    rating: 4.8,
    reviews: 132,
  },
  {
    slug: 'charcoal-noodle-bowl',
    name: 'Charcoal noodle bowl',
    category: 'tableware',
    price: 62,
    blurb:
      'A wide, deep bowl in a satin charcoal glaze. Sized for a generous bowl of laksa.',
    images: [P.bowlCharcoal],
    options: [
      {
        name: 'Set',
        values: [{ label: 'Single' }, { label: 'Pair', delta: 56 }],
      },
    ],
    specs: [
      ['Material', 'Stoneware, satin glaze'],
      ['Size', '19 cm, 1.1 litres'],
    ],
    care: STONEWARE_CARE,
    rating: 4.9,
    reviews: 64,
    tag: 'New',
  },
  {
    slug: 'teak-serving-board',
    name: 'Teak serving board',
    category: 'tableware',
    price: 129,
    blurb:
      'Reclaimed teak on two low feet, so it lifts off the table. For bread, cheese or a cake.',
    images: [P.boardPaddle, P.board],
    options: [
      {
        name: 'Length',
        values: [{ label: '45 cm' }, { label: '60 cm', delta: 40 }],
      },
    ],
    specs: [
      ['Material', 'Reclaimed teak'],
      ['Finish', 'Food-safe oil'],
    ],
    care: 'Hand wash and dry straight away. Rub with a little food-safe oil once a month.',
    rating: 4.7,
    reviews: 77,
  },
  {
    slug: 'dip-bowls-with-tray',
    name: 'Dip bowls with teak tray',
    category: 'tableware',
    price: 89,
    blurb:
      'Three ribbed bowls for sambal, kicap and pickles, on a tray that carries them in one go.',
    images: [P.dipSet],
    options: [],
    specs: [
      ['In the set', '3 stoneware bowls, 1 teak tray'],
      ['Bowls', '8 cm'],
    ],
    care: 'Bowls are dishwasher safe. Hand wash the tray.',
    rating: 4.6,
    reviews: 53,
    tag: 'New',
  },
  {
    slug: 'the-table-set',
    name: 'The table set',
    category: 'tableware',
    price: 359,
    compareAt: 428,
    blurb:
      'Everything for dinner for two: dinner plates, cups, a serving bowl and linen napkins.',
    images: [P.tableSet, P.hero],
    options: [],
    specs: [
      [
        'In the box',
        '2 rim dinner plates, 2 speckled cups, 1 serving bowl, 4 linen napkins',
      ],
      ['You save', 'RM69 on buying them separately'],
    ],
    care: STONEWARE_CARE,
    rating: 4.9,
    reviews: 58,
    tag: 'Set',
  },
  {
    slug: 'bedside-carafe',
    name: 'Bedside carafe with glass',
    category: 'glassware',
    price: 98,
    blurb:
      'Mouth-blown glass. The cup sits on the neck as a lid, so water stays clean overnight.',
    images: [P.carafe],
    options: [],
    specs: [
      ['Material', 'Mouth-blown borosilicate glass'],
      ['Capacity', '800 ml carafe, 200 ml glass'],
    ],
    care: 'Dishwasher safe on the top rack.',
    rating: 4.8,
    reviews: 112,
    tag: 'Bestseller',
  },
  {
    slug: 'ribbed-tumblers',
    name: 'Ribbed tumblers, set of 4',
    category: 'glassware',
    price: 110,
    blurb:
      'Fine ribs that catch the afternoon light. Heavy base, thin lip, nice to hold.',
    images: [P.tumblers, P.tumblersLight],
    options: [
      {
        name: 'Size',
        values: [
          { label: 'Low, 220 ml' },
          { label: 'Tall, 330 ml', delta: 20 },
        ],
      },
    ],
    specs: [
      ['Material', 'Soda-lime glass'],
      ['In the set', '4 tumblers'],
    ],
    care: 'Dishwasher safe.',
    rating: 4.7,
    reviews: 149,
  },
  {
    slug: 'washed-linen-napkins',
    name: 'Washed linen napkins, set of 4',
    category: 'linen',
    price: 96,
    blurb:
      'Stone-washed so they arrive soft and already a little creased. Better with every wash.',
    images: [P.napkins, P.napkinsClose],
    options: [
      {
        name: 'Colour',
        values: [
          { label: 'Pastel mix', swatch: '#E9D3C8', image: 0 },
          { label: 'Clay', swatch: '#8E7D6C', image: 1 },
        ],
      },
    ],
    specs: [
      ['Material', '100% European flax linen'],
      ['Size', '45 × 45 cm'],
    ],
    care: 'Machine wash warm. Tumble dry low or line dry. No ironing needed.',
    rating: 4.8,
    reviews: 203,
  },
  {
    slug: 'linen-duvet-cover',
    name: 'Washed linen duvet cover',
    category: 'linen',
    price: 429,
    compareAt: 489,
    blurb:
      'Breathable linen that stays cool on humid nights. Comes with two pillowcases.',
    images: [P.duvetWhite, P.duvetSage],
    options: [
      {
        name: 'Colour',
        values: [
          { label: 'White', swatch: '#F4F3F0', image: 0 },
          { label: 'Sage', swatch: '#7C8C7E', image: 1 },
        ],
      },
      {
        name: 'Size',
        values: [
          { label: 'Single' },
          { label: 'Queen', delta: 90 },
          { label: 'King', delta: 150 },
        ],
      },
    ],
    specs: [
      ['Material', '100% European flax linen, stone washed'],
      ['In the set', '1 duvet cover, 2 pillowcases'],
      ['Closure', 'Coconut shell buttons'],
    ],
    care: 'Machine wash warm. Line dry in the shade to keep the colour.',
    rating: 4.9,
    reviews: 87,
  },
  {
    slug: 'amber-jar-candle',
    name: 'Amber jar candle',
    category: 'scent',
    price: 79,
    blurb:
      'Soy and coconut wax with a cotton wick. A slow, clean burn that fills a room.',
    images: [P.candleAmber, P.candleGlass],
    options: [SCENTS],
    specs: [
      ['Wax', 'Soy and coconut'],
      ['Burn time', 'About 50 hours'],
      ['Size', '220 g'],
    ],
    care: 'Trim the wick to 5 mm before each burn. Burn for at least an hour the first time.',
    rating: 4.8,
    reviews: 318,
    tag: 'Bestseller',
  },
  {
    slug: 'reed-diffuser',
    name: 'Reed diffuser',
    category: 'scent',
    price: 119,
    blurb:
      'Rattan reeds in a smoked glass bottle. Lasts about three months in a living room.',
    images: [P.diffuser],
    options: [
      SCENTS,
      {
        name: 'Size',
        values: [{ label: '200 ml' }, { label: '500 ml', delta: 80 }],
      },
    ],
    specs: [
      ['Lasts', 'About 3 months (200 ml)'],
      ['In the box', 'Bottle, oil, 8 rattan reeds'],
    ],
    care: 'Flip the reeds once a week. Keep away from direct sun.',
    rating: 4.7,
    reviews: 124,
  },
  {
    slug: 'arch-ceramic-lamp',
    name: 'Arch ceramic lamp',
    category: 'decor',
    price: 389,
    blurb:
      'A sculpted ceramic base under a linen shade. Warm, low light for a sideboard or bedside.',
    images: [P.lampCeramic],
    options: [],
    specs: [
      ['Base', 'Glazed ceramic'],
      ['Shade', 'Linen'],
      ['Bulb', 'E27 LED, warm 2700K, included'],
      ['Plug', 'UK 3-pin'],
    ],
    care: 'Dust with a dry cloth. Use bulbs up to 8 W LED.',
    rating: 4.9,
    reviews: 41,
    tag: 'New',
  },
  {
    slug: 'fluted-glass-lamp',
    name: 'Fluted glass lamp',
    category: 'decor',
    price: 459,
    blurb:
      'An opal fluted shade on a brushed brass stem. Soft, even light with no glare.',
    images: [P.lampFluted],
    options: [],
    specs: [
      ['Shade', 'Opal glass'],
      ['Stem', 'Brushed brass'],
      ['Bulb', 'E14 LED, warm 2700K, included'],
      ['Plug', 'UK 3-pin'],
    ],
    care: 'Wipe the glass with a soft damp cloth. Brass darkens a little with time.',
    rating: 4.8,
    reviews: 36,
  },
  {
    slug: 'ring-vase',
    name: 'Ring vase',
    category: 'decor',
    price: 89,
    blurb:
      'A sand-coloured ring with a narrow neck for one or two dried stems.',
    images: [P.vaseRing],
    options: [],
    specs: [
      ['Material', 'Unglazed stoneware'],
      ['Size', '24 cm tall'],
    ],
    care: 'For dried flowers. Dust with a soft brush.',
    rating: 4.6,
    reviews: 92,
  },
  {
    slug: 'bud-vases',
    name: 'Bud vases, set of 2',
    category: 'decor',
    price: 79,
    blurb:
      'Two tall bud vases in a soft gloss, for a single stem or a sprig from the garden.',
    images: [P.budVasesWhite, P.vaseBud],
    options: [],
    specs: [
      ['Material', 'Glazed stoneware'],
      ['Size', '9 cm and 11 cm tall'],
    ],
    care: 'Watertight. Hand wash.',
    rating: 4.7,
    reviews: 69,
  },
  {
    slug: 'pebble-vase',
    name: 'Pebble vase',
    category: 'decor',
    price: 69,
    compareAt: 79,
    blurb:
      'A rounded matte vase that looks good empty and better with a few dried stems.',
    images: [P.vaseWhite, P.vaseSprig],
    options: [
      {
        name: 'Size',
        values: [
          { label: 'Small', image: 1 },
          { label: 'Large', delta: 30, image: 0 },
        ],
      },
    ],
    specs: [
      ['Material', 'Matte stoneware'],
      ['Size', '14 cm or 22 cm tall'],
    ],
    care: 'Watertight. Hand wash.',
    model: {
      shape: 'vase',
      finish: 'matte',
      color: '#ECE9E3',
      sizes: { Small: 0.66, Large: 1 },
    },
    rating: 4.8,
    reviews: 117,
    tag: 'New',
  },
  {
    slug: 'cube-table-lamp',
    name: 'Cube table lamp',
    category: 'decor',
    price: 299,
    blurb:
      'A frosted glass cube on a walnut stem. Warm, even light for a bedside or desk.',
    images: [P.lampGlow],
    options: [],
    specs: [
      ['Shade', 'Frosted glass'],
      ['Base', 'Solid walnut'],
      ['Bulb', 'E14 LED, warm 2700K, included'],
      ['Plug', 'UK 3-pin'],
    ],
    care: 'Wipe the glass with a soft cloth. Use bulbs up to 6 W LED.',
    rating: 4.9,
    reviews: 52,
    tag: 'New',
  },
  {
    slug: 'everyday-mug',
    name: 'Everyday mug',
    category: 'tableware',
    price: 39,
    compareAt: 45,
    blurb:
      'A tall glossy mug that holds a proper kopi. Thick walls keep it hot for longer.',
    images: [P.mugWhite],
    options: [
      {
        name: 'Set',
        values: [{ label: 'Single' }, { label: 'Set of 4', delta: 99 }],
      },
    ],
    specs: [
      ['Material', 'Glazed stoneware'],
      ['Capacity', '350 ml'],
    ],
    care: STONEWARE_CARE,
    rating: 4.7,
    reviews: 264,
  },
  {
    slug: 'candle-trio',
    name: 'Candle trio',
    category: 'scent',
    price: 119,
    compareAt: 135,
    blurb:
      'Three soy candles in reusable jars: lemongrass, pandan and white tea.',
    images: [P.jarCandles],
    options: [],
    specs: [
      ['Wax', 'Soy'],
      ['Burn time', 'About 25 hours each'],
      ['In the set', '3 candles, 120 g each'],
    ],
    care: 'Trim the wick to 5 mm before each burn.',
    rating: 4.8,
    reviews: 143,
    tag: 'Bestseller',
  },
];

/** A maker credit and a few reviews per product, so pages read like a real shop. */
export const MAKERS: Record<CategoryId, string> = {
  tableware: 'Hulu Langat studio',
  glassware: 'Johor glassworks',
  linen: 'Ruang linen',
  scent: 'Ruang scent',
  decor: 'Ruang studio',
};

export const REVIEWS = [
  {
    name: 'Nurul A.',
    city: 'Shah Alam',
    rating: 5,
    text: 'Arrived double boxed and every piece was perfect. The glaze looks even better in real life.',
  },
  {
    name: 'Daniel T.',
    city: 'Penang',
    rating: 5,
    text: 'Bought the table set for our new place. Paid by FPX and it arrived in three days.',
  },
  {
    name: 'Priya S.',
    city: 'Kuala Lumpur',
    rating: 4,
    text: 'Lovely quality. One cup had a chip and they sent a new one the same week.',
  },
  {
    name: 'Hafiz R.',
    city: 'Johor Bahru',
    rating: 5,
    text: 'The lamp gives such a warm light. Checkout was quick and I got tracking right away.',
  },
];

/** True when an option changes the price, so listings say "From". */
export const hasPriceOptions = (product: Product) =>
  product.options.some((option) => option.values.some((value) => value.delta));

export const productBySlug = (slug: string) =>
  PRODUCTS.find((product) => product.slug === slug);

export const lineKey = (slug: string, values: string[]) =>
  [slug, ...values].join('|');

export const unitPrice = (product: Product, values: string[]) =>
  product.price +
  product.options.reduce(
    (sum, option, index) =>
      sum +
      (option.values.find((value) => value.label === values[index])?.delta ??
        0),
    0
  );

/** Every combination of option values, e.g. ["Oat", "Pair"]. */
export function variantsOf(product: Product): string[][] {
  return product.options.reduce<string[][]>(
    (combos, option) =>
      combos.flatMap((combo) =>
        option.values.map((value) => [...combo, value.label])
      ),
    [[]]
  );
}

// A fixed, believable starting stock per variant, with some running low.
export function startingStock(key: string) {
  let hash = 7;
  for (const char of key) hash = (hash * 31 + char.charCodeAt(0)) % 9973;
  const roll = hash % 20;
  const stock = roll === 0 ? 0 : roll < 5 ? roll : 8 + (hash % 23);
  const floor = productBySlug(key.split('|')[0])?.minStock ?? 0;
  return Math.max(stock, floor);
}

export const DELIVERY = [
  {
    id: 'standard',
    label: 'Standard delivery',
    note: '2 to 5 working days, packed for fragile',
    fee: 12,
  },
  {
    id: 'express',
    label: 'Express',
    note: 'Next working day in the Klang Valley',
    fee: 25,
  },
  {
    id: 'pickup',
    label: 'Self-pickup',
    note: `Ready the same day at ${STUDIO}`,
    fee: 0,
  },
] as const;

export type DeliveryId = (typeof DELIVERY)[number]['id'];

export const deliveryFee = (id: DeliveryId, subtotal: number) => {
  const option = DELIVERY.find((item) => item.id === id) ?? DELIVERY[0];
  return id === 'standard' && subtotal >= FREE_DELIVERY_AT ? 0 : option.fee;
};

export const DISCOUNT = { code: 'DEMO20', amount: 20, minSpend: 200 };

export const PAY_METHODS = [
  {
    id: 'fpx',
    label: 'Online banking (FPX)',
    note: 'Pay straight from your bank account',
  },
  {
    id: 'card',
    label: 'Credit or debit card',
    note: 'Visa and Mastercard',
  },
  {
    id: 'ewallet',
    label: 'E-wallet or DuitNow QR',
    note: 'Scan with your e-wallet or banking app',
  },
  {
    id: 'cod',
    label: 'Cash on delivery',
    note: 'Pay the rider when it arrives',
  },
] as const;

export type PayMethod = (typeof PAY_METHODS)[number]['id'];

export const DEMO_BANKS = [
  { id: 'a', name: 'Demo Bank A' },
  { id: 'b', name: 'Demo Bank B' },
  { id: 'c', name: 'Demo Bank C', offline: true },
];

export type FailReason =
  | 'declined'
  | 'insufficient_funds'
  | 'bank_declined'
  | 'bank_unavailable'
  | 'otp_failed'
  | 'qr_expired'
  | 'wallet_declined'
  | 'cancelled';

export const FAIL_REASONS: Record<FailReason, string> = {
  declined: 'Your card was declined by the bank.',
  insufficient_funds: 'The card does not have enough funds.',
  bank_declined: 'The payment was declined in your bank.',
  bank_unavailable: 'Your bank is offline right now.',
  otp_failed: 'The one-time password did not match.',
  qr_expired: 'The QR code expired before it was paid.',
  wallet_declined: 'The payment was declined in your e-wallet.',
  cancelled: 'You cancelled the payment.',
};

/** How a failed payment reads to the shop owner. */
export const OWNER_REASONS: Record<FailReason, string> = {
  declined: 'card declined',
  insufficient_funds: 'not enough funds on the card',
  bank_declined: 'rejected in the bank app',
  bank_unavailable: 'their bank was offline',
  otp_failed: 'wrong one-time code',
  qr_expired: 'QR code expired before payment',
  wallet_declined: 'declined in the e-wallet',
  cancelled: 'left the payment page',
};

export const TEST_CARDS = [
  { number: '4242424242424242', result: 'Payment succeeds' },
  { number: '4000000000003220', result: 'Asks for a one-time password' },
  { number: '4000000000000002', result: 'Card declined' },
  { number: '4000000000009995', result: 'Insufficient funds' },
] as const;

export const TEST_OTP = '123456';

export const MY_STATES = [
  'Johor',
  'Kedah',
  'Kelantan',
  'Melaka',
  'Negeri Sembilan',
  'Pahang',
  'Penang',
  'Perak',
  'Perlis',
  'Sabah',
  'Sarawak',
  'Selangor',
  'Terengganu',
  'W.P. Kuala Lumpur',
  'W.P. Labuan',
  'W.P. Putrajaya',
];

export const DEMO_DETAILS = {
  name: 'Aisyah Rahman',
  email: 'aisyah@example.com',
  phone: '012-345 6789',
  address1: '12, Jalan Telawi 3',
  address2: 'Bangsar Baru',
  postcode: '59100',
  city: 'Kuala Lumpur',
  state: 'W.P. Kuala Lumpur',
};

/** Shoppable room photos; spots are percentages of the uncropped photo. */
export const ROOMS = [
  {
    id: 'dining',
    label: 'Dining',
    image: P.hero,
    alt: 'A long dining table laid with plates, glasses, bread and small vases',
    spots: [
      { slug: 'rim-dinner-plate', x: 32, y: 80 },
      { slug: 'teak-serving-board', x: 30, y: 64 },
      { slug: 'ribbed-tumblers', x: 12, y: 62 },
      { slug: 'bud-vases', x: 60, y: 57 },
    ],
  },
  {
    id: 'living',
    label: 'Living',
    image: P.lampCeramic,
    alt: 'A sideboard with a ceramic lamp, a candle on books and a small vase',
    spots: [
      { slug: 'arch-ceramic-lamp', x: 26, y: 63 },
      { slug: 'amber-jar-candle', x: 54, y: 65 },
      { slug: 'ring-vase', x: 86, y: 72 },
    ],
  },
  {
    id: 'bedroom',
    label: 'Bedroom',
    image: P.bedroom,
    alt: 'A made bed with a breakfast tray, beside a nightstand with a candle and vase',
    spots: [
      { slug: 'linen-duvet-cover', x: 22, y: 46 },
      { slug: 'amber-jar-candle', x: 70, y: 39 },
      { slug: 'bud-vases', x: 83, y: 36 },
      { slug: 'speckled-cup', x: 63, y: 74 },
      { slug: 'washed-linen-napkins', x: 73, y: 86 },
    ],
  },
] as const;

const DELIVERY_DAYS: Record<DeliveryId, number> = {
  standard: 4,
  express: 1,
  pickup: 0,
};

/** The day an order should arrive, counting from `from` and skipping Sundays. */
export function arrivalDate(deliveryId: DeliveryId, from: number) {
  const date = new Date(from);
  let days = DELIVERY_DAYS[deliveryId];
  while (days > 0) {
    date.setDate(date.getDate() + 1);
    if (date.getDay() !== 0) days -= 1;
  }
  return date.toLocaleDateString('en-MY', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}
