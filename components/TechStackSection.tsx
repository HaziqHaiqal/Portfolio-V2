'use client';

import React, { useEffect, useRef } from 'react';
import Reveal from '@components/Common/Reveal';
import { Code2 } from 'lucide-react';
import SectionHeader from '@components/Common/SectionHeader';
import type { IconType } from 'react-icons';
import {
  SiNextdotjs,
  SiReact,
  SiTailwindcss,
  SiJavascript,
  SiTypescript,
  SiNodedotjs,
  SiAmazonwebservices,
  SiMysql,
  SiPostgresql,
  SiGit,
  SiGithub,
  SiPython,
} from 'react-icons/si';
import { FaJava } from 'react-icons/fa6';

const STACKS: { name: string; icon: IconType; color: string }[] = [
  {
    name: 'Next.js',
    icon: SiNextdotjs,
    color: 'text-gray-900 dark:text-white',
  },
  { name: 'React', icon: SiReact, color: 'text-[#0891b2] dark:text-[#61dafb]' },
  { name: 'Tailwind CSS', icon: SiTailwindcss, color: 'text-[#06b6d4]' },
  {
    name: 'JavaScript',
    icon: SiJavascript,
    color: 'text-[#e5c600] dark:text-[#f7df1e]',
  },
  { name: 'TypeScript', icon: SiTypescript, color: 'text-[#3178c6]' },
  { name: 'Node.js', icon: SiNodedotjs, color: 'text-[#5fa04e]' },
  { name: 'AWS', icon: SiAmazonwebservices, color: 'text-[#ff9900]' },
  { name: 'MySQL', icon: SiMysql, color: 'text-[#4479a1]' },
  { name: 'PostgreSQL', icon: SiPostgresql, color: 'text-[#4169e1]' },
  { name: 'Git', icon: SiGit, color: 'text-[#f05032]' },
  { name: 'GitHub', icon: SiGithub, color: 'text-[#181717] dark:text-white' },
  { name: 'Python', icon: SiPython, color: 'text-[#3776ab]' },
  { name: 'Java', icon: FaJava, color: 'text-[#e76f00]' },
];

// Spread evenly over a ball. None sits on a pole, where the spin would leave it still.
const POINTS = STACKS.map((_, index) => {
  const y = 1 - ((index + 0.5) / STACKS.length) * 2;
  const radius = Math.sqrt(1 - y * y);
  const theta = Math.PI * (3 - Math.sqrt(5)) * index;
  return { x: Math.cos(theta) * radius, y, z: Math.sin(theta) * radius };
});

// Turning a little on both axes keeps every logo travelling.
const SPIN = { x: 0.0015, y: 0.004 };
const START_TILT = -0.25;

function place(point: (typeof POINTS)[number], ax: number, ay: number) {
  const cy = Math.cos(ay);
  const sy = Math.sin(ay);
  const cx = Math.cos(ax);
  const sx = Math.sin(ax);
  const x1 = point.x * cy + point.z * sy;
  const z1 = -point.x * sy + point.z * cy;
  const y1 = point.y * cx - z1 * sx;
  const z2 = point.y * sx + z1 * cx;
  const depth = (z2 + 1) / 2;
  return {
    transform: `translate(-50%, -50%) translate(calc(${x1.toFixed(4)} * var(--r)), calc(${y1.toFixed(4)} * var(--r))) scale(${(0.62 + depth * 0.5).toFixed(3)})`,
    opacity: (0.28 + depth * 0.72).toFixed(3),
    zIndex: Math.round(depth * 100),
    front: depth > 0.62,
  };
}

const TechStackSection = () => {
  const globeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;
    const items = Array.from(
      globe.querySelectorAll<HTMLElement>('[data-item]')
    );
    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const rest = reduce ? { x: 0, y: 0 } : SPIN;
    let ax = START_TILT;
    let ay = 0;
    let vx = rest.x;
    let vy = rest.y;
    let frame = 0;
    let visible = false;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;

    const tick = () => {
      frame = 0;
      if (!dragging) {
        ax += vx;
        ay += vy;
        vx += (rest.x - vx) * 0.03;
        vy += (rest.y - vy) * 0.03;
      }
      items.forEach((item, index) => {
        const spot = place(POINTS[index], ax, ay);
        item.style.transform = spot.transform;
        item.style.opacity = spot.opacity;
        item.style.zIndex = String(spot.zIndex);
        (item.lastElementChild as HTMLElement).style.opacity = spot.front
          ? '1'
          : '0';
      });
      if (visible) frame = requestAnimationFrame(tick);
    };

    const onDown = (event: PointerEvent) => {
      dragging = true;
      lastX = event.clientX;
      lastY = event.clientY;
      globe.setPointerCapture(event.pointerId);
      globe.dataset.dragging = '';
    };
    const onMove = (event: PointerEvent) => {
      if (!dragging) return;
      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;
      lastX = event.clientX;
      lastY = event.clientY;
      ay += dx * 0.01;
      ax -= dy * 0.01;
      vy = dx * 0.002;
      vx = -dy * 0.002;
    };
    const onUp = () => {
      dragging = false;
      delete globe.dataset.dragging;
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !frame) frame = requestAnimationFrame(tick);
    });
    observer.observe(globe);
    globe.addEventListener('pointerdown', onDown);
    globe.addEventListener('pointermove', onMove);
    globe.addEventListener('pointerup', onUp);
    globe.addEventListener('pointercancel', onUp);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      globe.removeEventListener('pointerdown', onDown);
      globe.removeEventListener('pointermove', onMove);
      globe.removeEventListener('pointerup', onUp);
      globe.removeEventListener('pointercancel', onUp);
    };
  }, []);

  return (
    <section className={`relative overflow-hidden px-6 py-32`}>
      <div className="absolute inset-0 opacity-20">
        <div className="matrix-rain" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <SectionHeader
          icon={Code2}
          title="Tech Stack"
          accentClass="text-blue-500"
          gradientClass="from-blue-600 to-blue-400"
        />

        <Reveal y={30} duration={0.8} delay={0.1}>
          <div
            ref={globeRef}
            aria-hidden="true"
            className="relative mx-auto aspect-square w-[min(30rem,88vw)] cursor-grab touch-pan-y select-none [--r:min(12rem,35.2vw)] data-[dragging]:cursor-grabbing"
          >
            {STACKS.map((stack, index) => {
              const spot = place(POINTS[index], START_TILT, 0);
              return (
                <div
                  key={stack.name}
                  data-item
                  className="absolute left-1/2 top-1/2 flex flex-col items-center gap-1.5 will-change-transform"
                  style={{
                    transform: spot.transform,
                    opacity: spot.opacity,
                    zIndex: spot.zIndex,
                  }}
                >
                  <span className="grid h-14 w-14 place-items-center rounded-full border border-gray-200 bg-white shadow-lg shadow-gray-900/10 dark:border-gray-700 dark:bg-gray-800 dark:shadow-black/30">
                    <stack.icon size={28} className={stack.color} />
                  </span>
                  <span
                    className="whitespace-nowrap text-xs font-semibold text-gray-700 transition-opacity duration-300 dark:text-gray-200"
                    style={{ opacity: spot.front ? 1 : 0 }}
                  >
                    {stack.name}
                  </span>
                </div>
              );
            })}
          </div>
          <ul className="sr-only">
            {STACKS.map((stack) => (
              <li key={stack.name}>{stack.name}</li>
            ))}
          </ul>
          <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Drag to spin it.
          </p>
        </Reveal>
      </div>
    </section>
  );
};

export default TechStackSection;
