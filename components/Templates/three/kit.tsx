'use client';

import { useEffect, useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

// @react-three/fiber 9 still creates a THREE.Clock, which three r183+ flags
// as deprecated on every canvas. Drop that one notice; pass the rest through.
THREE.setConsoleFunction((type, message, ...params) => {
  if (message.startsWith('THREE.Clock:')) return;
  console[type](message, ...params);
});

/**
 * A thrown piece turned from its outer profile, [radius, height] from the
 * centre of the base out to the rim, with a wall of the given thickness and a
 * rounded lip, like a potter's wheel.
 */
export function turnProfile(outline: [number, number][], wall: number) {
  const outer = new THREE.SplineCurve(
    outline.map(([r, y]) => new THREE.Vector2(r, y))
  ).getSpacedPoints(48);
  const inner = outer.map((point, index) => {
    const prev = outer[Math.max(index - 1, 0)];
    const next = outer[Math.min(index + 1, outer.length - 1)];
    const tangent = next.clone().sub(prev).normalize();
    const inward = new THREE.Vector2(-tangent.y, tangent.x);
    return point.clone().addScaledVector(inward, wall);
  });
  inner[0].x = 0;
  const lip = outer[outer.length - 1];
  const lipInner = inner[inner.length - 1];
  const centre = lip.clone().add(lipInner).multiplyScalar(0.5);
  const radius = lip.distanceTo(lipInner) / 2;
  const start = Math.atan2(lip.y - centre.y, lip.x - centre.x);
  const rim = Array.from({ length: 7 }, (_, i) => {
    const angle = start + (Math.PI * (i + 1)) / 8;
    return new THREE.Vector2(
      centre.x + Math.cos(angle) * radius,
      centre.y + Math.sin(angle) * radius
    );
  });
  const points = [...outer, ...rim, ...inner.reverse()].map(
    (point) => new THREE.Vector2(Math.max(point.x, 0), point.y)
  );
  return new THREE.LatheGeometry(points, 96);
}

/** A solid piece, such as a lid, turned from its full outline. */
export function turnSolid(outline: [number, number][]) {
  const points = new THREE.SplineCurve(
    outline.map(([r, y]) => new THREE.Vector2(r, y))
  )
    .getSpacedPoints(64)
    .map((point) => new THREE.Vector2(Math.max(point.x, 0), point.y));
  return new THREE.LatheGeometry(points, 96);
}

function canvasTexture(
  width: number,
  height: number,
  paint: (context: CanvasRenderingContext2D) => void
) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  paint(canvas.getContext('2d')!);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.anisotropy = 4;
  return texture;
}

/** Dark flecks in a speckled glaze, tinted by the glaze colour. */
export function speckleTexture() {
  return canvasTexture(1024, 512, (context) => {
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, 1024, 512);
    for (let i = 0; i < 2400; i++) {
      context.fillStyle = `rgba(58, 44, 34, ${0.3 + Math.random() * 0.5})`;
      context.beginPath();
      context.arc(
        Math.random() * 1024,
        Math.random() * 512,
        0.6 + Math.random() * 1.8,
        0,
        Math.PI * 2
      );
      context.fill();
    }
  });
}

/** Wood grain that turns into growth rings across a lathe-turned top. */
export function grainTexture() {
  return canvasTexture(256, 1024, (context) => {
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, 256, 1024);
    let y = 0;
    while (y < 1024) {
      const band = 6 + Math.random() * 18;
      context.fillStyle = `rgba(70, 40, 20, ${0.08 + Math.random() * 0.18})`;
      context.fillRect(0, y, 256, band * 0.45);
      y += band;
    }
  });
}

/** A soft round shadow under a piece. */
export function shadowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 256;
  const context = canvas.getContext('2d')!;
  const gradient = context.createRadialGradient(128, 128, 0, 128, 128, 128);
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0.38)');
  gradient.addColorStop(0.55, 'rgba(0, 0, 0, 0.12)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(canvas);
}

/** Soft studio light: a room reflected in the glaze, plus one key light. */
export function StudioLighting({ intensity = 1.5 }: { intensity?: number }) {
  const { gl } = useThree();
  const environment = useMemo(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const texture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
    return texture;
  }, [gl]);
  useEffect(() => () => environment.dispose(), [environment]);
  return (
    <>
      <primitive object={environment} attach="environment" />
      <directionalLight position={[-2.5, 4, 3]} intensity={intensity} />
    </>
  );
}
