export const BRAND = 'Petik';
export const MIN_ORDER = 40;
export const DELIVERY_FEE = 8;
export const FREE_DELIVERY_AT = 120;
export const CUTOFF_HOUR = 22;
export const PHONE = '012-345 6789';
export const EMAIL = 'hello@petik.my';

export interface Credit {
  title: string;
  creator: string;
  licence: string;
  page: string;
}

export interface Picture {
  /** Wikimedia Commons path after `/thumb/`, e.g. `e/ef/File.jpg`, or a full URL. */
  src: string;
  alt: string;
  width: number;
  height: number;
  credit: Credit;
}

const commons = (
  path: string,
  alt: string,
  [width, height]: [number, number],
  credit: Credit
): Picture => ({ src: path, alt, width, height, credit });

const by = (title: string, creator: string, licence: string, file: string) => ({
  title,
  creator,
  licence,
  page: `https://commons.wikimedia.org/wiki/File:${file}`,
});

export const PICTURES = {
  kangkung: commons(
    '1/17/Harvested_-_Kangkong_%283446711239%29.jpg',
    'Kangkung in a yellow basin',
    [1920, 1285],
    by(
      'Harvested - Kangkong',
      'Alpha from Melbourne',
      'CC BY-SA 2.0',
      'Harvested_-_Kangkong_(3446711239).jpg'
    )
  ),
  pakchoy: commons(
    '8/8c/Brassica_rapa_var._chinensis_%28leaf%29.jpg',
    'A head of pak choy',
    [1920, 1440],
    by(
      'Brassica rapa var. chinensis (leaf)',
      'おむこさん志望',
      'CC BY 2.5',
      'Brassica_rapa_var._chinensis_(leaf).jpg'
    )
  ),
  lettuce: commons(
    '7/7b/Lactuca_sativa_%27Ashbrook%27.jpg',
    'Green coral lettuce',
    [1920, 1920],
    by(
      "Lactuca sativa 'Ashbrook'",
      'DeFacto',
      'CC BY-SA 4.0',
      "Lactuca_sativa_'Ashbrook'.jpg"
    )
  ),
  tomatoes: commons(
    'e/e0/Italian_Vine_Tomatoes_%283026014294%29.jpg',
    'Tomatoes on the vine',
    [1920, 1271],
    by(
      'Italian Vine Tomatoes',
      'THOR',
      'CC BY 2.0',
      'Italian_Vine_Tomatoes_(3026014294).jpg'
    )
  ),
  capsicum: commons(
    '8/87/Red-Pepper.jpg',
    'A red capsicum',
    [1920, 1874],
    by('Red-Pepper', 'Evan-Amos', 'CC0', 'Red-Pepper.jpg')
  ),
  carrots: commons(
    'a/a2/Vegetable-Carrot-Bundle-wStalks.jpg',
    'A bunch of carrots with their tops',
    [1920, 1089],
    by(
      'Vegetable-Carrot-Bundle-wStalks',
      'Evan-Amos',
      'Public domain',
      'Vegetable-Carrot-Bundle-wStalks.jpg'
    )
  ),
  springonion: commons(
    'd/da/CSA-Red-Spring-Onions.jpg',
    'A bunch of spring onions',
    [1920, 1277],
    by(
      'CSA-Red-Spring-Onions',
      'Evan-Amos',
      'Public domain',
      'CSA-Red-Spring-Onions.jpg'
    )
  ),
  corn: commons(
    'a/a0/Fresh_Sweet_Corn.jpg',
    'A cob of sweet corn in its husk',
    [1920, 1280],
    by('Fresh Sweet Corn', 'Couleur', 'CC0', 'Fresh_Sweet_Corn.jpg')
  ),
  strawberries: commons(
    '4/4c/Garden_strawberry_%28Fragaria_%C3%97_ananassa%29_single2.jpg',
    'A strawberry',
    [1920, 1280],
    by(
      'Garden strawberry (Fragaria × ananassa) single2',
      'Ivar Leidus',
      'CC BY-SA 4.0',
      'Garden_strawberry_(Fragaria_×_ananassa)_single2.jpg'
    )
  ),
  mangosteen: commons(
    '9/93/Mangosteens_-_whole_and_opened.jpg',
    'A mangosteen, whole and opened',
    [1920, 1280],
    by(
      'Mangosteens - whole and opened',
      'Ivar Leidus',
      'CC BY-SA 4.0',
      'Mangosteens_-_whole_and_opened.jpg'
    )
  ),
  rambutan: commons(
    'b/bb/Rambutans_with_seed.jpg',
    'Rambutans, one peeled',
    [1920, 1280],
    by(
      'Rambutans with seed',
      'Ivar Leidus',
      'CC BY-SA 4.0',
      'Rambutans_with_seed.jpg'
    )
  ),
  papaya: commons(
    '0/09/Papaya_-_longitudinal_section.jpg',
    'A papaya cut in half',
    [1920, 1280],
    by(
      'Papaya - longitudinal section',
      'Ivar Leidus',
      'CC BY-SA 4.0',
      'Papaya_-_longitudinal_section.jpg'
    )
  ),
  mango: commons(
    'a/af/Mango_fruit_Nam_Dok_Mai.jpg',
    'A ripe yellow mango',
    [1920, 1280],
    by(
      'Mango fruit Nam Dok Mai',
      'Ivar Leidus',
      'CC BY-SA 4.0',
      'Mango_fruit_Nam_Dok_Mai.jpg'
    )
  ),
  eggs: commons(
    '9/91/Chicken_eggs_in_tray.jpg',
    'Brown eggs in a tray',
    [1920, 1425],
    by(
      'Chicken eggs in tray',
      'Maksym Kozlenko',
      'CC BY-SA 4.0',
      'Chicken_eggs_in_tray.jpg'
    )
  ),
  ginger: {
    src: 'https://pd.w.org/2025/11/760692582ab6cad03.98905926-768x576.jpeg',
    alt: 'A pile of fresh ginger',
    width: 768,
    height: 576,
    credit: {
      title: 'Fresh ginger roots piled together',
      creator: 'Bigul Malayi',
      licence: 'CC0',
      page: 'https://wordpress.org/photos/',
    },
  },
  chilli: commons(
    '9/9a/Bird%27s_eye_chili.jpg',
    'A heap of cili padi',
    [1920, 1440],
    by("Bird's eye chili", 'Jiafei Slay Queen', 'CC0', "Bird's_eye_chili.jpg")
  ),
  lime: commons(
    'e/e7/Lime_-_whole_and_halved.jpg',
    'A lime, whole and halved',
    [1920, 1280],
    by(
      'Lime - whole and halved',
      'Ivar Leidus',
      'CC BY-SA 4.0',
      'Lime_-_whole_and_halved.jpg'
    )
  ),
  pineapple: commons(
    '5/51/Pineapple_%27Victoria%27_with_slice.jpg',
    'A pineapple with a slice cut',
    [1280, 1636],
    by(
      "Pineapple 'Victoria' with slice",
      'Ivar Leidus',
      'CC BY-SA 4.0',
      "Pineapple_'Victoria'_with_slice.jpg"
    )
  ),
  banana: commons(
    '8/8a/Banana-Single.jpg',
    'A ripe banana',
    [1280, 1132],
    by('Banana-Single', 'Evan-Amos', 'CC BY-SA 3.0', 'Banana-Single.jpg')
  ),
  cherrytomatoes: commons(
    '3/39/Cherry-Tomatoes-in-Pack.jpg',
    'Cherry tomatoes in a punnet',
    [1280, 1101],
    by(
      'Cherry-Tomatoes-in-Pack',
      'Evan-Amos',
      'CC0',
      'Cherry-Tomatoes-in-Pack.jpg'
    )
  ),
  tea: commons(
    'f/f4/Cameron_Highlands_Tea_Plantation_2012.JPG',
    'Tea terraces on the hills of Cameron Highlands',
    [1920, 1073],
    by(
      'Cameron Highlands Tea Plantation 2012',
      'Bjørn Christian Tørrissen',
      'CC BY-SA 3.0',
      'Cameron_Highlands_Tea_Plantation_2012.JPG'
    )
  ),
  keafarm: commons(
    'f/f7/Kea_Farm_produce_2.jpg',
    'Crates of vegetables at the Kea Farm market',
    [1920, 2215],
    by('Kea Farm produce 2', 'AyyanD', 'CC BY-SA 4.0', 'Kea_Farm_produce_2.jpg')
  ),
  kampungraja: commons(
    '0/05/Kampung_Raja_5.jpg',
    'Vegetable plots and greenhouses at Kampung Raja',
    [1920, 1440],
    by('Kampung Raja 5', 'Slleong', 'CC0', 'Kampung_Raja_5.jpg')
  ),
  strawfarm: commons(
    '9/96/Strawberry_farm%2C_Kampung_Taman_Sedia.jpg',
    'Strawberry beds under shelter at Kampung Taman Sedia',
    [1920, 2006],
    by(
      'Strawberry farm, Kampung Taman Sedia',
      'AyyanD',
      'CC BY-SA 4.0',
      'Strawberry_farm,_Kampung_Taman_Sedia.jpg'
    )
  ),
} satisfies Record<string, Picture>;

/** Cut-outs made from these photos for the product cards; credited with them. */
export const CUT_SOURCES: Credit[] = [
  by(
    'White-&-Brown-Eggs',
    'Evan-Amos',
    'Public domain',
    'White-&-Brown-Eggs.jpg'
  ),
];

export type PictureId = keyof typeof PICTURES;

const CUT = '/templates/petik/cut';

export interface Product {
  id: string;
  name: string;
  /** What one unit is, as it is printed on the price. */
  unit: string;
  price: number;
  /** The price before a promotion, when there is one. */
  was?: number;
  farm: string;
  picture: PictureId;
  /** A cut-out on a transparent background, for product cards. */
  cut?: string;
  featured?: boolean;
}

export interface Group {
  id: string;
  name: string;
  products: Product[];
}

export const HARVEST: Group[] = [
  {
    id: 'fruit',
    name: 'Fruit',
    products: [
      {
        id: 'strawberries',
        name: 'Strawberries',
        unit: '250 g',
        price: 13,
        farm: 'Tanah Rata, Cameron Highlands',
        picture: 'strawberries',
        cut: `${CUT}/strawberries.webp`,
        featured: true,
      },
      {
        id: 'mangosteen',
        name: 'Mangosteen',
        unit: 'kg',
        price: 15,
        farm: 'Raub, Pahang',
        picture: 'mangosteen',
        cut: `${CUT}/mangosteen.webp`,
        featured: true,
      },
      {
        id: 'rambutan',
        name: 'Rambutan',
        unit: 'kg',
        price: 9,
        was: 11,
        farm: 'Kuala Kangsar, Perak',
        picture: 'rambutan',
        cut: `${CUT}/rambutan.webp`,
        featured: true,
      },
      {
        id: 'pineapple',
        name: 'Josapine pineapple',
        unit: 'each',
        price: 6,
        farm: 'Pontian, Johor',
        picture: 'pineapple',
        cut: `${CUT}/pineapple.webp`,
        featured: true,
      },
      {
        id: 'papaya',
        name: 'Papaya Eksotika',
        unit: 'each',
        price: 7,
        farm: 'Kluang, Johor',
        picture: 'papaya',
        cut: `${CUT}/papaya.webp`,
      },
      {
        id: 'mango',
        name: 'Chokanan mango',
        unit: 'kg',
        price: 16,
        farm: 'Kangar, Perlis',
        picture: 'mango',
        cut: `${CUT}/mango.webp`,
        featured: true,
      },
      {
        id: 'banana',
        name: 'Pisang berangan',
        unit: 'comb',
        price: 7,
        farm: 'Muar, Johor',
        picture: 'banana',
        cut: `${CUT}/banana.webp`,
      },
      {
        id: 'lime',
        name: 'Limau nipis',
        unit: '250 g',
        price: 3.5,
        farm: 'Muar, Johor',
        picture: 'lime',
        cut: `${CUT}/lime.webp`,
      },
    ],
  },
  {
    id: 'vegetables',
    name: 'Vegetables',
    products: [
      {
        id: 'cherrytomatoes',
        name: 'Cherry tomatoes',
        unit: '250 g',
        price: 6,
        farm: 'Kea Farm, Brinchang',
        picture: 'cherrytomatoes',
        cut: `${CUT}/cherrytomatoes.webp`,
        featured: true,
      },
      {
        id: 'capsicum',
        name: 'Red capsicum',
        unit: '2 pcs',
        price: 7.5,
        was: 9,
        farm: 'Kea Farm, Brinchang',
        picture: 'capsicum',
        cut: `${CUT}/capsicum.webp`,
        featured: true,
      },
      {
        id: 'pakchoy',
        name: 'Pak choy',
        unit: '500 g',
        price: 4.5,
        farm: 'Kampung Raja, Cameron Highlands',
        picture: 'pakchoy',
        cut: `${CUT}/pakchoy.webp`,
        featured: true,
      },
      {
        id: 'carrots',
        name: 'Carrots',
        unit: '500 g',
        price: 4,
        farm: 'Kampung Raja, Cameron Highlands',
        picture: 'carrots',
        cut: `${CUT}/carrots.webp`,
      },
      {
        id: 'springonion',
        name: 'Spring onions',
        unit: 'bunch',
        price: 2.5,
        farm: 'Bertam Valley, Cameron Highlands',
        picture: 'springonion',
        cut: `${CUT}/springonion.webp`,
      },
      {
        id: 'kangkung',
        name: 'Kangkung',
        unit: 'bunch',
        price: 3,
        farm: 'Kluang, Johor',
        picture: 'kangkung',
      },
      {
        id: 'lettuce',
        name: 'Green coral lettuce',
        unit: 'head',
        price: 5,
        farm: 'Bertam Valley, Cameron Highlands',
        picture: 'lettuce',
      },
      {
        id: 'corn',
        name: 'Sweet corn',
        unit: '3 cobs',
        price: 5,
        farm: 'Sabak Bernam, Selangor',
        picture: 'corn',
      },
    ],
  },
  {
    id: 'kitchen',
    name: 'Eggs & kitchen',
    products: [
      {
        id: 'eggs',
        name: 'Kampung eggs',
        unit: 'tray of 30',
        price: 27,
        farm: 'Tanjung Karang, Selangor',
        picture: 'eggs',
        cut: `${CUT}/eggs.webp`,
        featured: true,
      },
      {
        id: 'ginger',
        name: 'Bentong ginger',
        unit: '500 g',
        price: 9,
        farm: 'Bentong, Pahang',
        picture: 'ginger',
      },
      {
        id: 'chilli',
        name: 'Cili padi',
        unit: '100 g',
        price: 3,
        farm: 'Kuala Selangor, Selangor',
        picture: 'chilli',
      },
    ],
  },
];

export const PRODUCTS = HARVEST.flatMap((group) => group.products);
export const productById = (id: string) =>
  PRODUCTS.find((product) => product.id === id);

export interface Slot {
  id: string;
  label: string;
  /** When the box leaves the packing room, and when the slot starts. */
  out: string;
  start: number;
}

export const SLOTS: Slot[] = [
  { id: 'morning', label: '8–11 am', out: '7:30 am', start: 8 },
  { id: 'midday', label: '12–3 pm', out: '11:30 am', start: 12 },
  { id: 'evening', label: '5–8 pm', out: '4:30 pm', start: 17 },
];

/** Picked at two in the afternoon the day before delivery. */
export const PICKED_AT = 14;

export const AREAS = [
  'Kuala Lumpur',
  'Petaling Jaya',
  'Subang Jaya',
  'Shah Alam',
  'Puchong',
  'Cheras',
  'Ampang',
  'Damansara',
];

export const QUESTIONS = [
  {
    q: 'What if something runs out?',
    a: 'We message you before your box leaves and swap it only if you say yes. Otherwise that item is refunded.',
  },
  {
    q: 'How are weighed items charged?',
    a: 'Greens and fruit are packed within 50 g of what you order and charged at the sheet price, rounded in your favour.',
  },
  {
    q: 'Is there a minimum order?',
    a: `RM${MIN_ORDER}. Delivery is RM${DELIVERY_FEE}, and free above RM${FREE_DELIVERY_AT}.`,
  },
  {
    q: 'Where do you deliver?',
    a: `${AREAS.slice(0, -1).join(', ')} and ${AREAS.at(-1)}. Send us your postcode if you are not sure.`,
  },
  {
    q: 'How do I pay?',
    a: 'We send the final total on WhatsApp after packing. Pay by DuitNow QR or bank transfer, or in cash at the door.',
  },
  {
    q: 'When do orders close?',
    a: 'At 10 pm for the next day. Orders after 10 pm go out the day after.',
  },
  {
    q: 'Which days do you deliver?',
    a: 'Tuesday to Sunday. The growers do not pick on Sunday, so there is no Monday box.',
  },
  {
    q: 'What if something is not fresh?',
    a: 'Send a photo on WhatsApp the same day and we refund it. No forms.',
  },
  {
    q: 'Do you take the crates back?',
    a: 'Yes. Leave them by the door on your next delivery day and the driver collects them.',
  },
  {
    q: 'Can I change my order?',
    a: 'Until 10 pm. Reply to your order message with the change.',
  },
  {
    q: 'Do I need to be home?',
    a: 'No. Tell us where to leave the box. Greens keep for about two hours in the shade.',
  },
];

export const rm = (amount: number) =>
  `RM${amount.toLocaleString('en-MY', { minimumFractionDigits: amount % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;

export const FEATURES = [
  {
    title: 'Picked yesterday',
    text: 'Growers cut what is ready the afternoon before your delivery, never earlier.',
  },
  {
    title: 'Three delivery slots',
    text: 'Morning, midday or evening, Tuesday to Sunday, across the Klang Valley.',
  },
  {
    title: 'Pay on WhatsApp',
    text: 'We send the final total after packing. DuitNow, bank transfer or cash.',
  },
  {
    title: 'Fresh or refunded',
    text: 'Send a photo the same day if anything is not right and we refund it.',
  },
];

export const REASONS = [
  'Every item named with the farm it came from, so you know where it grew.',
  'Weighed items packed within 50 g of what you order, rounded in your favour.',
  'Crates collected on your next delivery, and paper bags instead of plastic.',
];

/** Sample reviews for the demo; replace with the shop's own. */
export const REVIEWS = [
  {
    text: 'The strawberries still smell like Cameron when the box arrives. My kids finish the punnet before lunch.',
    name: 'Nurul Huda',
    place: 'Shah Alam',
  },
  {
    text: 'I order the kangkung and eggs every Friday evening. Always crisp, and the driver texts before he arrives.',
    name: 'Kelvin Tan',
    place: 'Petaling Jaya',
  },
  {
    text: 'They messaged me when the mangosteen ran out and swapped it for rambutan only after I said yes.',
    name: 'Priya Raman',
    place: 'Cheras',
  },
];

/** Sample articles for the demo. */
export const TIPS = [
  {
    picture: 'kangkung' as PictureId,
    date: '18 October 2026',
    read: '2 min read',
    title: 'Keep kangkung crisp for three days',
    excerpt: 'Wrap the stems in a damp paper towel, not the leaves.',
    body: 'Trim the ends, wrap only the stems in a damp paper towel and keep the bunch in a paper bag in the vegetable drawer. Wash it just before cooking, never before storing.',
  },
  {
    picture: 'chilli' as PictureId,
    date: '11 October 2026',
    read: '3 min read',
    title: 'A quick sambal with cili padi',
    excerpt: 'Ten cili padi, two shallots, lime and a pinch of salt.',
    body: 'Pound ten cili padi with two shallots and a pinch of salt, then squeeze in half a limau nipis. It keeps for three days in a closed jar in the fridge.',
  },
  {
    picture: 'mangosteen' as PictureId,
    date: '4 October 2026',
    read: '2 min read',
    title: 'How to pick a ripe mangosteen',
    excerpt: 'Press gently: it should give a little, like a ripe avocado.',
    body: 'Choose dark purple fruit with a fresh green crown. A ripe mangosteen gives slightly when pressed; a rock-hard shell means the flesh inside has dried out.',
  },
];
