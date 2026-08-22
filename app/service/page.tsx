import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowUpRight,
  ArrowLeft,
  Check,
  Minus,
  Smartphone,
  Globe,
} from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import { getCachedPortfolio } from '@lib/data';
import {
  getServiceGroups,
  type ServiceGroup,
  type ServiceIcon,
} from '@constants/services';
import { DEFAULT_CONTACT } from '@constants/contact';
import GridBackground from '@components/Layout/GridBackground';
import Footer from '@components/Layout/Footer';
import Reveal from '@components/Common/Reveal';
import Disclosure from '@components/Common/Disclosure';

export const metadata: Metadata = {
  title: 'Services | Haziq Haiqal',
  description: 'Web and mobile app development services.',
};

const ICONS: Record<ServiceIcon, typeof Globe> = {
  web: Globe,
  mobile: Smartphone,
};

function withNumbering(groups: ServiceGroup[]) {
  return groups.map((group, gi) => {
    const offset = groups
      .slice(0, gi)
      .reduce((sum, g) => sum + g.items.length, 0);
    return {
      ...group,
      items: group.items.map((item, i) => ({
        ...item,
        index: String(offset + i + 1).padStart(2, '0'),
      })),
    };
  });
}

export default async function ServicePage() {
  const { profile } = await getCachedPortfolio();
  const whatsappUrl = profile?.whatsapp_url || DEFAULT_CONTACT.whatsapp;
  const NUMBERED_GROUPS = withNumbering(getServiceGroups(whatsappUrl));

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="relative bg-gray-50 dark:bg-gray-800">
        <GridBackground />

        <main className="relative z-10 px-6 pb-28 pt-16 md:pt-24">
          <div className="mx-auto max-w-4xl">
            <Reveal y={16} duration={0.5}>
              <Link
                href="/"
                className="group mb-16 inline-flex items-center gap-2 font-mono text-sm text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              >
                <ArrowLeft
                  size={15}
                  className="transition-transform group-hover:-translate-x-1"
                />
                back
              </Link>
            </Reveal>

            <Reveal className="mb-20 md:mb-28" y={24} duration={0.6}>
              <p className="mb-4 font-mono text-sm text-emerald-600 dark:text-emerald-400">
                services.list()
              </p>
              <h1 className="mb-6 text-5xl font-bold tracking-tight text-gray-900 dark:text-white md:text-7xl">
                What I build.
              </h1>
              <p className="max-w-xl text-lg leading-relaxed text-gray-600 dark:text-gray-400">
                Available for freelance work and collaboration. Pick whichever
                fits, or tell me what you have in mind.
              </p>
            </Reveal>

            {NUMBERED_GROUPS.map((group) => (
              <section key={group.heading} className="mb-20 md:mb-24">
                <h2 className="mb-2 flex flex-wrap items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
                  {group.heading}
                  {group.comingSoon && (
                    <span className="rounded-full border border-gray-300 px-2 py-0.5 text-[10px] normal-case tracking-normal text-gray-500 dark:border-white/15 dark:text-gray-400">
                      Coming soon
                    </span>
                  )}
                </h2>

                {group.comingSoon && group.note && (
                  <p className="border-t border-gray-200 pt-8 text-gray-500 dark:border-white/10 dark:text-gray-400">
                    {group.note}
                  </p>
                )}

                {group.items.map((item) => {
                  const Icon = ICONS[item.icon];

                  return (
                    <Reveal key={item.title} y={20} duration={0.55}>
                      <article className="group border-t border-gray-200 py-10 transition-colors hover:border-emerald-500/50 dark:border-white/10 dark:hover:border-emerald-400/40 md:py-12">
                        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                          <div className="flex gap-5">
                            <span className="mt-1 font-mono text-sm text-gray-400 transition-colors group-hover:text-emerald-500 dark:text-gray-600 dark:group-hover:text-emerald-400">
                              {item.index}
                            </span>
                            <span className="mt-0.5 hidden shrink-0 text-gray-400 dark:text-gray-500 sm:block">
                              <Icon size={26} strokeWidth={1.5} />
                            </span>
                            <div>
                              <h3 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 md:text-3xl">
                                {item.title}
                              </h3>
                              <p className="mt-3 max-w-xl leading-relaxed text-gray-600 dark:text-gray-400">
                                {item.description}
                              </p>
                            </div>
                          </div>

                          <div className="flex shrink-0 flex-col items-start gap-3 md:items-end">
                            {item.price && (
                              <span className="whitespace-nowrap font-mono text-base text-gray-900 dark:text-gray-100 md:text-lg">
                                {item.price}
                              </span>
                            )}
                            {item.cta && (
                              <a
                                href={item.cta.href}
                                className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition-transform hover:scale-[1.03] dark:bg-white dark:text-gray-900"
                              >
                                {item.cta.label}
                                <SiWhatsapp size={15} />
                              </a>
                            )}
                          </div>
                        </div>

                        {item.tiers && item.tiers.length > 0 && (
                          <Disclosure
                            className="mt-8 md:ml-[3.25rem]"
                            showLabel="View full pricing details"
                            hideLabel="Hide full pricing details"
                          >
                            <div className="mt-8">
                              {item.pricingLabel && (
                                <p className="mb-5 border-t border-gray-200 pt-6 font-mono text-xs uppercase tracking-[0.2em] text-gray-400 dark:border-white/10 dark:text-gray-500">
                                  {item.pricingLabel}
                                </p>
                              )}

                              <div className="grid gap-5 md:grid-cols-2">
                                {item.tiers.map((tier) => (
                                  <div
                                    key={tier.name}
                                    className="flex flex-col rounded-2xl border border-gray-200 bg-white/60 p-6 dark:border-white/10 dark:bg-white/[0.03]"
                                  >
                                    <h4 className="font-bold text-gray-900 dark:text-gray-100">
                                      {tier.name}
                                    </h4>

                                    {tier.bestFor && (
                                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                        <span className="font-medium text-gray-900 dark:text-gray-200">
                                          Best for:
                                        </span>{' '}
                                        {tier.bestFor}
                                      </p>
                                    )}

                                    <p className="mt-4 font-mono text-3xl font-bold text-gray-900 dark:text-white">
                                      {tier.price}
                                      {tier.priceNote && (
                                        <span className="ml-2 font-mono text-sm font-normal text-gray-500 dark:text-gray-400">
                                          {tier.priceNote}
                                        </span>
                                      )}
                                    </p>

                                    <ul className="mt-6 space-y-2.5 border-t border-gray-200 pt-6 dark:border-white/10">
                                      {tier.features.map((f) => (
                                        <li
                                          key={f.text}
                                          className="flex items-start gap-2.5 text-sm"
                                        >
                                          {f.included ? (
                                            <Check
                                              size={16}
                                              className="mt-0.5 shrink-0 text-emerald-500"
                                            />
                                          ) : (
                                            <Minus
                                              size={16}
                                              className="mt-0.5 shrink-0 text-gray-400 dark:text-gray-600"
                                            />
                                          )}
                                          <span
                                            className={
                                              f.included
                                                ? 'text-gray-700 dark:text-gray-300'
                                                : 'text-gray-500 dark:text-gray-500'
                                            }
                                          >
                                            {f.text}
                                          </span>
                                        </li>
                                      ))}
                                    </ul>

                                    {/* mt-auto pins this block to the card
                                        floor so CTAs line up across tiers. */}
                                    <div className="mt-auto">
                                      {tier.note && (
                                        <p className="mt-6 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                                          {tier.note}
                                        </p>
                                      )}

                                      {tier.cta && (
                                        <a
                                          href={tier.cta.href}
                                          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-900 transition-colors hover:border-emerald-500 hover:text-emerald-600 dark:border-white/15 dark:text-gray-100 dark:hover:border-emerald-400 dark:hover:text-emerald-400"
                                        >
                                          {tier.cta.label}
                                          <ArrowUpRight size={15} />
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </Disclosure>
                        )}
                      </article>
                    </Reveal>
                  );
                })}
              </section>
            ))}

            <Reveal
              className="border-t border-gray-200 pt-12 dark:border-white/10"
              y={20}
              duration={0.6}
            >
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Not sure which one fits?{' '}
                <a
                  href={`mailto:${profile?.email || DEFAULT_CONTACT.email}`}
                  className="border-b border-emerald-500/40 pb-0.5 font-medium text-gray-900 transition-colors hover:border-emerald-500 hover:text-emerald-600 dark:text-gray-100 dark:hover:text-emerald-400"
                >
                  Send me a note
                </a>{' '}
                and we&apos;ll figure it out.
              </p>
            </Reveal>
          </div>
        </main>
      </div>

      <Footer profile={profile} />
    </div>
  );
}
