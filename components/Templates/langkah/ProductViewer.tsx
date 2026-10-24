'use client';

import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import Image from 'next/image';
import * as THREE from 'three';
import { shadowTexture, StudioLighting } from '@components/Templates/three/kit';
import { colourway as colourwayOf } from './data';
import Shoe from './Shoe';

function Turntable({
  colourway,
  drag,
  spin,
}: {
  colourway: string;
  drag: React.RefObject<{ target: number; active: boolean }>;
  spin: boolean;
}) {
  const shoe = useRef<THREE.Group>(null);
  const angle = useRef(-0.6);
  // The idle turn builds up here, and pauses while the shoe is dragged.
  const drift = useRef(0);
  const shadow = useMemo(() => shadowTexture(), []);

  useFrame((_, delta) => {
    const group = shoe.current;
    const state = drag.current;
    if (!group || !state) return;
    if (!state.active && spin) drift.current += delta * 0.35;
    angle.current = THREE.MathUtils.damp(
      angle.current,
      state.target + drift.current,
      6,
      delta
    );
    group.rotation.set(0.12, angle.current, 0);
  });

  return (
    <group ref={shoe}>
      <Shoe colourway={colourway} />
      <mesh rotation-x={-Math.PI / 2} position-y={-0.78} scale={[4.2, 1.8, 1]}>
        <planeGeometry />
        <meshBasicMaterial map={shadow} transparent depthWrite={false} />
      </mesh>
    </group>
  );
}

/** The shoe on a turntable: drag to turn it, and it keeps a little momentum. */
export default function ProductViewer({
  colourway,
  label,
}: {
  colourway: string;
  label: string;
}) {
  const drag = useRef({ target: -0.6, active: false });
  const start = useRef({ x: 0, target: 0 });
  const spin = useMemo(
    () =>
      typeof window !== 'undefined' &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );

  useEffect(() => {
    const stop = () => {
      drag.current.active = false;
    };
    window.addEventListener('pointerup', stop);
    return () => window.removeEventListener('pointerup', stop);
  }, []);

  return (
    <div
      role="img"
      aria-label={`${label} in 3D. Drag to turn it.`}
      className="h-full w-full cursor-grab touch-pan-y active:cursor-grabbing"
      onPointerDown={(event) => {
        drag.current.active = true;
        start.current = { x: event.clientX, target: drag.current.target };
      }}
      onPointerMove={(event) => {
        if (!drag.current.active) return;
        drag.current.target =
          start.current.target + (event.clientX - start.current.x) * 0.012;
      }}
    >
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0.6, 7.4], fov: 30 }}
        gl={{ antialias: true, alpha: true }}
        scene={{ environmentIntensity: 0.9 }}
        fallback={
          <span className="relative block h-full w-full">
            <Image
              src={colourwayOf(colourway).image}
              alt=""
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-contain p-8"
            />
          </span>
        }
      >
        <StudioLighting intensity={1.7} />
        <Suspense fallback={null}>
          <Turntable colourway={colourway} drag={drag} spin={spin} />
        </Suspense>
      </Canvas>
    </div>
  );
}
