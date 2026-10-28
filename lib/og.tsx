/* eslint-disable @next/next/no-img-element -- ImageResponse only renders plain <img>. */
import { ImageResponse } from 'next/og';
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

const frame = {
  flexShrink: 0,
  backgroundColor: '#ffffff',
  border: '8px solid #ffffff',
  boxShadow: '0 24px 60px rgba(24,24,27,0.18)',
  objectFit: 'cover',
  objectPosition: 'top',
} as const;

/** A page's link preview: a short title over one big screenshot, or a row of three. */
export async function pageCard({
  title,
  shots,
}: {
  title: string;
  shots: (string | null | undefined)[];
}) {
  const images = (await Promise.all(shots.slice(0, 3).map(loadImage))).filter(
    (src): src is string => Boolean(src)
  );
  const row = images.length > 1;

  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: row ? 'center' : 'flex-start',
        width: '100%',
        height: '100%',
        padding: row ? '0 56px' : '64px 72px 0',
        overflow: 'hidden',
        backgroundImage: 'linear-gradient(160deg, #fafafa, #e4e4e7)',
        color: '#18181b',
        fontFamily: 'Inter',
      }}
    >
      <div
        style={{
          flexShrink: 0,
          fontSize: 72,
          fontWeight: 800,
          letterSpacing: -3,
          lineHeight: 1,
        }}
      >
        {title}
      </div>

      {row ? (
        <div style={{ display: 'flex', marginTop: 44 }}>
          {images.map((src, i) => (
            <img
              key={i}
              src={src}
              alt=""
              width={352}
              height={220}
              style={{ ...frame, marginLeft: i ? 16 : 0, borderRadius: 20 }}
            />
          ))}
        </div>
      ) : (
        images[0] && (
          <img
            src={images[0]}
            alt=""
            width={1056}
            height={600}
            style={{ ...frame, marginTop: 48, borderRadius: 28 }}
          />
        )
      )}
    </div>,
    imageOptions
  );
}

export async function templateCard(slug: string) {
  const templates = await getCachedTemplates().catch(() => []);
  const template = templates.find((t) => t.slug === slug);

  return pageCard({
    title: template?.name ?? 'Template demo',
    shots: [template?.preview_image_url],
  });
}
