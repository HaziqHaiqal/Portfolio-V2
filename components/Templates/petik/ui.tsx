import Image from 'next/image';

export const CONTAINER = 'mx-auto w-full max-w-[1200px] px-4 sm:px-6';
export const DISPLAY = 'font-[family-name:var(--petik-display)]';
export const HEADING = `${DISPLAY} text-[clamp(2rem,4.2vw,3.45rem)] font-medium leading-[1.1] text-tpl-ink`;
export const SUB = 'text-[17px] font-semibold text-[#EF8829]';
export const TEXT = 'text-[14px] leading-[28px] text-tpl-muted';
export const BTN = `${DISPLAY} inline-flex h-14 items-center justify-center rounded-full bg-tpl-accent px-10 text-[14px] font-medium uppercase tracking-[1px] text-tpl-on-accent transition-[filter,transform] hover:brightness-95 active:scale-[0.97]`;
export const ORANGE = '#EF8829';

// Pixel sizes of the cut-outs, so small copies keep their shape.
const CUT_SIZES: Record<string, [number, number]> = {
  strawberries: [900, 524],
  mangosteen: [900, 458],
  rambutan: [900, 468],
  capsicum: [900, 886],
  lime: [900, 432],
  papaya: [900, 341],
  mango: [900, 416],
  carrots: [900, 459],
  springonion: [900, 592],
  pineapple: [572, 900],
  banana: [900, 787],
  cherrytomatoes: [900, 767],
  eggs: [561, 483],
  pakchoy: [900, 749],
};

/** A small cut-out above a section title, like the fruit icons on a market sign. */
export function SectionIcon({
  name,
  className = '',
}: {
  name: keyof typeof CUT_SIZES;
  className?: string;
}) {
  const [w, h] = CUT_SIZES[name];
  return (
    <Image
      src={`/templates/petik/cut/${name}.webp`}
      alt=""
      width={Math.round((56 * w) / h)}
      height={56}
      className={`h-14 w-auto object-contain ${className}`}
    />
  );
}

/** Hand-drawn speech bubble, as in a market chalk sign. */
export function Bubble({
  text,
  className = '',
}: {
  text: string;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 160 120"
      className={`pointer-events-none absolute w-32 text-tpl-ink/25 md:w-40 ${className}`}
    >
      <path
        d="M80 10c38 0 66 20 66 46s-28 46-66 46c-8 0-15-1-22-3l-24 14 6-21C25 84 14 71 14 56 14 30 42 10 80 10Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <text
        x="80"
        y="62"
        textAnchor="middle"
        transform="rotate(-14 80 60)"
        className="fill-current text-[17px] font-medium"
        style={{ fontFamily: 'var(--petik-display)' }}
      >
        {text}
      </text>
    </svg>
  );
}
