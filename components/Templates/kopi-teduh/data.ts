import { KOPI_TEDUH as P } from '@components/Templates/photos';

export const BRAND = 'Kopi Teduh';
export { P as PHOTOS };

export const ORDER_MESSAGE = [
  `Hi ${BRAND}! I'd like to order for pickup:`,
  '• ',
  '',
  'Pickup time:',
  'Name:',
].join('\n');

// Day 0 is Sunday, matching Date.getDay().
export const HOURS = [
  { days: [1, 2, 3, 4, 5], label: 'Monday to Friday', open: 7.5, close: 18 },
  { days: [6, 0], label: 'Saturday and Sunday', open: 7, close: 19 },
];

export interface MenuItem {
  key: string;
  name: string;
  note: string;
  price: string;
  iced?: string;
  image: string;
  tag?: string;
}

export const MENU: Record<string, MenuItem[]> = {
  'Kopi and teh': [
    {
      key: 'kopi',
      name: 'Kopi',
      note: 'Robusta roasted with butter and sugar',
      price: '3.50',
      iced: '4.00',
      image: P.heroCup,
      tag: 'Signature',
    },
    {
      key: 'teh-tarik',
      name: 'Teh Tarik',
      note: 'Pulled three times for the foam',
      price: '3.80',
      iced: '4.30',
      image: P.tehTarik,
    },
    {
      key: 'kopi-ais',
      name: 'Kopi Ais',
      note: 'Thick, sweet and very cold',
      price: '4.50',
      image: P.kopiAis,
    },
    {
      key: 'latte',
      name: 'Gula Melaka Latte',
      note: 'Espresso, fresh milk and palm sugar',
      price: '9.90',
      iced: '10.90',
      image: P.icedLatte,
    },
  ],
  Makan: [
    {
      key: 'rendang',
      name: 'Nasi Lemak Rendang',
      note: 'Slow-cooked beef rendang, sambal and egg',
      price: '16.90',
      image: P.nasiLemakRendang,
      tag: 'Most ordered',
    },
    {
      key: 'ayam',
      name: 'Nasi Lemak Ayam',
      note: 'Spiced fried chicken and sambal',
      price: '13.90',
      image: P.nasiLemakAyam,
    },
    {
      key: 'set',
      name: 'Nasi Lemak Biasa',
      note: 'Sambal, egg, ikan bilis and peanuts',
      price: '6.90',
      image: P.nasiLemak,
    },
  ],
  Roti: [
    {
      key: 'roti-bakar',
      name: 'Roti Bakar Kaya',
      note: 'Charcoal toast, kaya and cold butter',
      price: '5.50',
      image: P.rotiBakar,
      tag: 'Signature',
    },
    {
      key: 'roti-tisu',
      name: 'Roti Tisu',
      note: 'Crisp, sweet and very tall',
      price: '6.50',
      image: P.rotiTisu,
    },
    {
      key: 'roti-canai',
      name: 'Roti Canai Kari',
      note: 'With dhal and chicken curry',
      price: '4.50',
      image: P.rotiCanai,
    },
  ],
};

export const GALLERY = [
  { image: P.interior, caption: 'Rattan chairs and morning light' },
  { image: P.barista, caption: 'Filter coffee, one cup at a time' },
  { image: P.rotiTisu, caption: 'Roti tisu, stretched to order' },
  { image: P.interiorCounter, caption: 'The counter, under the plants' },
  { image: P.nasiLemak, caption: 'Breakfast, all day' },
];

export const REVIEWS = [
  { name: 'Hafiz R.', text: 'Kopi as thick as my grandfather made it.' },
  { name: 'Grace T.', text: 'The best rendang nasi lemak in Bangsar.' },
  {
    name: 'Priya S.',
    text: 'Roti tisu taller than my laptop. My Friday office now.',
  },
  { name: 'Daniel W.', text: 'Cool, shady and never rushed. Rare in KL.' },
];
