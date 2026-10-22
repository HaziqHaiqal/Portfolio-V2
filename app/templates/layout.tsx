import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: { template: '%s · Template demo', default: 'Template demo' },
  robots: { index: false, follow: false },
};

// Demos keep their own light palette, whatever theme the portfolio is in.
export default function TemplatesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-neutral-900 [color-scheme:light]">
      {children}
    </div>
  );
}
