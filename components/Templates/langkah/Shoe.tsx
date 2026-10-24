'use client';

import { useEffect, useMemo, useState, type ComponentProps } from 'react';
import { useLoader, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { colourway as colourwayOf, COLOURWAYS, MODEL_URL } from './data';

/** The Strider model, loaded once and shared by every view of it. */
export function useShoeModel() {
  return useLoader(GLTFLoader, MODEL_URL, (loader) => {
    loader.setMeshoptDecoder(MeshoptDecoder);
  });
}

const textures = new Map<string, Promise<THREE.Texture>>();

/** A colourway's painted texture, fetched once however many shoes use it. */
function loadColourway(id: string) {
  const url = colourwayOf(id).texture;
  let texture = textures.get(url);
  if (!texture) {
    texture = new THREE.TextureLoader().loadAsync(url).then((map) => {
      map.flipY = false;
      map.colorSpace = THREE.SRGBColorSpace;
      map.anisotropy = 8;
      return map;
    });
    textures.set(url, texture);
  }
  return texture;
}

function paint(material: THREE.MeshStandardMaterial, map: THREE.Texture) {
  material.map = map;
  material.needsUpdate = true;
}

/**
 * The shoe at a standard size: about 3 units long, centred on the origin,
 * toe pointing along +x. It keeps its colour until the next one has loaded.
 */
export default function Shoe({
  colourway,
  ...props
}: { colourway: string } & ComponentProps<'group'>) {
  const gltf = useShoeModel();
  const { invalidate } = useThree();
  const [painted, setPainted] = useState(false);
  const { scene, material } = useMemo(() => {
    const clone = gltf.scene.clone(true);
    const meshes: THREE.Mesh[] = [];
    clone.traverse((object) => {
      if ((object as THREE.Mesh).isMesh) meshes.push(object as THREE.Mesh);
    });
    const shared = (meshes[0].material as THREE.MeshStandardMaterial).clone();
    for (const mesh of meshes) {
      mesh.material = shared;
      mesh.castShadow = true;
    }
    return { scene: clone, material: shared };
  }, [gltf]);

  useEffect(() => {
    let live = true;
    void loadColourway(colourway).then((map) => {
      if (!live) return;
      paint(material, map);
      setPainted(true);
      invalidate();
    });
    return () => {
      live = false;
    };
  }, [material, colourway, invalidate]);

  useEffect(() => {
    if (!painted) return;
    for (const item of COLOURWAYS) void loadColourway(item.id);
  }, [painted]);

  return (
    <group {...props} visible={painted}>
      <primitive object={scene} scale={10} position={[-0.016, -0.76, -0.05]} />
    </group>
  );
}
