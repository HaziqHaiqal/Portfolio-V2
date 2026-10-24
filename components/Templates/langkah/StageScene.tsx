'use client';

import { Suspense, useEffect, useMemo, useRef, type RefObject } from 'react';
import Image from 'next/image';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { shadowTexture, StudioLighting } from '@components/Templates/three/kit';
import { colourway as colourwayOf } from './data';
import Shoe from './Shoe';

/** Points on the shoe that the material notes follow, in the shoe's space. */
export const HOTSPOTS = [
  [0.95, 0.08, 0.36],
  [-0.35, -0.45, 0.42],
  [0.75, -0.68, 0.3],
] as const;

const REST = -0.55;
const damp = THREE.MathUtils.damp;

function Rig({
  colourway,
  drag,
  labels,
  fill,
  still,
}: {
  colourway: string;
  drag: RefObject<{ target: number; active: boolean }>;
  labels: RefObject<(HTMLElement | null)[]>;
  fill: number;
  still: boolean;
}) {
  const { camera, size } = useThree();
  const shoe = useRef<THREE.Group>(null);
  const blob = useRef<THREE.Mesh>(null);
  const clock = useRef(0);
  const spin = useRef(0);
  const angle = useRef(REST);
  const point = useMemo(() => new THREE.Vector3(), []);
  const centre = useMemo(() => new THREE.Vector3(), []);
  const shadow = useMemo(() => shadowTexture(), []);
  const first = useRef(true);

  // A new colour turns the shoe once, so the change reads as an event.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (!still) spin.current += Math.PI * 2;
  }, [colourway, still]);

  useFrame((_, delta) => {
    const group = shoe.current;
    const state = drag.current;
    if (!group || !state) return;
    if (!still) clock.current += delta;

    // Fit the shoe to its share of the stage, whatever the screen.
    const distance = camera.position.length();
    const visible =
      2 *
      distance *
      Math.tan(
        THREE.MathUtils.degToRad((camera as THREE.PerspectiveCamera).fov / 2)
      ) *
      (size.width / size.height);
    const scale = THREE.MathUtils.clamp((visible * fill) / 3, 0.55, 1.25);
    group.scale.setScalar(scale);

    const sway = still ? 0 : Math.sin(clock.current * 0.6) * 0.18;
    angle.current = damp(
      angle.current,
      REST + state.target + sway + spin.current,
      state.active ? 10 : 3.2,
      delta
    );
    group.rotation.set(0.1, angle.current, 0);
    group.position.y = still ? 0 : Math.sin(clock.current * 1.2) * 0.05;
    if (blob.current) {
      blob.current.scale.set(4.2 * scale, 1.8 * scale, 1);
      blob.current.position.y = -0.95 * scale;
    }

    group.getWorldPosition(centre);
    HOTSPOTS.forEach((hotspot, index) => {
      const label = labels.current?.[index];
      if (!label) return;
      point.set(hotspot[0], hotspot[1], hotspot[2]);
      group.localToWorld(point);
      // Notes fade out as their spot turns away from the camera.
      const facing = THREE.MathUtils.smoothstep(
        (point.z - centre.z) / scale,
        0.15,
        0.3
      );
      point.project(camera);
      const x = (point.x * 0.5 + 0.5) * size.width;
      const y = (-point.y * 0.5 + 0.5) * size.height;
      label.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      label.style.opacity = (state.active ? 0 : facing).toFixed(3);
      label.style.visibility = facing < 0.05 ? 'hidden' : 'visible';
    });
  });

  return (
    <>
      <mesh ref={blob} rotation-x={-Math.PI / 2}>
        <planeGeometry />
        <meshBasicMaterial map={shadow} transparent depthWrite={false} />
      </mesh>
      <group ref={shoe}>
        <Shoe colourway={colourway} />
      </group>
    </>
  );
}

/** The product stage's shoe: rests three-quarter on, drag to turn it. */
export default function StageScene({
  colourway,
  label,
  labels,
  fill,
  active,
  still,
}: {
  colourway: string;
  label: string;
  labels: RefObject<(HTMLElement | null)[]>;
  /** How much of the canvas width the shoe may take, from 0 to 1. */
  fill: number;
  active: boolean;
  still: boolean;
}) {
  const drag = useRef({ target: 0, active: false });
  const start = useRef({ x: 0, target: 0 });

  useEffect(() => {
    const stop = () => {
      drag.current.active = false;
    };
    window.addEventListener('pointerup', stop);
    window.addEventListener('pointercancel', stop);
    return () => {
      window.removeEventListener('pointerup', stop);
      window.removeEventListener('pointercancel', stop);
    };
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
        frameloop={active ? 'always' : 'never'}
        dpr={[1, 1.75]}
        camera={{ position: [0, 0.55, 7.6], fov: 30 }}
        gl={{ antialias: true, alpha: true }}
        scene={{ environmentIntensity: 0.9 }}
        fallback={
          <span className="relative block h-full w-full">
            <Image
              src={colourwayOf(colourway).image}
              alt=""
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-contain p-6"
            />
          </span>
        }
      >
        <StudioLighting intensity={1.6} />
        <Suspense fallback={null}>
          <Rig
            colourway={colourway}
            drag={drag}
            labels={labels}
            fill={fill}
            still={still}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
