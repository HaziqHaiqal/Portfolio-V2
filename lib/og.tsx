/* eslint-disable @next/next/no-img-element -- ImageResponse only renders plain <img>. */
import { ImageResponse } from 'next/og';
import type { CSSProperties, ReactNode } from 'react';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { getCachedTemplates } from '@lib/data';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const [interMedium, interExtraBold] = await Promise.all([
  readFile(join(process.cwd(), 'assets/fonts/Inter-Medium.ttf')),
  readFile(join(process.cwd(), 'assets/fonts/Inter-ExtraBold.ttf')),
]);

export const imageOptions: NonNullable<
  ConstructorParameters<typeof ImageResponse>[1]
> = {
  ...size,
  fonts: [
    { name: 'Inter', data: interMedium, weight: 500, style: 'normal' },
    { name: 'Inter', data: interExtraBold, weight: 800, style: 'normal' },
  ],
};

async function loadImage(url?: string | null): Promise<string | null> {
  if (!url) return null;
  try {
    const res = await fetch(url, { cache: 'force-cache' });
    const type = res.headers.get('content-type') ?? '';
    // ImageResponse can only decode JPEG and PNG.
    if (!res.ok || !/^image\/(jpeg|png)$/.test(type)) return null;

    const data = Buffer.from(await res.arrayBuffer()).toString('base64');
    return `data:${type};base64,${data}`;
  } catch {
    return null;
  }
}

const fill = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
} as const;

/** The site's light grey with its grid and a soft blue glow. */
function Canvas({
  glowAt = '50% 30%',
  style,
  children,
}: {
  glowAt?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        backgroundColor: '#f9fafb',
        color: '#111827',
        fontFamily: 'Inter',
      }}
    >
      <div
        style={{
          ...fill,
          backgroundImage: `radial-gradient(circle at ${glowAt}, rgba(59,130,246,0.16), transparent 55%)`,
        }}
      />
      <div
        style={{
          ...fill,
          backgroundImage:
            'linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
      <div
        style={{ ...fill, display: 'flex', flexDirection: 'column', ...style }}
      >
        {children}
      </div>
    </div>
  );
}

// One plain shape per page, drawn on a 24-unit box.
const SYMBOLS = {
  home: <path d="M3 2h5.5v7.6h7V2H21v20h-5.5v-7.6h-7V22H3z" />,
  projects: (
    <g>
      <rect x="2" y="2" width="9" height="9" rx="2.4" />
      <rect x="13" y="2" width="9" height="9" rx="2.4" />
      <rect x="2" y="13" width="9" height="9" rx="2.4" />
      <rect x="13" y="13" width="9" height="9" rx="2.4" />
    </g>
  ),
  services: (
    <path
      fillRule="evenodd"
      d="M2 4.2C2 3 3 2 4.2 2h6.9c.6 0 1.1.2 1.6.6l8.7 8.7c.9.9.9 2.3 0 3.1l-6.9 6.9c-.9.9-2.3.9-3.1 0L2.6 12.7C2.2 12.2 2 11.7 2 11.1zM7.6 9.4a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6z"
    />
  ),
  demos: (
    <path d="M6 4.3c0-1.3 1.4-2.1 2.5-1.4l12.3 7.7c1 .7 1 2.2 0 2.8L8.5 21.1C7.4 21.8 6 21 6 19.7z" />
  ),
  contact: (
    <path
      fillRule="evenodd"
      d="M2 6c0-2.2 1.8-4 4-4h12c2.2 0 4 1.8 4 4v8c0 2.2-1.8 4-4 4h-6.5L6 22v-4c-2.2 0-4-1.8-4-4zm5 6.2a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2zm5 0a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2zm5 0a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2z"
    />
  ),
};

export type PageSymbol = keyof typeof SYMBOLS;

// The hero's rings around the photo: [radius, border width, opacity].
const RINGS = [
  [430, 4, 0.15],
  [350, 3, 0.3],
  [270, 2, 0.5],
] as const;
const CENTRE = { x: 940, y: 315 };

/** Words on the left; on the right, the rings around a solid circle holding the page's symbol. */
function RingsCard({
  symbol,
  title,
  line,
  byline = true,
}: {
  symbol: PageSymbol;
  title: string;
  line?: string;
  byline?: boolean;
}) {
  return new ImageResponse(
    <Canvas glowAt="78% 50%">
      {RINGS.map(([radius, width, opacity]) => (
        <div
          key={radius}
          style={{
            position: 'absolute',
            left: CENTRE.x - radius,
            top: CENTRE.y - radius,
            width: radius * 2,
            height: radius * 2,
            borderRadius: '50%',
            border: `${width}px solid rgba(37,99,235,${opacity})`,
          }}
        />
      ))}
      <div
        style={{
          position: 'absolute',
          left: CENTRE.x - 190,
          top: CENTRE.y - 190,
          width: 380,
          height: 380,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          backgroundImage: 'linear-gradient(135deg, #2563eb, #9333ea)',
          boxShadow: '0 30px 60px -20px rgba(17,24,39,0.35)',
        }}
      >
        <svg width={180} height={180} viewBox="0 0 24 24">
          <g fill="#fff">{SYMBOLS[symbol]}</g>
        </svg>
      </div>

      {byline && (
        <div
          style={{
            position: 'absolute',
            left: 80,
            top: 72,
            fontSize: 30,
            fontWeight: 800,
            letterSpacing: -0.6,
          }}
        >
          Haziq Haiqal
        </div>
      )}
      <div
        style={{
          position: 'absolute',
          left: 80,
          top: 430,
          fontSize: 84,
          fontWeight: 800,
          letterSpacing: -3.8,
          lineHeight: 1,
        }}
      >
        {title}
      </div>
      {line && (
        <div
          style={{
            position: 'absolute',
            left: 84,
            top: 528,
            fontSize: 32,
            color: '#4b5563',
          }}
        >
          {line}
        </div>
      )}
    </Canvas>,
    imageOptions
  );
}

export async function homeCard() {
  return RingsCard({
    symbol: 'home',
    title: 'Haziq Haiqal',
    line: 'Software Developer',
    byline: false,
  });
}

/** A page: your name small, its title large, one short line, and its symbol in the rings. */
export async function pageCard(
  symbol: PageSymbol,
  title: string,
  line?: string
) {
  return RingsCard({ symbol, title, line });
}

/** A template demo: its name, the nav's "Haziq." wordmark and its gallery cover. */
export async function templateCard(slug: string) {
  const templates = await getCachedTemplates().catch(() => []);
  const template = templates.find((t) => t.slug === slug);
  const name = template?.name ?? 'Template demo';
  const cover = await loadImage(template?.preview_image_url);
  if (!cover) return pageCard('demos', name, 'Template demo');

  return new ImageResponse(
    <Canvas glowAt="50% 0%" style={{ padding: '64px 72px 0' }}>
      <div
        style={{
          display: 'flex',
          flexShrink: 0,
          alignItems: 'center',
          justifyContent: 'space-between',
          fontWeight: 800,
          lineHeight: 1,
        }}
      >
        <div style={{ fontSize: 72, letterSpacing: -3 }}>{name}</div>
        <div style={{ display: 'flex', fontSize: 44, letterSpacing: -1.5 }}>
          Haziq<span style={{ color: '#16a34a' }}>.</span>
        </div>
      </div>

      <img
        src={cover}
        alt=""
        width={1056}
        height={600}
        style={{
          flexShrink: 0,
          marginTop: 48,
          borderRadius: 28,
          border: '2px solid rgba(17,24,39,0.08)',
          boxShadow: '0 24px 60px rgba(17,24,39,0.16)',
          objectFit: 'cover',
          objectPosition: 'top',
        }}
      />
    </Canvas>,
    imageOptions
  );
}
