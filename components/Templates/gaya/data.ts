import type { BagProduct } from '@components/Templates/Bag';

export const SLUG = 'gaya';
export const BRAND = 'Gaya';
export const BASE_PATH = '/templates/gaya';
export const FREE_POSTAGE_AT = 300;
export const SHOP_ADDRESS = '21 Jalan Telawi 3, Bangsar Baru, 59100 Kuala Lumpur';

export const DELIVERY = [
  {
    id: 'standard',
    label: 'Standard postage',
    note: `2 to 4 working days, free above RM${FREE_POSTAGE_AT}`,
    fee: 10,
    days: 3,
  },
  {
    id: 'express',
    label: 'Express',
    note: 'Next working day in the Klang Valley',
    fee: 20,
    days: 1,
  },
  {
    id: 'pickup',
    label: 'Collect at the shop',
    note: 'Ready the same day at Jalan Telawi 3, Bangsar',
    fee: 0,
    days: 0,
  },
] as const;

export type DeliveryId = (typeof DELIVERY)[number]['id'];

export const deliveryOf = (id: DeliveryId) =>
  DELIVERY.find((item) => item.id === id) ?? DELIVERY[0];

export const deliveryFee = (id: DeliveryId, subtotal: number) =>
  id === 'standard' && subtotal >= FREE_POSTAGE_AT ? 0 : deliveryOf(id).fee;

export function arrivalDate(id: DeliveryId, from: number) {
  const date = new Date(from);
  let days: number = deliveryOf(id).days;
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

export const DEMO_DETAILS = {
  name: 'Aisyah Rahman',
  email: 'aisyah@example.com',
  phone: '012-345 6789',
  address1: '8, Jalan Kemuning 2',
  address2: 'Taman Tun Dr Ismail',
  postcode: '60000',
  city: 'Kuala Lumpur',
  state: 'W.P. Kuala Lumpur',
};

export type Kind = 'clothes' | 'shoes';
export type Category = 'Tops' | 'Outerwear' | 'Bottoms' | 'Shoes';

export interface Item {
  id: string;
  kind: Kind;
  category: Category;
  name: string;
  colour: string;
  price: number;
  sizes: string[];
  details: string;
}

const TOP_SIZES = ['XS', 'S', 'M', 'L', 'XL'];
const WAIST_SIZES = ['28', '30', '32', '34', '36'];
const SHOE_SIZES = ['39', '40', '41', '42', '43', '44', '45'];

const top = (
  id: string,
  category: Category,
  name: string,
  colour: string,
  price: number,
  details: string
): Item => ({
  id,
  kind: 'clothes',
  category,
  name,
  colour,
  price,
  sizes: TOP_SIZES,
  details,
});
const bottom = (
  id: string,
  name: string,
  colour: string,
  price: number,
  details: string
): Item => ({
  id,
  kind: 'clothes',
  category: 'Bottoms',
  name,
  colour,
  price,
  sizes: WAIST_SIZES,
  details,
});
const shoe = (
  id: string,
  name: string,
  colour: string,
  price: number,
  details: string
): Item => ({
  id,
  kind: 'shoes',
  category: 'Shoes',
  name,
  colour,
  price,
  sizes: SHOE_SIZES,
  details,
});

export const CLOTHES: Item[] = [
  top(
    'tee-boxy-black',
    'Tops',
    'Boxy Tee',
    'Black',
    79,
    'Heavy 240gsm cotton, dropped shoulders and a short, wide body.'
  ),
  top(
    'tee-boxy-white',
    'Tops',
    'Boxy Tee',
    'White',
    79,
    'Heavy 240gsm cotton, dropped shoulders and a short, wide body.'
  ),
  top(
    'hoodie-grey',
    'Tops',
    'Fleece Hoodie',
    'Heather Grey',
    189,
    'Brushed fleece inside, a double-layer hood and a kangaroo pocket.'
  ),
  top(
    'knit-oat',
    'Tops',
    'Crew Knit',
    'Oat',
    159,
    'Soft cotton knit with ribbed cuffs and hem. Easy over a tee.'
  ),
  top(
    'overshirt-olive',
    'Outerwear',
    'Cord Overshirt',
    'Olive',
    169,
    'Fine corduroy, one chest pocket. Worn open as a light jacket.'
  ),
  top(
    'chore-indigo',
    'Outerwear',
    'Chore Jacket',
    'Indigo',
    229,
    'Rigid denim with three patch pockets. Softens with every wash.'
  ),
  top(
    'puffer-navy',
    'Outerwear',
    'Short Puffer',
    'Navy',
    299,
    'Light recycled fill, a high collar and a cropped length.'
  ),
  bottom(
    'jeans-wide-light',
    'Straight Jeans',
    'Light Wash',
    189,
    'A straight leg that sits at the waist, in a pale summer wash.'
  ),
  bottom(
    'jeans-straight-black',
    'Straight Jeans',
    'Washed Black',
    179,
    'A straight leg that sits at the waist. Faded black wash.'
  ),
  bottom(
    'trousers-stone',
    'Pleated Trousers',
    'Stone Grey',
    169,
    'Single pleat, wide leg and a soft drape for hot days.'
  ),
  bottom(
    'cargo-khaki',
    'Cargo Pants',
    'Olive',
    179,
    'Ripstop cotton, bellow pockets and an adjustable hem.'
  ),
  bottom(
    'shorts-black',
    'Nylon Shorts',
    'Black',
    99,
    'Quick-dry nylon with an elastic waist and a 7 inch leg.'
  ),
];

export const SHOES: Item[] = [
  shoe(
    'shoe-court-white',
    'Court Low',
    'White',
    329,
    'Smooth leather upper, a cupsole and a padded collar.'
  ),
  shoe(
    'shoe-court-black',
    'Court Low',
    'Black',
    329,
    'Smooth leather upper, a cupsole and a padded collar.'
  ),
  shoe(
    'shoe-runner-grey',
    'Runner',
    'Grey Mesh',
    389,
    'Suede and mesh on a chunky foam sole. Made for long days.'
  ),
  shoe(
    'shoe-hi-navy',
    'Canvas Hi',
    'Navy',
    229,
    'Cotton canvas high-top with a white rubber sole.'
  ),
  shoe(
    'shoe-skate-brown',
    'Skate Low',
    'Brown Suede',
    299,
    'Padded suede, a wide tongue and a gum sole.'
  ),
  shoe(
    'shoe-trail-olive',
    'Trail Low',
    'Olive',
    419,
    'Ripstop upper with a lugged sole for wet pavements.'
  ),
];

export const ITEMS = [...CLOTHES, ...SHOES];

const TYPES: Record<string, string> = {
  'tee-boxy-black': 'Tees',
  'tee-boxy-white': 'Tees',
  'hoodie-grey': 'Hoodies and knits',
  'knit-oat': 'Hoodies and knits',
  'overshirt-olive': 'Jackets',
  'chore-indigo': 'Jackets',
  'puffer-navy': 'Jackets',
  'jeans-wide-light': 'Jeans',
  'jeans-straight-black': 'Jeans',
  'trousers-stone': 'Trousers',
  'cargo-khaki': 'Trousers',
  'shorts-black': 'Shorts',
};
export const typeOf = (item: Item) => TYPES[item.id] ?? '';

export type ListSlug = 'tops' | 'bottoms' | 'shoes';
export interface List {
  slug: ListSlug;
  name: string;
  unit: string;
  items: Item[];
}
export const LISTS: List[] = [
  {
    slug: 'tops',
    name: 'Tops',
    unit: 'pieces',
    items: CLOTHES.filter((item) => item.category !== 'Bottoms'),
  },
  {
    slug: 'bottoms',
    name: 'Bottoms',
    unit: 'pieces',
    items: CLOTHES.filter((item) => item.category === 'Bottoms'),
  },
  { slug: 'shoes', name: 'Shoes', unit: 'pairs', items: SHOES },
];
export const listBySlug = (slug: ListSlug) =>
  LISTS.find((list) => list.slug === slug)!;
export const listOf = (item: Item) =>
  LISTS.find((list) => list.items.some((other) => other.id === item.id))!;
export const listHref = (slug: ListSlug) => `${BASE_PATH}/${slug}`;

export const slugOf = (item: Item) =>
  `${item.name} ${item.colour}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
export const hrefOf = (item: Item) => `${BASE_PATH}/product/${slugOf(item)}`;
export const findBySlug = (slug: string) =>
  ITEMS.find((item) => slugOf(item) === slug);

export const imageOf = (id: string) =>
  `/templates/${SLUG}/${id.startsWith('shoe-') ? 'shoes' : 'clothes'}/${id}.webp`;

export const hungOf = (id: string) => `/templates/${SLUG}/ampaian/wb/${id}.webp`;
export const shadowOf = (id: string) =>
  `/templates/${SLUG}/ampaian/sh/${id}.webp`;

export const variantOf = (item: Item, size: string) =>
  item.kind === 'shoes'
    ? `EU ${size}`
    : item.category === 'Bottoms'
      ? `Waist ${size}`
      : size;

export const LOW_STOCK = 3;

export const stockKey = (item: Item, size: string) =>
  `${item.id}:${variantOf(item, size)}`;

// A fixed starting stock per size: most in stock, some low, a few sold out.
export function startingStock(key: string) {
  let hash = 2166136263;
  for (const char of key) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  hash >>>= 0;
  const roll = hash % 16;
  return roll === 0 ? 0 : roll < 4 ? roll : 6 + ((hash >>> 8) % 15);
}

export const bagProduct = (item: Item): BagProduct => ({
  id: item.id,
  name: `${item.name}, ${item.colour}`,
  price: item.price,
  image: imageOf(item.id),
  fit: item.kind === 'shoes' ? 'contain' : undefined,
});
