import Link from 'next/link';
import { ChevronLeft, LayoutDashboard } from 'lucide-react';
import { getCachedTemplates } from '@lib/data';
import { formatRM } from '@lib/format';
import { PaletteSwitcher } from './Palette';
import UseTemplateLink from './UseTemplateLink';

// Pinned above the demo site, like a theme-shop preview bar, so Back and the
// colours stay in reach while the bottom stays free for each site's actions.
export default async function DemoBar({
  slug,
  links = [],
}: {
  slug: string;
  /** Extra views of the demo, such as the store owner's dashboard. */
  links?: { href: string; label: string }[];
}) {
  const templates = await getCachedTemplates().catch(() => []);
  const template = templates.find((item) => item.slug === slug);

  return (
    <div className="sticky top-0 z-[60] h-[--demo-bar] bg-neutral-950 font-sans text-white">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-3 px-3 sm:px-5">
        <Link
          href="/services"
          className="flex min-w-0 items-center gap-1 text-xs text-white/70 transition-colors hover:text-white"
        >
          <ChevronLeft size={16} aria-hidden="true" className="shrink-0" />
          <span className="hidden truncate sm:inline">
            {template ? `${template.name} template` : 'All templates'}
          </span>
          <span className="sm:hidden">Back</span>
        </Link>
        <PaletteSwitcher />
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-label={link.label}
              className="inline-flex h-8 items-center gap-1.5 rounded-full px-2 text-xs font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white sm:px-3"
            >
              <LayoutDashboard size={15} aria-hidden="true" />
              <span className="hidden sm:inline">{link.label}</span>
            </Link>
          ))}
          <UseTemplateLink
            slug={slug}
            className="inline-flex h-8 shrink-0 items-center gap-2 rounded-full bg-white px-3.5 text-xs font-semibold text-neutral-950 transition-colors hover:bg-neutral-200"
          >
            <span className="hidden sm:inline">Use this template</span>
            <span className="sm:hidden">Use</span>
            {template && (
              <span className="border-l border-neutral-300 pl-2">
                {formatRM(template.price)}
              </span>
            )}
          </UseTemplateLink>
        </div>
      </div>
    </div>
  );
}
