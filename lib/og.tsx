/* eslint-disable @next/next/no-img-element -- ImageResponse only renders plain <img>. */
import { ImageResponse } from 'next/og';
import type { CSSProperties, ReactNode } from 'react';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { getCachedPortfolio, getCachedTemplates } from '@lib/data';

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

export async function getAvatar() {
  const { profile } = await getCachedPortfolio().catch(() => ({
    profile: null,
  }));
  return loadImage(profile?.profile_image_url);
}

// Pages share the dark home card; template demos sit on the site's light grey.
const TONES = {
  dark: {
    bg: '#111827',
    text: '#f9fafb',
    glow: 'rgba(59,130,246,0.26)',
    grid: 'rgba(255,255,255,0.04)',
  },
  light: {
    bg: '#f9fafb',
    text: '#111827',
    glow: 'rgba(59,130,246,0.16)',
    grid: 'rgba(0,0,0,0.05)',
  },
};

const fill = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
} as const;

function Canvas({
  tone = 'dark',
  glowAt = '50% 30%',
  style,
  children,
}: {
  tone?: keyof typeof TONES;
  glowAt?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const t = TONES[tone];
  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        backgroundColor: t.bg,
        color: t.text,
        fontFamily: 'Inter',
      }}
    >
      <div
        style={{
          ...fill,
          backgroundImage: `radial-gradient(circle at ${glowAt}, ${t.glow}, transparent 55%)`,
        }}
      />
      <div
        style={{
          ...fill,
          backgroundImage: `linear-gradient(${t.grid} 1px, transparent 1px), linear-gradient(90deg, ${t.grid} 1px, transparent 1px)`,
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

function Avatar({ src, size }: { src: string | null; size: number }) {
  return (
    <div
      style={{
        display: 'flex',
        flexShrink: 0,
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        borderRadius: 999,
        border: `${Math.round(size / 30) + 1}px solid #374151`,
        overflow: 'hidden',
        backgroundImage: 'linear-gradient(135deg, #2563eb, #9333ea)',
        fontSize: size * 0.45,
        fontWeight: 800,
      }}
    >
      {src ? (
        <img
          src={src}
          alt=""
          width={size}
          height={size}
          style={{ objectFit: 'cover' }}
        />
      ) : (
        'H'
      )}
    </div>
  );
}

function GradientName({ size }: { size: number }) {
  return (
    <div
      style={{
        display: 'flex',
        fontSize: size,
        fontWeight: 800,
        letterSpacing: -size / 30,
        lineHeight: 1.1,
      }}
    >
      <span
        style={{
          backgroundImage: 'linear-gradient(90deg, #60a5fa, #c084fc)',
          backgroundClip: 'text',
          color: 'transparent',
          paddingRight: size / 4,
        }}
      >
        Haziq
      </span>
      <span>Haiqal</span>
    </div>
  );
}

export async function homeCard() {
  const avatar = await getAvatar();

  return new ImageResponse(
    <Canvas style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Avatar src={avatar} size={176} />
      <div style={{ display: 'flex', marginTop: 32 }}>
        <GradientName size={92} />
      </div>
      <div
        style={{
          display: 'flex',
          marginTop: 12,
          fontSize: 40,
          color: '#d1d5db',
        }}
      >
        Software Developer
      </div>
      <div
        style={{
          display: 'flex',
          marginTop: 36,
          fontSize: 24,
          color: '#6b7280',
        }}
      >
        haziqhaiqal.com
      </div>
    </Canvas>,
    imageOptions
  );
}

/** The home card with the page name as the big text. */
export async function pageCard(title: string) {
  const avatar = await getAvatar();

  return new ImageResponse(
    <Canvas style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Avatar src={avatar} size={176} />
      <div
        style={{
          marginTop: 32,
          fontSize: 104,
          fontWeight: 800,
          letterSpacing: -4,
          lineHeight: 1.05,
        }}
      >
        {title}
      </div>
      <div style={{ display: 'flex', marginTop: 16 }}>
        <GradientName size={36} />
      </div>
    </Canvas>,
    imageOptions
  );
}

/** A template demo: its name, the nav's "Haziq." wordmark and its gallery cover. */
export async function templateCard(slug: string) {
  const templates = await getCachedTemplates().catch(() => []);
  const template = templates.find((t) => t.slug === slug);
  const name = template?.name ?? 'Template demo';
  const cover = await loadImage(template?.preview_image_url);
  if (!cover) return pageCard(name);

  return new ImageResponse(
    <Canvas tone="light" glowAt="50% 0%" style={{ padding: '64px 72px 0' }}>
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
