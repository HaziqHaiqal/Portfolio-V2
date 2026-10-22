import { ATELIER_NURA as P } from '@components/Templates/photos';

export const BRAND = 'Atelier Nura';
export { P as PHOTOS };
export const BASE_PATH = '/templates/atelier-nura';
export const FREE_POSTAGE_AT = 300;

export const CATEGORIES = ['Abaya', 'Dresses', 'Tudung'] as const;
export type Category = (typeof CATEGORIES)[number];

export const SIZES = ['XS', 'S', 'M', 'L', 'XL'];

export interface Colour {
  name: string;
  hex: string;
  images: string[];
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: Category;
  colours: Colour[];
  sizes: string[];
  description: string;
  fabric: string;
  isNew?: boolean;
}

const ABAYA_FABRIC =
  'Nida crepe that breathes in the heat and does not crease. Hand wash cold, hang to dry.';

export const PRODUCTS: Product[] = [
  {
    id: 'kasih-embroidered-abaya',
    name: 'Kasih Embroidered Abaya',
    price: 289,
    category: 'Abaya',
    colours: [
      {
        name: 'Black and sand',
        hex: '#1A1A1A',
        images: [P.abayaKasih, P.abayaKasihDetail, P.abayaStudio],
      },
    ],
    sizes: SIZES,
    description:
      'An open abaya with hand-finished floral embroidery down the front and a sand satin lining that shows as you move.',
    fabric: ABAYA_FABRIC,
    isNew: true,
  },
  {
    id: 'mutiara-beaded-abaya',
    name: 'Mutiara Beaded Abaya',
    price: 319,
    category: 'Abaya',
    colours: [
      {
        name: 'Black',
        hex: '#1A1A1A',
        images: [P.abayaMutiara, P.abayaMutiaraDetail, P.abayaDamai],
      },
    ],
    sizes: SIZES,
    description:
      'A straight-cut abaya with pearl beading on the cuffs and placket. Light enough for a full day of Raya visits.',
    fabric: ABAYA_FABRIC,
    isNew: true,
  },
  {
    id: 'embun-hooded-abaya',
    name: 'Embun Hooded Abaya',
    price: 229,
    category: 'Abaya',
    colours: [
      { name: 'Stone', hex: '#CFC6BA', images: [P.abayaEmbun, P.campaign] },
    ],
    sizes: SIZES,
    description:
      'A soft hooded abaya in stone, cut loose with a gentle A-line. Wear it open or closed with hidden snaps.',
    fabric: ABAYA_FABRIC,
    isNew: true,
  },
  {
    id: 'satin-shawl',
    name: 'Satin Shawl',
    price: 59,
    category: 'Tudung',
    colours: [
      { name: 'Cocoa', hex: '#6B4A3A', images: [P.tudungKoko] },
      { name: 'Dusty rose', hex: '#C99AA0', images: [P.tudungRose] },
    ],
    sizes: ['One size'],
    description:
      'A fluid satin shawl that drapes without pins slipping. 180 by 70 cm, with finished edges.',
    fabric: 'Silky satin. Hand wash cold and iron on low.',
    isNew: true,
  },
  {
    id: 'seri-floral-abaya',
    name: 'Seri Floral Abaya',
    price: 299,
    category: 'Abaya',
    colours: [
      {
        name: 'Black and camel',
        hex: '#1A1A1A',
        images: [P.abayaSeri, P.abayaKasihDetail],
      },
    ],
    sizes: SIZES,
    description:
      'Gold thread florals on the hem and a camel satin lining. Our most photographed piece this season.',
    fabric: ABAYA_FABRIC,
  },
  {
    id: 'lembayung-open-abaya',
    name: 'Lembayung Open Abaya',
    price: 259,
    category: 'Abaya',
    colours: [
      {
        name: 'Black and lilac',
        hex: '#1A1A1A',
        images: [P.abayaLembayung, P.abayaStudio],
      },
    ],
    sizes: SIZES,
    description:
      'A clean open abaya with a lilac lining and wide cuffs. Easy to dress up or down.',
    fabric: ABAYA_FABRIC,
  },
  {
    id: 'cahaya-lace-abaya',
    name: 'Cahaya Lace Abaya',
    price: 279,
    category: 'Abaya',
    colours: [
      {
        name: 'Black and ivory',
        hex: '#1A1A1A',
        images: [P.abayaCahaya, P.abayaMutiaraDetail],
      },
    ],
    sizes: SIZES,
    description:
      'Ivory lace runs down the front panel of this full-length abaya. Made for weddings and kenduri.',
    fabric: ABAYA_FABRIC,
  },
  {
    id: 'damai-wide-sleeve-abaya',
    name: 'Damai Wide-Sleeve Abaya',
    price: 239,
    category: 'Abaya',
    colours: [
      {
        name: 'Black',
        hex: '#1A1A1A',
        images: [P.abayaDamai, P.abayaStudio],
      },
    ],
    sizes: SIZES,
    description:
      'Butterfly sleeves and a relaxed body. The abaya you will reach for every Friday.',
    fabric: ABAYA_FABRIC,
  },
  {
    id: 'dahlia-belted-jubah',
    name: 'Dahlia Belted Jubah',
    price: 219,
    category: 'Dresses',
    colours: [
      {
        name: 'Taupe',
        hex: '#A08C7A',
        images: [P.jubahDahlia, P.campaign],
      },
    ],
    sizes: SIZES,
    description:
      'A structured jubah with a self-tie belt and flared cuffs. Office to dinner without changing.',
    fabric: 'Soft twill with a little stretch. Machine wash on gentle.',
  },
  {
    id: 'anggun-pleated-dress',
    name: 'Anggun Pleated Dress',
    price: 199,
    category: 'Dresses',
    colours: [
      { name: 'Sand', hex: '#D8C7AE', images: [P.dressAnggun, P.sleeve] },
    ],
    sizes: SIZES,
    description:
      'Knife pleats from the waist and a fluid drape. Pairs with any shawl in our range.',
    fabric: 'Lightweight chiffon crepe, fully lined. Hand wash cold.',
  },
  {
    id: 'chiffon-bawal',
    name: 'Chiffon Bawal',
    price: 45,
    category: 'Tudung',
    colours: [{ name: 'Ivory', hex: '#EFEBE3', images: [P.tudungPutih] }],
    sizes: ['One size'],
    description:
      'A double-loop chiffon bawal, 45 inches, that holds its shape all day.',
    fabric: 'Premium chiffon. Hand wash cold.',
  },
  {
    id: 'instant-tudung',
    name: 'Instant Tudung',
    price: 49,
    category: 'Tudung',
    colours: [{ name: 'Mauve', hex: '#A88496', images: [P.tudungMauve] }],
    sizes: ['One size'],
    description:
      'Slip on and go. A padded front and soft jersey back that stays put.',
    fabric: 'Jersey and chiffon. Machine wash in a laundry bag.',
  },
];

export const findProduct = (id: string) =>
  PRODUCTS.find((product) => product.id === id);

export const CATEGORY_TILES: {
  category: Category;
  image: string;
  note: string;
}[] = [
  {
    category: 'Abaya',
    image: P.abayaStudio,
    note: 'Open, hooded and embroidered',
  },
  {
    category: 'Dresses',
    image: P.jubahDahlia,
    note: 'Jubah and pleated dresses',
  },
  {
    category: 'Tudung',
    image: P.tudungMauve,
    note: 'Satin, chiffon and instant',
  },
];

export const PROMISES = [
  {
    title: 'Free alteration',
    text: 'Sleeve and length adjusted before posting.',
  },
  { title: '7-day exchange', text: 'Swap sizes or styles, with tags on.' },
  { title: 'Posted in 2 days', text: 'Tracked delivery across Malaysia.' },
  { title: 'Fitting studio', text: 'Try pieces on in Bangsar.' },
];

export const SIZE_GUIDE = [
  { size: 'XS', bust: '36', length: '52', fits: '4 to 6' },
  { size: 'S', bust: '38', length: '54', fits: '8' },
  { size: 'M', bust: '40', length: '55', fits: '10' },
  { size: 'L', bust: '42', length: '56', fits: '12' },
  { size: 'XL', bust: '44', length: '57', fits: '14 to 16' },
];

export const STUDIO = {
  address: '2nd floor, 31 Jalan Telawi 3, Bangsar Baru, 59100 Kuala Lumpur',
  hours: [
    { days: 'Tuesday to Saturday', time: '11am to 7pm' },
    { days: 'Sunday', time: '12pm to 5pm' },
    { days: 'Monday', time: 'Closed' },
  ],
};

export const FAQS = [
  {
    question: 'How do I choose my size?',
    answer:
      'Our pieces are cut loose. If you are between sizes, take the smaller one, and send your height so we can adjust the length for free.',
  },
  {
    question: 'How long does delivery take?',
    answer:
      'Orders are posted within 2 working days. Delivery takes 1 to 3 days in Peninsular Malaysia and 3 to 6 days to Sabah and Sarawak.',
  },
  {
    question: 'Can I try pieces on before buying?',
    answer:
      'Yes. Book a fitting at our Bangsar studio on WhatsApp and we will prepare your sizes.',
  },
  {
    question: 'Do you take orders for family sets?',
    answer:
      'We make matching sets for weddings and family Raya photos from 6 pieces. Ask us on WhatsApp for fabric and timing.',
  },
];
