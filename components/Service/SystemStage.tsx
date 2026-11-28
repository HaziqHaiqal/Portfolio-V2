import type { CSSProperties } from 'react';
import { Check } from 'lucide-react';

const INK = '#111827';
const G1 = '#f3f4f6';
const G2 = '#e5e7eb';
const G3 = '#d1d5db';
const G4 = '#9ca3af';
const GREEN = '#16a34a';
const MINT = '#dcfce7';

/** One mark on a mini screen, in units of the stage's font size. */
type Shape = {
  x: number;
  y: number;
  w: number;
  h: number;
  c: string;
  r?: number;
  style?: CSSProperties;
  text?: string;
  size?: number;
};

const box = (
  x: number,
  y: number,
  w: number,
  h: number,
  c: string,
  r = 1.5,
  style?: CSSProperties
): Shape => ({ x, y, w, h, c, r, style });
const dot = (x: number, y: number, d: number, c: string) =>
  box(x, y, d, d, c, d / 2);
const label = (
  x: number,
  y: number,
  text: string,
  size: number,
  c: string,
  style?: CSSProperties
): Shape => ({ x, y, w: 0, h: 0, c, text, size, style });
const times = (n: number, draw: (k: number) => Shape | Shape[]) =>
  Array.from({ length: n }, (_, k) => draw(k)).flat();

// Each system drawn as a 160 x 90 browser screen.
const SCREENS: Record<string, () => Shape[]> = {
  'online-store': () => [
    box(8, 7, 22, 4, INK),
    box(136, 5, 11, 8, INK, 2),
    dot(144, 3, 6, GREEN),
    ...[8, 57, 106].flatMap((x, k) => [
      box(x, 18, 46, 42, G1, 4),
      dot(x + 13, 29, 20, ['#4ade80', '#60a5fa', '#facc15'][k]),
      box(x, 65, 28, 3.5, G3),
      box(x, 72, 15, 3.5, GREEN),
      dot(x + 38, 66, 8, INK),
    ]),
  ],
  'booking-system': () => [
    box(8, 7, 30, 4, INK),
    box(122, 5, 30, 7, G1, 3.5),
    ...times(7, (k) => box(8 + k * 21, 18, 10, 3, G3)),
    ...times(4, (row) =>
      times(7, (k) => {
        const booked =
          (row === 1 && k === 2) ||
          (row === 2 && k === 4) ||
          (row === 0 && k === 5);
        const free = (row + k) % 3 === 0;
        return box(
          8 + k * 21,
          25 + row * 15,
          18,
          12,
          booked ? GREEN : free ? MINT : G1,
          2.5
        );
      })
    ),
  ],
  'qr-ordering': () => [
    box(8, 7, 26, 4, INK),
    box(138, 4, 14, 14, INK),
    box(140, 6, 4, 4, '#fff', 0.5),
    box(146, 6, 4, 4, '#fff', 0.5),
    box(140, 12, 4, 4, '#fff', 0.5),
    box(8, 16, 18, 6, GREEN, 3),
    box(29, 16, 18, 6, G1, 3),
    box(50, 16, 18, 6, G1, 3),
    ...[27, 47, 67].flatMap((y, k) => [
      dot(8, y, 14, ['#fde68a', '#fca5a5', '#bbf7d0'][k]),
      box(28, y + 2, 52, 3.5, INK),
      box(28, y + 8, 36, 3, G3),
      box(112, y + 4, 16, 3.5, INK),
      dot(139, y + 1.5, 11, GREEN),
    ]),
  ],
  inventory: () => [
    box(8, 7, 28, 4, INK),
    box(108, 5, 44, 7, G1, 3.5),
    ...times(5, (row) => {
      const y = 21 + row * 13.5;
      const low = row === 3;
      return [
        box(8, y, 36, 3.5, G4),
        box(56, y, 62, 4.5, G1, 2.25),
        box(
          56,
          y,
          [44, 30, 52, 6, 38][row],
          4.5,
          low ? '#f87171' : '#4ade80',
          2.25
        ),
        box(130, y, 20, 3.5, INK),
      ];
    }),
    box(8, 82, 144, 0.5, G2, 0),
  ],
  invoicing: () => [
    box(0, 0, 160, 90, G1, 0),
    box(34, 5, 92, 82, '#fff', 2, { boxShadow: '0 .6em 2em rgba(0,0,0,.12)' }),
    box(42, 12, 18, 5, GREEN),
    box(98, 12, 20, 4, INK),
    ...[28, 37, 46].flatMap((y) => [
      box(42, y, 42, 3.5, G3),
      box(102, y, 16, 3.5, G4),
    ]),
    box(42, 56, 76, 0.6, G2, 0),
    box(42, 62, 24, 4, INK),
    box(98, 62, 20, 4, INK),
    label(88, 70, 'PAID', 6, GREEN, {
      border: `0.14em solid ${GREEN}`,
      borderRadius: '0.3em',
      padding: '0.12em 0.35em',
      transform: 'rotate(-10deg)',
    }),
  ],
  crm: () =>
    [8, 58, 108].flatMap((x, column) => [
      box(x, 6, 44, 80, G1, 3),
      box(x + 4, 10, 18, 3.5, G4),
      ...times(column === 2 ? 2 : 3, (k) => {
        const y = 18 + k * 21;
        return [
          box(x + 4, y, 36, 17, '#fff', 2, {
            boxShadow: '0 .3em .8em rgba(0,0,0,.08)',
          }),
          box(x + 8, y + 4, 22, 3, INK),
          box(x + 8, y + 10, 14, 3, G3),
          dot(
            x + 30,
            y + 8.5,
            6,
            column === 2 ? GREEN : ['#60a5fa', '#facc15', '#a78bfa'][k]
          ),
        ];
      }),
    ]),
  tuition: () => [
    ...times(5, (k) => box(26 + k * 26, 6, 14, 3.5, G4)),
    ...times(4, (row) => box(8, 16 + row * 18, 12, 3, G3)),
    ...(
      [
        [0, 0, 2, '#bfdbfe'],
        [1, 1, 1, '#bbf7d0'],
        [2, 0, 1, '#fef08a'],
        [3, 2, 2, '#ddd6fe'],
        [4, 1, 2, '#bfdbfe'],
        [0, 3, 1, '#bbf7d0'],
        [2, 2, 2, '#fecaca'],
        [1, 3, 1, '#fef08a'],
      ] as const
    ).flatMap(([day, row, length, color]) => [
      box(24 + day * 26, 14 + row * 18, 23, length * 18 - 3, color, 2.5),
      box(27 + day * 26, 17 + row * 18, 12, 2.5, 'rgba(17,24,39,.45)'),
    ]),
  ],
  membership: () => [
    box(0, 0, 160, 90, G1, 0),
    box(28, 11, 104, 64, INK, 7, { boxShadow: '0 1em 2.4em rgba(0,0,0,.25)' }),
    box(28, 60, 104, 15, GREEN, 0, { borderRadius: '0 0 7em 7em' }),
    box(37, 20, 30, 4, '#fff'),
    box(37, 28, 22, 3, '#6b7280'),
    label(37, 37, '1,240', 8, '#4ade80'),
    box(37, 49, 16, 3, '#6b7280'),
    box(104, 19, 20, 20, '#fff', 2),
    box(107, 22, 6, 6, INK, 0.5),
    box(115, 22, 6, 6, INK, 0.5),
    box(107, 30, 6, 6, INK, 0.5),
    box(115, 32, 4, 4, INK, 0.5),
    box(37, 65, 30, 3.5, 'rgba(255,255,255,.85)'),
  ],
  rentals: () => [
    box(8, 8, 58, 74, G1, 4),
    box(18, 46, 38, 14, '#60a5fa', 4),
    box(24, 36, 24, 13, '#93c5fd', 5),
    dot(21, 56, 9, INK),
    dot(44, 56, 9, INK),
    box(76, 8, 40, 4, INK),
    box(76, 15, 26, 3, G3),
    ...times(7, (k) =>
      box(
        76 + k * 11,
        26,
        9,
        9,
        k === 3 ? MINT : k >= 2 && k <= 4 ? GREEN : G1,
        2
      )
    ),
    ...times(7, (k) => box(76 + k * 11, 38, 9, 9, G1, 2)),
    box(76, 54, 30, 3.5, G3),
    box(76, 61, 22, 4, INK),
    box(76, 71, 76, 10, GREEN, 5),
  ],
};

const GENERIC = () => [
  box(8, 7, 28, 4, INK),
  ...times(3, (k) => box(8 + k * 49, 18, 45, 22, k === 0 ? MINT : G1, 3)),
  box(8, 46, 144, 36, G1, 3),
];

// The phone version, on a 44 x 86 screen.
const phoneShapes = (id: string) => {
  const card = id === 'membership';
  return [
    box(5, 6, 16, 3, INK),
    dot(34, 4.5, 6, G2),
    box(5, 14, 34, 22, card ? INK : MINT, 3),
    box(9, 19, 14, 3, card ? '#fff' : GREEN),
    box(9, 26, 22, 4, card ? '#4ade80' : INK),
    ...[42, 52, 62].flatMap((y) => [
      dot(5, y, 7, G2),
      box(15, y + 1, 20, 2.5, G3),
      box(15, y + 4.5, 12, 2, G2),
    ]),
    box(0, 76, 44, 0.4, G2, 0),
    ...[7, 17, 27, 37].map((x, k) => dot(x - 2, 79.5, 4, k === 0 ? GREEN : G3)),
  ];
};

function Screen({
  shapes,
  width,
  height,
}: {
  shapes: Shape[];
  width: number;
  height: number;
}) {
  return (
    <div
      className="relative overflow-hidden bg-white"
      style={{ width: `${width}em`, height: `${height}em` }}
    >
      {shapes.map((shape, index) =>
        shape.text ? (
          <i
            key={index}
            className="absolute not-italic"
            style={{ left: `${shape.x}em`, top: `${shape.y}em` }}
          >
            <span
              className="block font-extrabold leading-none"
              style={{
                fontSize: `${shape.size}em`,
                color: shape.c,
                ...shape.style,
              }}
            >
              {shape.text}
            </span>
          </i>
        ) : (
          <i
            key={index}
            className="absolute block"
            style={{
              left: `${shape.x}em`,
              top: `${shape.y}em`,
              width: `${shape.w}em`,
              height: `${shape.h}em`,
              background: shape.c,
              borderRadius: `${shape.r}em`,
              ...shape.style,
            }}
          />
        )
      )}
    </div>
  );
}

/** A picture of the chosen system that shows the phone app and features as they're added. */
export default function SystemStage({
  id,
  phone,
  features,
}: {
  id: string;
  phone: boolean;
  features: string[];
}) {
  const shown = features.slice(0, 3);
  const more = features.length - shown.length;

  return (
    <div style={{ containerType: 'inline-size' }}>
      <div
        aria-hidden="true"
        className="relative flex items-center justify-center overflow-hidden rounded-2xl bg-gray-100 ring-1 ring-gray-900/5 dark:bg-gray-900 dark:ring-white/10"
        style={{ fontSize: 'clamp(1.3px, 0.5cqi, 2.45px)', height: '130em' }}
      >
        <div
          className="relative"
          style={{ marginRight: '18em', marginBottom: '10em' }}
        >
          <div
            className="overflow-hidden bg-white shadow-sm ring-1 ring-black/5"
            style={{ width: '160em', borderRadius: '7em' }}
          >
            <div
              className="flex bg-gray-100"
              style={{ gap: '2em', padding: '3.6em 5em' }}
            >
              {[0, 1, 2].map((item) => (
                <span
                  key={item}
                  className="block rounded-full bg-gray-300"
                  style={{ width: '3em', height: '3em' }}
                />
              ))}
            </div>
            <Screen
              shapes={(SCREENS[id] ?? GENERIC)()}
              width={160}
              height={90}
            />
          </div>
          <div
            className={`absolute transition duration-300 ease-out motion-reduce:transition-none ${
              phone ? 'opacity-100' : 'translate-y-[8em] opacity-0'
            }`}
            style={{ right: '-24em', bottom: '-16em', fontSize: '0.82em' }}
          >
            <div
              className="bg-gray-950 shadow-xl ring-1 ring-white/10"
              style={{ padding: '2.2em', borderRadius: '8em', width: '48.4em' }}
            >
              <div className="overflow-hidden" style={{ borderRadius: '6em' }}>
                <Screen shapes={phoneShapes(id)} width={44} height={86} />
              </div>
            </div>
          </div>
        </div>

        {[...shown, ...(more > 0 ? [`${more} more`] : [])].map(
          (name, index) => (
            <span
              key={name}
              className="absolute z-10 inline-flex max-w-[80%] items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-gray-900 shadow-lg ring-1 ring-black/5 sm:px-3 sm:py-1.5 sm:text-xs"
              style={{ left: `${5 + index * 4}%`, top: `${8 + index * 15}%` }}
            >
              <Check
                size={12}
                strokeWidth={3}
                className="shrink-0 text-green-600"
              />
              <span className="truncate">{name}</span>
            </span>
          )
        )}
      </div>
    </div>
  );
}
