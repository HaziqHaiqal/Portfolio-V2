import { SERI_GLOW as P } from '@components/Templates/photos';

export const BRAND = 'Seri Glow';
export { P as PHOTOS };
export const FREE_POSTAGE_AT = 80;

export const FILTERS = [
  'Brightening',
  'Hydrating',
  'Oily skin',
  'Sun care',
] as const;
export type Filter = (typeof FILTERS)[number];

export interface Product {
  id: string;
  name: string;
  benefit: string;
  description: string;
  size: string;
  price: number;
  image: string;
  rating: number;
  reviews: number;
  tags: Filter[];
  ingredients: string[];
  howTo: string;
  badge?: string;
}

export const PRODUCTS: Product[] = [
  {
    id: 'glow-serum',
    name: 'Glow Serum',
    benefit: '10% niacinamide for dull, uneven tone',
    description:
      'A water-light serum that fades dark spots and evens out tone without stickiness. Sinks in within seconds, even on humid days.',
    size: '30 ml',
    price: 59,
    image: P.pSerum,
    rating: 4.9,
    reviews: 812,
    tags: ['Brightening', 'Oily skin'],
    ingredients: ['10% niacinamide', 'Centella asiatica', 'Zinc PCA'],
    howTo:
      'Morning and night. Press 3 drops into clean skin before moisturiser.',
    badge: 'Bestseller',
  },
  {
    id: 'barrier-cream',
    name: 'Barrier Cream',
    benefit: 'Ceramides and oat for dry, tight skin',
    description:
      'A soft gel-cream that repairs a stressed skin barrier and keeps moisture in for 24 hours, without feeling heavy.',
    size: '50 ml',
    price: 69,
    image: P.pCream,
    rating: 4.8,
    reviews: 534,
    tags: ['Hydrating'],
    ingredients: ['Ceramide complex', 'Colloidal oat', 'Panthenol'],
    howTo: 'Morning and night, as the last step before sunscreen.',
  },
  {
    id: 'gentle-cleanser',
    name: 'Gentle Cleanser',
    benefit: 'Low-foam gel that never feels tight',
    description:
      'Removes sunscreen and oil while keeping skin soft. pH balanced and gentle enough for twice-daily use.',
    size: '120 ml',
    price: 39,
    image: P.pCleanser,
    rating: 4.8,
    reviews: 427,
    tags: ['Oily skin', 'Hydrating'],
    ingredients: ['Amino acids', 'Green tea', 'Glycerin'],
    howTo: 'Massage onto damp skin for 30 seconds, then rinse.',
  },
  {
    id: 'daily-sun-fluid',
    name: 'Daily Sun Fluid SPF50',
    benefit: 'No white cast, no sticky finish',
    description:
      'Broad-spectrum SPF50 PA++++ in a fluid that dries to a soft matte finish. Comfortable under makeup and tudung.',
    size: '50 ml',
    price: 49,
    image: P.pSunscreen,
    rating: 4.9,
    reviews: 689,
    tags: ['Sun care', 'Oily skin'],
    ingredients: ['SPF50 PA++++', 'Niacinamide', 'Vitamin E'],
    howTo: 'Apply two finger lengths as the last step every morning.',
    badge: 'New',
  },
  {
    id: 'rose-dew-toner',
    name: 'Rose Dew Toner',
    benefit: 'Hydrating essence with rose water',
    description:
      'A milky essence that floods skin with hydration and preps it for serum. Alcohol-free and soothing.',
    size: '150 ml',
    price: 45,
    image: P.pToner,
    rating: 4.7,
    reviews: 298,
    tags: ['Hydrating', 'Brightening'],
    ingredients: ['Rose water', 'Hyaluronic acid', 'Beta-glucan'],
    howTo: 'Pat into skin with your hands after cleansing.',
  },
  {
    id: 'night-repair-oil',
    name: 'Night Repair Oil',
    benefit: 'Squalane and rosehip while you sleep',
    description:
      'A fast-absorbing oil that softens texture overnight. Wake up to calmer, plumper skin.',
    size: '30 ml',
    price: 65,
    image: P.pOil,
    rating: 4.8,
    reviews: 211,
    tags: ['Hydrating', 'Brightening'],
    ingredients: ['Squalane', 'Rosehip oil', 'Bakuchiol'],
    howTo: 'At night, warm 2 drops between palms and press onto skin.',
  },
];

export const product = (id: string) =>
  PRODUCTS.find((item) => item.id === id) as Product;

export const ROUTINE = [
  { step: 'Cleanse', id: 'gentle-cleanser' },
  { step: 'Treat', id: 'glow-serum' },
  { step: 'Protect', id: 'daily-sun-fluid' },
];

export const GLOW_SET = {
  id: 'glow-routine-set',
  name: 'Glow Routine Set',
  price: 129,
  image: P.modelGlow,
};

export const RATING_BREAKDOWN = [
  { stars: 5, share: 91 },
  { stars: 4, share: 6 },
  { stars: 3, share: 2 },
  { stars: 2, share: 1 },
  { stars: 1, share: 0 },
];

export const REVIEWS = [
  {
    name: 'Nadia A.',
    place: 'Shah Alam',
    skin: 'Combination skin',
    bought: 'Glow Serum',
    title: 'Dark spots faded by bottle two',
    text: 'It sinks in fast, even in this heat, and my acne marks are so much lighter. Already on my third bottle.',
    photo: P.review1,
  },
  {
    name: 'Mei Ling T.',
    place: 'Petaling Jaya',
    skin: 'Sensitive skin',
    bought: 'Barrier Cream',
    title: 'Finally no stinging',
    text: 'No fragrance and no breakouts. The first moisturiser my sensitive skin actually likes.',
    photo: P.review2,
  },
  {
    name: 'Aisyah R.',
    place: 'Kuantan',
    skin: 'Oily skin',
    bought: 'Daily Sun Fluid',
    title: 'No shine under tudung',
    text: 'I wear it all day under my tudung and it never looks greasy. No white cast in photos either.',
    photo: P.review3,
  },
];

export const FAQS = [
  {
    question: 'Are the products halal?',
    answer:
      'Yes. Every product uses halal-certified ingredients and is notified with KKM. The notification number is printed on each box.',
  },
  {
    question: 'Can I use them while pregnant or breastfeeding?',
    answer:
      'The cleanser, toner, cream and sun fluid are suitable. Check with your doctor before using the serum or oil.',
  },
  {
    question: 'How long does delivery take?',
    answer:
      'Orders are posted within one working day. Delivery takes 2 to 3 days in Peninsular Malaysia and 4 to 7 days to Sabah and Sarawak.',
  },
  {
    question: 'What if a product does not suit my skin?',
    answer:
      'Send us a photo on WhatsApp within 14 days of delivery and we will exchange it for another product.',
  },
];

export const INGREDIENTS = [
  {
    figure: '10%',
    name: 'Niacinamide',
    text: 'Fades dark spots and acne marks, and keeps oil in check through the afternoon.',
    image: P.texture,
  },
  {
    figure: '5',
    name: 'Ceramides',
    text: 'Rebuild a stressed skin barrier, so moisture stays in and redness calms down.',
    image: P.modelGlow,
  },
  {
    figure: '0%',
    name: 'Fragrance',
    text: 'No added scent, essential oils or alcohol. Gentle enough for sensitive skin.',
    image: P.modelCream,
  },
];
