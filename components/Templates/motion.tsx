'use client';

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import {
  animate,
  domMax,
  LazyMotion,
  m,
  MotionConfig,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import { ReactLenis, useLenis } from 'lenis/react';
import 'lenis/dist/lenis.css';
import Photo from './Photo';

const EASE = [0.22, 1, 0.36, 1] as const;

export function MotionRoot({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domMax}>
      <MotionConfig reducedMotion="user">
        <ReactLenis root options={{ lerp: 0.12 }} />
        <SamePageLinks />
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}

/** Scrolls to #section links without writing the fragment into the URL. */
function SamePageLinks() {
  const lenis = useLenis();

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey
      ) {
        return;
      }
      const link = (event.target as Element | null)?.closest?.('a[href^="#"]');
      if (!link) return;
      event.preventDefault();
      const id = link.getAttribute('href')?.slice(1) ?? '';
      const target = id && id !== 'top' ? document.getElementById(id) : null;
      if (lenis) lenis.scrollTo(target ?? 0, { offset: target ? -120 : 0 });
      else if (target) target.scrollIntoView({ behavior: 'smooth' });
      else window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [lenis]);

  return null;
}

const subscribeScroll = (listener: () => void) => {
  window.addEventListener('scroll', listener, { passive: true });
  return () => window.removeEventListener('scroll', listener);
};

/** True once the page has scrolled past `offset` pixels. */
export function useScrolled(offset = 24) {
  return useSyncExternalStore(
    subscribeScroll,
    () => window.scrollY > offset,
    () => false
  );
}

/** Headline that rises in word by word. */
export function RevealText({
  text,
  className = '',
  delay = 0,
  onView = false,
}: {
  text: string;
  className?: string;
  delay?: number;
  onView?: boolean;
}) {
  const words = text.split(' ');
  const trigger = onView
    ? { whileInView: 'shown', viewport: { once: true, margin: '-10% 0px' } }
    : { animate: 'shown' };

  return (
    <m.span
      initial="hidden"
      {...trigger}
      transition={{ staggerChildren: 0.06, delayChildren: delay }}
      aria-label={text}
      className={className}
    >
      {words.map((word, index) => (
        <span
          key={`${word}-${index}`}
          aria-hidden="true"
          className="inline-block overflow-hidden pb-[0.08em] align-bottom"
        >
          <m.span
            className="inline-block"
            variants={{
              hidden: { y: '105%' },
              shown: { y: 0, transition: { duration: 0.8, ease: EASE } },
            }}
          >
            {word}
            {index < words.length - 1 && ' '}
          </m.span>
        </span>
      ))}
    </m.span>
  );
}

export function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <m.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 0.8, delay, ease: EASE }}
      className={className}
    >
      {children}
    </m.div>
  );
}

/** Photo that drifts against the scroll, inside a clipped frame. */
export function ParallaxPhoto({
  src,
  alt,
  sizes,
  className = '',
  strength = 12,
  priority = false,
}: {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  strength?: number;
  priority?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [`-${strength}%`, `${strength}%`]
  );

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <m.div style={{ y }} className="absolute inset-[-14%_0]">
        <Photo
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      </m.div>
    </div>
  );
}

/** Slow zoom-out for full-bleed hero photos. */
export function HeroPhoto({
  src,
  alt,
  className = '',
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <m.div
      initial={{ scale: 1.12 }}
      animate={{ scale: 1 }}
      transition={{ duration: 2.4, ease: EASE }}
      className={`absolute inset-0 ${className}`}
    >
      <Photo
        src={src}
        alt={alt}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
    </m.div>
  );
}

export function Marquee({
  children,
  className = '',
  duration = 30,
  reverse = false,
}: {
  children: ReactNode;
  className?: string;
  duration?: number;
  reverse?: boolean;
}) {
  return (
    <div className={`group flex overflow-hidden ${className}`}>
      {[0, 1].map((copy) => (
        <div
          key={copy}
          aria-hidden={copy === 1}
          style={{
            animationDuration: `${duration}s`,
            animationDirection: reverse ? 'reverse' : 'normal',
          }}
          className="flex shrink-0 animate-[tpl-marquee_linear_infinite] items-center group-hover:[animation-play-state:paused] motion-reduce:animate-none"
        >
          {children}
        </div>
      ))}
    </div>
  );
}

export function CountUp({
  to,
  prefix = '',
  suffix = '',
  decimals = 0,
}: {
  to: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration: 1.6,
      ease: EASE,
      onUpdate: setValue,
    });
    return () => controls.stop();
  }, [inView, to]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {value.toLocaleString('en-MY', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}

export interface PreviewItem {
  key: string;
  image: string;
}

/**
 * List whose hovered row shows its photo floating under the cursor. Touch
 * screens never hover, so rows there should show an inline thumbnail.
 */
export function HoverPreview<T extends PreviewItem>({
  items,
  renderRow,
  className = '',
  imageClassName = 'h-64 w-52',
}: {
  items: T[];
  renderRow: (item: T, index: number) => ReactNode;
  className?: string;
  imageClassName?: string;
}) {
  const [active, setActive] = useState<number | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 260, damping: 28 });
  const springY = useSpring(y, { stiffness: 260, damping: 28 });

  return (
    <div
      className={className}
      onPointerMove={(event) => {
        x.set(event.clientX);
        y.set(event.clientY);
      }}
      onPointerLeave={() => setActive(null)}
    >
      {items.map((item, index) => (
        <div
          key={item.key}
          onPointerEnter={(event) =>
            event.pointerType === 'mouse' && setActive(index)
          }
        >
          {renderRow(item, index)}
        </div>
      ))}
      <m.div
        aria-hidden="true"
        style={{ x: springX, y: springY }}
        className="pointer-events-none fixed left-0 top-0 z-50 hidden md:block"
      >
        <m.div
          animate={{
            opacity: active === null ? 0 : 1,
            scale: active === null ? 0.85 : 1,
          }}
          transition={{ duration: 0.3, ease: EASE }}
          className={`relative -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl shadow-2xl ${imageClassName}`}
        >
          {items.map((item, index) => (
            <Photo
              key={item.key}
              src={item.image}
              alt=""
              fill
              sizes="240px"
              className={`object-cover transition-opacity duration-300 ${
                active === index ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))}
        </m.div>
      </m.div>
    </div>
  );
}

/**
 * Vertical scroll drives a horizontal track while the section is pinned.
 * Phones get a native swipe row instead, which feels better with a thumb.
 */
export function HorizontalScroll({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const observer = new ResizeObserver(() =>
      setDistance(Math.max(0, track.scrollWidth - window.innerWidth))
    );
    observer.observe(track);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div
        ref={sectionRef}
        style={{ height: `calc(100vh + ${distance}px)` }}
        className={`relative hidden md:block ${className}`}
      >
        <div className="sticky top-0 flex h-screen items-center overflow-hidden">
          <m.div ref={trackRef} style={{ x }} className="flex w-max gap-6 px-8">
            {children}
          </m.div>
        </div>
      </div>
      <div
        className={`flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 [scrollbar-width:none] md:hidden ${className}`}
      >
        {children}
      </div>
    </>
  );
}

/** A line that draws itself as its section scrolls through the viewport. */
export function DrawLine({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 85%', 'end 40%'],
  });
  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <m.div
        style={{ scaleX: scrollYProgress }}
        className="h-full w-full origin-left bg-current"
      />
    </div>
  );
}
