import { ImageResponse } from 'next/og';
import { KOPI_TEDUH_PWA } from '@components/Templates/kopi-teduh/pwa';

const SIZES = [180, 192, 512];

export const dynamic = 'force-static';

export function generateStaticParams() {
  return SIZES.map((size) => ({ size: String(size) }));
}

// The cup stays inside the central 60%, the safe zone for maskable icons.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ size: string }> }
) {
  const size = Number((await params).size);
  if (!SIZES.includes(size)) return new Response('Not found', { status: 404 });

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: KOPI_TEDUH_PWA.themeColor,
      }}
    >
      <svg
        width={size * 0.5}
        height={size * 0.5}
        viewBox="0 0 24 24"
        fill="none"
        stroke={KOPI_TEDUH_PWA.backgroundColor}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M10 2v2" />
        <path d="M14 2v2" />
        <path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1" />
        <path d="M6 2v2" />
      </svg>
    </div>,
    { width: size, height: size }
  );
}
