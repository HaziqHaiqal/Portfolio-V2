import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { getCachedPortfolio } from '@lib/data';

export const alt = 'Haziq Haiqal | Software Developer';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const [interMedium, interExtraBold] = await Promise.all([
  readFile(join(process.cwd(), 'assets/fonts/Inter-Medium.ttf')),
  readFile(join(process.cwd(), 'assets/fonts/Inter-ExtraBold.ttf')),
]);

async function getAvatar(): Promise<string | null> {
  try {
    const { profile } = await getCachedPortfolio();
    if (!profile?.profile_image_url) return null;

    const res = await fetch(profile.profile_image_url, {
      cache: 'force-cache',
    });
    const type = res.headers.get('content-type') ?? '';
    // ImageResponse can only decode JPEG and PNG.
    if (!res.ok || !/^image\/(jpeg|png)$/.test(type)) return null;

    const data = Buffer.from(await res.arrayBuffer()).toString('base64');
    return `data:${type};base64,${data}`;
  } catch {
    return null;
  }
}

export default async function Image() {
  const avatar = await getAvatar();

  return new ImageResponse(
    <div
      style={{
        position: 'relative',
        display: 'flex',
        width: '100%',
        height: '100%',
        backgroundColor: '#111827',
        color: '#f9fafb',
        fontFamily: 'Inter',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage:
            'radial-gradient(circle at 50% 30%, rgba(59,130,246,0.26), transparent 55%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 176,
            height: 176,
            borderRadius: 999,
            border: '6px solid #374151',
            overflow: 'hidden',
            backgroundImage: 'linear-gradient(135deg, #2563eb, #9333ea)',
            fontSize: 80,
            fontWeight: 800,
          }}
        >
          {avatar ? (
            <img
              src={avatar}
              alt=""
              width={164}
              height={164}
              style={{ objectFit: 'cover' }}
            />
          ) : (
            'H'
          )}
        </div>

        <div
          style={{
            display: 'flex',
            marginTop: 32,
            fontSize: 92,
            fontWeight: 800,
            letterSpacing: -3,
            lineHeight: 1.1,
          }}
        >
          <span
            style={{
              backgroundImage: 'linear-gradient(90deg, #60a5fa, #c084fc)',
              backgroundClip: 'text',
              color: 'transparent',
              paddingRight: 24,
            }}
          >
            Haziq
          </span>
          <span>Haiqal</span>
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
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: 'Inter', data: interMedium, weight: 500, style: 'normal' },
        { name: 'Inter', data: interExtraBold, weight: 800, style: 'normal' },
      ],
    }
  );
}
