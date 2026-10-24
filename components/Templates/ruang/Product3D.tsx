'use client';

import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  shadowTexture,
  speckleTexture,
  StudioLighting,
  turnProfile,
} from '@components/Templates/three/kit';
import type { Model3D } from './data';

const DISTANCE = 4.5;

// Each piece is turned from its outer profile, [radius, height] from the
// centre of the base out to the rim, like a potter's wheel.
const PROFILES: Record<
  Model3D['shape'],
  /** `elevation` is the camera's angle above the table, in degrees. */
  { outline: [number, number][]; wall: number; elevation: number }
> = {
  cup: {
    outline: [
      [0, 0.02],
      [0.5, 0.02],
      [0.55, 0],
      [0.61, 0.04],
      [0.7, 0.42],
      [0.78, 0.96],
      [0.8, 1.45],
    ],
    wall: 0.07,
    elevation: 16,
  },
  plate: {
    outline: [
      [0, 0.035],
      [0.62, 0.03],
      [0.66, 0],
      [0.74, 0],
      [0.8, 0.05],
      [1.3, 0.1],
      [1.56, 0.2],
      [2.0, 0.27],
    ],
    wall: 0.07,
    elevation: 42,
  },
  bowl: {
    outline: [
      [0, 0.02],
      [0.42, 0.02],
      [0.46, 0],
      [0.54, 0.05],
      [0.95, 0.3],
      [1.28, 0.7],
      [1.45, 1.08],
    ],
    wall: 0.08,
    elevation: 26,
  },
  vase: {
    outline: [
      [0, 0],
      [0.45, 0],
      [0.82, 0.22],
      [1.0, 0.62],
      [0.94, 1.04],
      [0.6, 1.34],
      [0.3, 1.5],
      [0.27, 1.64],
    ],
    wall: 0.06,
    elevation: 14,
  },
};

/** The piece at a standard size: it fits a sphere of radius 1, base at 0. */
function turnedGeometry(shape: Model3D['shape']) {
  const { outline, wall } = PROFILES[shape];
  const geometry = turnProfile(outline, wall);
  geometry.computeBoundingSphere();
  const fit = 1 / geometry.boundingSphere!.radius;
  geometry.scale(fit, fit, fit);
  geometry.computeBoundingBox();
  geometry.translate(0, -geometry.boundingBox!.min.y, 0);
  return geometry;
}

function Controls({ spin }: { spin: boolean }) {
  const { camera, gl, invalidate } = useThree();
  const controls = useRef<OrbitControls | null>(null);

  useEffect(() => {
    const orbit = new OrbitControls(camera, gl.domElement);
    // Aim a little low so the piece sits above the hint at the bottom.
    orbit.target.set(0, -0.15, 0);
    orbit.enableDamping = true;
    orbit.enablePan = false;
    // Wheel and pinch scroll the page; turning is the point here.
    orbit.enableZoom = false;
    orbit.minPolarAngle = 0.25;
    orbit.maxPolarAngle = Math.PI * 0.48;
    orbit.autoRotate = spin;
    orbit.autoRotateSpeed = 1.6;
    const redraw = () => invalidate();
    const stopSpinning = () => {
      orbit.autoRotate = false;
    };
    orbit.addEventListener('change', redraw);
    orbit.addEventListener('start', stopSpinning);
    controls.current = orbit;
    invalidate();
    return () => {
      orbit.removeEventListener('change', redraw);
      orbit.removeEventListener('start', stopSpinning);
      orbit.dispose();
      controls.current = null;
    };
  }, [camera, gl, invalidate, spin]);

  useFrame((_, delta) => controls.current?.update(delta));
  return null;
}

function Piece({
  model,
  geometry,
  color,
  scale,
}: {
  model: Model3D;
  geometry: THREE.LatheGeometry;
  color: string;
  scale: number;
}) {
  const { invalidate } = useThree();
  const height = geometry.boundingBox!.max.y;
  const speckles = useMemo(
    () => (model.finish === 'speckled' ? speckleTexture() : null),
    [model.finish]
  );
  const shadow = useMemo(() => shadowTexture(), []);
  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        map: speckles,
        roughness: model.finish === 'speckled' ? 0.42 : 0.85,
        clearcoat: model.finish === 'speckled' ? 0.35 : 0.05,
        clearcoatRoughness: 0.4,
        side: THREE.DoubleSide,
      }),
    [model.finish, speckles]
  );
  const target = useMemo(() => new THREE.Color(color), [color]);
  const group = useRef<THREE.Group>(null);
  const first = useRef(true);

  // The glaze and the size ease to a new choice instead of jumping.
  useFrame(() => {
    const piece = group.current;
    if (!piece) return;
    if (first.current) {
      material.color.copy(target);
      piece.scale.setScalar(scale);
      first.current = false;
    }
    // Keep the piece centred in the frame at any size.
    piece.position.y = (-height * piece.scale.x) / 2;
    const { r, g, b } = material.color;
    const colorDone =
      Math.abs(r - target.r) + Math.abs(g - target.g) + Math.abs(b - target.b) <
      0.003;
    const sizeDone = Math.abs(piece.scale.x - scale) < 0.001;
    if (colorDone) material.color.copy(target);
    else material.color.lerp(target, 0.12);
    if (!sizeDone)
      piece.scale.setScalar(THREE.MathUtils.lerp(piece.scale.x, scale, 0.15));
    if (!colorDone || !sizeDone) invalidate();
  });

  useEffect(() => invalidate(), [color, scale, invalidate]);
  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
      speckles?.dispose();
      shadow.dispose();
    },
    [geometry, material, speckles, shadow]
  );

  return (
    <group ref={group}>
      <mesh geometry={geometry} material={material} />
      <mesh rotation-x={-Math.PI / 2} position-y={0.002} scale={2.6}>
        <planeGeometry />
        <meshBasicMaterial map={shadow} transparent depthWrite={false} />
      </mesh>
    </group>
  );
}

/** A ceramic piece in 3D that visitors turn by dragging; tinted by the chosen glaze. */
export default function Product3D({
  model,
  color,
  scale = 1,
  label,
}: {
  model: Model3D;
  color: string;
  scale?: number;
  label: string;
}) {
  const reducedMotion = useMemo(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );
  const geometry = useMemo(() => turnedGeometry(model.shape), [model.shape]);
  const elevation = THREE.MathUtils.degToRad(PROFILES[model.shape].elevation);
  const azimuth = THREE.MathUtils.degToRad(38);
  const camera: [number, number, number] = [
    DISTANCE * Math.cos(elevation) * Math.sin(azimuth),
    DISTANCE * Math.sin(elevation),
    DISTANCE * Math.cos(elevation) * Math.cos(azimuth),
  ];

  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 1.75]}
      camera={{ position: camera, fov: 34 }}
      gl={{ antialias: true, alpha: true }}
      scene={{ environmentIntensity: 0.75 }}
      aria-label={`${label} in 3D. Drag to turn it.`}
      role="img"
      fallback={
        <p className="flex h-full items-center justify-center p-6 text-center text-sm text-tpl-muted">
          3D needs a newer browser. The photos show every glaze.
        </p>
      }
      className="cursor-grab active:cursor-grabbing"
    >
      <StudioLighting />
      <Controls spin={!reducedMotion} />
      <Piece model={model} geometry={geometry} color={color} scale={scale} />
    </Canvas>
  );
}
