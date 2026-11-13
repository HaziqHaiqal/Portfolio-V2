import { ITEMS, type Item } from './data';

export type Pt = [number, number];
export type Dim =
  | { kind: 'h'; at: number; p1: Pt; p2: Pt }
  | { kind: 'v'; at: number; p1: Pt; p2: Pt }
  | { kind: 'o'; off: Pt; p1: Pt; p2: Pt };

interface Drawing {
  dims: Dim[];
  dots: Pt[];
}

interface Spec {
  fabric: string;
  fit: string;
  notes: string[];
  base: number[];
  draw: Drawing;
}

const h = (at: number, x1: number, x2: number, y1 = at, y2 = at): Dim => ({
  kind: 'h',
  at,
  p1: [x1, y1],
  p2: [x2, y2],
});
const v = (at: number, p1: Pt, p2: Pt): Dim => ({ kind: 'v', at, p1, p2 });
const o = (p1: Pt, p2: Pt, off: Pt): Dim => ({ kind: 'o', off, p1, p2 });

const TEE: Drawing = {
  dims: [
    h(442, 162, 530),
    v(18, [283, 150], [167, 783]),
    o([542, 213], [638, 397], [20, -10]),
  ],
  dots: [
    [392, 167],
    [150, 262],
    [342, 758],
  ],
};

const SPECS: Record<string, Spec> = {
  'tee-boxy-black': {
    fabric: '240 gsm cotton jersey',
    fit: 'Boxy',
    notes: ['Ribbed crew collar', 'Dropped shoulder', 'Double-stitched hem'],
    base: [57, 70, 22],
    draw: TEE,
  },
  'tee-boxy-white': {
    fabric: '240 gsm cotton jersey',
    fit: 'Boxy',
    notes: ['Ribbed crew collar', 'Dropped shoulder', 'Double-stitched hem'],
    base: [57, 70, 22],
    draw: TEE,
  },
  'hoodie-grey': {
    fabric: '340 gsm fleece',
    fit: 'Relaxed',
    notes: ['Double-layer hood', 'Flat cotton drawcord', 'Kangaroo pocket', 'Ribbed cuffs'],
    base: [61, 72, 64],
    draw: {
      dims: [
        h(440, 161, 521),
        v(28, [203, 160], [150, 762]),
        o([520, 170], [618, 790], [22, -3]),
      ],
      dots: [
        [411, 99],
        [331, 378],
        [331, 582],
        [101, 772],
      ],
    },
  },
  'knit-oat': {
    fabric: 'Cotton knit, 7 gauge',
    fit: 'Regular',
    notes: ['Ribbed crew collar', 'Ribbed cuffs', 'Ribbed hem'],
    base: [56, 66, 62],
    draw: {
      dims: [
        h(417, 144, 514),
        v(6, [275, 133], [150, 750]),
        o([550, 192], [625, 758], [22, -3]),
      ],
      dots: [
        [333, 142],
        [600, 733],
        [333, 733],
      ],
    },
  },
  'overshirt-olive': {
    fabric: '8 wale cotton corduroy',
    fit: 'Regular',
    notes: ['Point collar', 'Patch chest pocket', 'Button cuffs'],
    base: [59, 76, 64],
    draw: {
      dims: [
        h(430, 163, 525),
        v(18, [283, 130], [150, 792]),
        o([575, 183], [642, 783], [22, -3]),
      ],
      dots: [
        [358, 158],
        [442, 383],
        [100, 742],
      ],
    },
  },
  'chore-indigo': {
    fabric: '12 oz rigid denim',
    fit: 'Boxy',
    notes: ['Point collar', 'Patch chest pocket', 'Two hip pockets'],
    base: [60, 72, 63],
    draw: {
      dims: [
        h(400, 150, 540),
        v(22, [262, 140], [155, 775]),
        o([530, 185], [640, 765], [22, -4]),
      ],
      dots: [
        [342, 133],
        [475, 375],
        [217, 625],
      ],
    },
  },
  'puffer-navy': {
    fabric: 'Recycled nylon, light fill',
    fit: 'Cropped',
    notes: ['High stand collar', 'Two-way zip', 'Elastic cuffs'],
    base: [63, 60, 64],
    draw: {
      dims: [
        h(400, 141, 546),
        v(8, [250, 108], [142, 608]),
        o([550, 175], [650, 763], [20, -3]),
      ],
      dots: [
        [383, 117],
        [333, 520],
        [608, 733],
      ],
    },
  },
  'jeans-wide-light': {
    fabric: '13 oz cotton denim',
    fit: 'Straight',
    notes: ['Coin pocket', 'Worn-in fading', 'Clean hem'],
    base: [0, 104, 78],
    draw: {
      dims: [
        h(150, 207, 447),
        v(133, [205, 140], [165, 845]),
        o([342, 400], [290, 845], [14, 0]),
      ],
      dots: [
        [415, 190],
        [245, 500],
        [233, 822],
      ],
    },
  },
  'jeans-straight-black': {
    fabric: '13 oz cotton denim',
    fit: 'Straight',
    notes: ['Coin pocket', 'Worn-in fading', 'Clean hem'],
    base: [0, 104, 78],
    draw: {
      dims: [
        h(140, 167, 475),
        v(137, [167, 117], [167, 842]),
        o([317, 425], [292, 842], [14, 0]),
      ],
      dots: [
        [425, 200],
        [233, 500],
        [233, 822],
      ],
    },
  },
  'trousers-stone': {
    fabric: 'Light poly-viscose twill',
    fit: 'Wide',
    notes: ['Single front pleat', 'Pressed crease', 'Clean hem'],
    base: [0, 103, 76],
    draw: {
      dims: [
        h(142, 192, 483),
        v(128, [192, 117], [158, 842]),
        o([350, 442], [333, 842], [14, 0]),
      ],
      dots: [
        [275, 250],
        [250, 633],
        [250, 822],
      ],
    },
  },
  'cargo-khaki': {
    fabric: 'Cotton ripstop',
    fit: 'Relaxed',
    notes: ['Bellow cargo pocket', 'Slant hand pocket', 'Adjustable hem'],
    base: [0, 100, 74],
    draw: {
      dims: [
        h(142, 200, 467),
        v(128, [200, 117], [158, 842]),
        o([342, 450], [325, 842], [14, 0]),
      ],
      dots: [
        [208, 417],
        [442, 190],
        [250, 822],
      ],
    },
  },
  'shorts-black': {
    fabric: 'Quick-dry nylon',
    fit: 'Regular',
    notes: ['Elastic waist', 'Side pocket', 'Short 7 inch leg'],
    base: [0, 47, 18],
    draw: {
      dims: [
        h(167, 192, 475),
        v(83, [192, 108], [113, 517]),
        o([333, 492], [317, 525], [14, 0]),
      ],
      dots: [
        [417, 128],
        [183, 250],
        [470, 505],
      ],
    },
  },
  'shoe-court-white': {
    fabric: 'Smooth leather',
    fit: 'True to size',
    notes: ['Waxed laces', 'Padded collar', 'Stitched cupsole'],
    base: [0, 9],
    draw: {
      dims: [h(468, 40, 766, 420, 372), v(12, [70, 190], [40, 436])],
      dots: [
        [480, 230],
        [170, 215],
        [400, 385],
      ],
    },
  },
  'shoe-court-black': {
    fabric: 'Smooth leather',
    fit: 'True to size',
    notes: ['Waxed laces', 'Padded collar', 'Stitched cupsole'],
    base: [0, 9],
    draw: {
      dims: [h(468, 40, 766, 420, 372), v(12, [70, 190], [40, 436])],
      dots: [
        [480, 230],
        [170, 215],
        [400, 385],
      ],
    },
  },
  'shoe-runner-grey': {
    fabric: 'Suede and mesh',
    fit: 'True to size',
    notes: ['Round laces', 'Breathable mesh', 'Chunky foam sole'],
    base: [0, 10],
    draw: {
      dims: [h(462, 36, 780, 415, 380), v(10, [150, 155], [36, 430])],
      dots: [
        [420, 190],
        [560, 280],
        [240, 380],
      ],
    },
  },
  'shoe-hi-navy': {
    fabric: 'Cotton canvas',
    fit: 'Roomy',
    notes: ['Flat cotton laces', 'Rubber toe cap', 'Vulcanised sole'],
    base: [0, 15],
    draw: {
      dims: [h(458, 40, 764, 410, 380), v(12, [80, 75], [40, 430])],
      dots: [
        [400, 220],
        [690, 340],
        [300, 384],
      ],
    },
  },
  'shoe-skate-brown': {
    fabric: 'Padded suede',
    fit: 'True to size',
    notes: ['Padded collar', 'Wide tongue', 'Gum sole'],
    base: [0, 9],
    draw: {
      dims: [h(464, 36, 764, 420, 380), v(10, [120, 174], [36, 436])],
      dots: [
        [160, 195],
        [330, 140],
        [400, 400],
      ],
    },
  },
  'shoe-trail-olive': {
    fabric: 'Ripstop upper, lugged sole',
    fit: 'True to size',
    notes: ['Heel pull tab', 'Ripstop upper', 'Lugged sole'],
    base: [0, 10],
    draw: {
      dims: [h(470, 56, 776, 425, 390), v(28, [85, 140], [56, 444])],
      dots: [
        [85, 165],
        [460, 300],
        [400, 415],
      ],
    },
  },
};

const WAIST_FLAT = [35.5, 38, 40.5, 43, 45.5];
const INSOLE = [24.6, 25.3, 26, 26.7, 27.3, 28, 28.6];

export const specOf = (item: Item) => SPECS[item.id];

export const middleSize = (item: Item) =>
  item.sizes[Math.floor(item.sizes.length / 2)];

export interface Measure {
  key: string;
  name: string;
  short: string;
  cm: number;
}

export const measuresOf = (item: Item, size: string): Measure[] => {
  const spec = SPECS[item.id];
  const i = item.sizes.indexOf(size);
  const d = i - Math.floor(item.sizes.length / 2);
  if (item.kind === 'shoes')
    return [
      { key: 'A', name: 'Insole length', short: 'Insole', cm: INSOLE[i] },
      { key: 'B', name: 'Heel to collar', short: 'Height', cm: spec.base[1] },
    ];
  if (item.category === 'Bottoms')
    return [
      { key: 'A', name: 'Waist, laid flat', short: 'Waist', cm: WAIST_FLAT[i] },
      { key: 'B', name: 'Length, outseam', short: 'Length', cm: spec.base[1] + d },
      { key: 'C', name: 'Inseam', short: 'Inseam', cm: spec.base[2] },
    ];
  const sleeveStep = spec.base[2] < 30 ? 0.5 : 1;
  return [
    { key: 'A', name: 'Chest, pit to pit', short: 'Chest', cm: spec.base[0] + 2.5 * d },
    { key: 'B', name: 'Length, from shoulder', short: 'Length', cm: spec.base[1] + 2 * d },
    { key: 'C', name: 'Sleeve', short: 'Sleeve', cm: spec.base[2] + sleeveStep * d },
  ];
};

export const fmtCm = (cm: number) =>
  Number.isInteger(cm) ? String(cm) : cm.toFixed(1);

export const fitLine = (item: Item, size: string) => {
  const [a, b] = measuresOf(item, size);
  if (item.kind === 'shoes') return `Insole ${fmtCm(a.cm)} cm`;
  return `Laid flat: ${a.short.toLowerCase()} ${fmtCm(a.cm)}, ${b.short.toLowerCase()} ${fmtCm(b.cm)} cm`;
};

export const styleOf = (item: Item) =>
  `GY-${String(ITEMS.findIndex((x) => x.id === item.id) + 1).padStart(2, '0')}`;

export const careOf = (item: Item) => {
  if (item.kind === 'shoes')
    return 'Wipe clean with a damp cloth. Dry away from direct sun.';
  if (item.id === 'puffer-navy')
    return 'Wash cold on a gentle cycle. Tumble dry low to lift the fill.';
  if (item.id === 'knit-oat')
    return 'Hand wash cold. Dry flat so it keeps its shape.';
  return 'Wash cold, inside out. Hang to dry. Iron on the reverse.';
};

export type Seg = [number, number, number, number];

export const linesOf = (d: Dim, t: number) => {
  const [x1, y1] = d.p1;
  const [x2, y2] = d.p2;
  if (d.kind === 'h') {
    const y = d.at;
    const ext: Seg[] = [
      [x1, y1, x1, y],
      [x2, y2, x2, y],
    ];
    return {
      main: [x1, y, x2, y] as Seg,
      ticks: [
        [x1, y - t, x1, y + t],
        [x2, y - t, x2, y + t],
      ] as Seg[],
      ext: ext.filter((e) => e[1] !== e[3]),
      mid: [(x1 + x2) / 2, y] as Pt,
    };
  }
  if (d.kind === 'v') {
    const x = d.at;
    const ext: Seg[] = [
      [x1, y1, x, y1],
      [x2, y2, x, y2],
    ];
    return {
      main: [x, y1, x, y2] as Seg,
      ticks: [
        [x - t, y1, x + t, y1],
        [x - t, y2, x + t, y2],
      ] as Seg[],
      ext: ext.filter((e) => e[0] !== e[2]),
      mid: [x, (y1 + y2) / 2] as Pt,
    };
  }
  const [ox, oy] = d.off;
  const ax = x1 + ox;
  const ay = y1 + oy;
  const bx = x2 + ox;
  const by = y2 + oy;
  const len = Math.hypot(bx - ax, by - ay);
  const nx = (-(by - ay) / len) * t;
  const ny = ((bx - ax) / len) * t;
  return {
    main: [ax, ay, bx, by] as Seg,
    ticks: [
      [ax - nx, ay - ny, ax + nx, ay + ny],
      [bx - nx, by - ny, bx + nx, by + ny],
    ] as Seg[],
    ext: [
      [x1, y1, ax, ay],
      [x2, y2, bx, by],
    ] as Seg[],
    mid: [(ax + bx) / 2, (ay + by) / 2] as Pt,
  };
};
