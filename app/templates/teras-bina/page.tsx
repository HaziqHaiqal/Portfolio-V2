import Link from 'next/link';
import { ArrowRight, MapPin } from 'lucide-react';
import Photo from '@components/Templates/Photo';
import {
  CountUp,
  DrawLine,
  HeroPhoto,
  HorizontalScroll,
  Marquee,
  ParallaxPhoto,
  RevealText,
} from '@components/Templates/motion';
import { ServicesList } from '@components/Templates/teras-bina/HomeParts';
import { PRIMARY } from '@components/Templates/teras-bina/ui';
import {
  BASE_PATH,
  CLIENTS,
  PHOTOS,
  PROCESS,
  PROJECTS,
  TESTIMONIAL,
} from '@components/Templates/teras-bina/data';

const STATS = [
  { to: 28, label: 'Years building' },
  { to: 310, label: 'Projects handed over' },
  {
    to: 1.4,
    label: 'Billion ringgit delivered',
    prefix: 'RM',
    suffix: 'b',
    decimals: 1,
  },
  { to: 0, label: 'Lost-time injuries in 2025' },
];

export default function TerasBinaHome() {
  return (
    <>
      <section className="relative flex h-[calc(100svh-3rem)] min-h-[40rem] flex-col justify-end overflow-hidden bg-[#0B0D10] text-white">
        <HeroPhoto
          src={PHOTOS.hero}
          alt="Glass tower under construction with tower cranes"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/30" />
        <div className="relative mx-auto w-full max-w-7xl px-5 pb-10 md:px-8 md:pb-14">
          <h1 className="max-w-5xl text-[12vw] font-semibold leading-[0.95] tracking-[-0.045em] md:text-[6.5vw]">
            <RevealText
              text="We build the places Malaysia works, heals and learns."
              delay={0.3}
            />
          </h1>
          <div className="mt-8 flex flex-wrap items-center gap-x-10 gap-y-5">
            <p className="max-w-md text-lg text-white/75">
              A CIDB Grade G7 contractor delivering hospitals, campuses and
              plants since 1998.
            </p>
            <Link href={`${BASE_PATH}/contact`} className={PRIMARY}>
              Request a quote
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <dl className="mt-14 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-white/20 pt-8 lg:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="flex flex-col-reverse">
                <dt className="mt-1 text-sm text-white/60">{stat.label}</dt>
                <dd className="text-4xl font-semibold tracking-tight md:text-5xl">
                  <CountUp
                    to={stat.to}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                    decimals={stat.decimals}
                  />
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <Marquee duration={40} className="border-b border-tpl-line py-8">
        {CLIENTS.map((client) => (
          <span
            key={client}
            className="whitespace-nowrap pr-16 text-2xl font-semibold tracking-tight text-tpl-muted/70"
          >
            {client}
          </span>
        ))}
      </Marquee>

      <section className="mx-auto max-w-7xl px-5 pt-24 md:px-8 md:pt-36">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <h2 className="max-w-2xl text-5xl font-semibold tracking-[-0.04em] md:text-7xl">
            <RevealText text="What we build" onView />
          </h2>
          <p className="max-w-xs text-tpl-muted">
            Four in-house teams under one contract and one point of contact.
          </p>
        </div>
        <ServicesList />
      </section>

      <section className="mt-24 bg-[#0B0D10] text-white md:mt-36">
        <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-4 px-5 pb-10 pt-24 md:px-8 md:pt-32">
          <h2 className="text-5xl font-semibold tracking-[-0.04em] md:text-7xl">
            <RevealText text="Recent projects" onView />
          </h2>
          <Link
            href={`${BASE_PATH}/projects`}
            className="inline-flex items-center gap-2 text-sm font-semibold"
          >
            All projects
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <HorizontalScroll className="pb-16 md:pb-0">
          {PROJECTS.slice(0, 4).map((project) => (
            <Link
              key={project.id}
              href={`${BASE_PATH}/projects`}
              className="group relative block aspect-[4/5] w-[80vw] shrink-0 snap-center overflow-hidden rounded-[1.75rem] md:aspect-[16/10] md:h-[58vh] md:w-auto"
            >
              <Photo
                src={project.image}
                alt={project.name}
                fill
                sizes="(min-width: 768px) 70vw, 80vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              <div className="absolute inset-x-6 bottom-6 md:inset-x-8 md:bottom-8">
                <p className="text-sm text-white/70">
                  {project.sector}, {project.status.toLowerCase()}{' '}
                  {project.year}
                </p>
                <p className="mt-1 text-2xl font-semibold tracking-tight md:text-4xl">
                  {project.name}
                </p>
                <p className="mt-2 flex items-center gap-1.5 text-sm text-white/70">
                  <MapPin size={14} aria-hidden="true" />
                  {project.location}, {project.value}
                </p>
              </div>
            </Link>
          ))}
        </HorizontalScroll>
      </section>

      <section className="mx-auto max-w-7xl px-5 pt-24 md:px-8 md:pt-36">
        <h2 className="max-w-3xl text-5xl font-semibold tracking-[-0.04em] md:text-7xl">
          <RevealText text="From tender to keys." onView />
        </h2>
        <DrawLine className="mt-14 h-px text-tpl-accent" />
        <ol className="mt-8 grid gap-10 md:grid-cols-4 md:gap-8">
          {PROCESS.map((step, index) => (
            <li key={step.title}>
              <p className="text-sm font-semibold text-tpl-muted">
                Step {index + 1}
              </p>
              <p className="mt-3 text-2xl font-semibold tracking-tight">
                {step.title}
              </p>
              <p className="mt-2 leading-relaxed text-tpl-muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-24 text-center md:px-8 md:py-36">
        <blockquote className="text-3xl font-medium leading-snug tracking-tight md:text-5xl">
          “{TESTIMONIAL.quote}”
        </blockquote>
        <p className="mt-10 font-semibold">{TESTIMONIAL.name}</p>
        <p className="text-sm text-tpl-muted">{TESTIMONIAL.role}</p>
      </section>

      <section className="relative overflow-hidden bg-[#0B0D10] text-white">
        <ParallaxPhoto
          src={PHOTOS.cranes}
          alt=""
          sizes="100vw"
          className="absolute inset-0 opacity-40"
        />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-10 px-5 py-28 md:flex-row md:items-end md:justify-between md:px-8 md:py-40">
          <h2 className="max-w-3xl text-5xl font-semibold tracking-[-0.04em] md:text-8xl">
            Tendering a project?
          </h2>
          <Link href={`${BASE_PATH}/contact`} className={PRIMARY}>
            Request a quote
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
