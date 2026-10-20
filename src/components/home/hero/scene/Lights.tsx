"use client";

import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import {
  Color,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  PMREMGenerator,
  Scene,
  type SpotLight,
} from "three";

/**
 * Studio light matching hero-box.jpg.
 *
 * Reflections come from a small environment of light cards rendered once
 * into a PMREM map: a broad soft window at the top left (the key), a dim card
 * on the right (fill), a thin strip behind (rim) that lifts the navy edges
 * off the pale page, and a pale floor bounce. No HDR file is downloaded.
 *
 * Direct light is a wide spot standing in for the same window: its penumbra
 * gives the lid the gentle fall-off of daylight across a table, and it casts
 * the one soft shadow (VSM) onto a shadow-only floor. The canvas is
 * transparent, so the page's shirting shows through and the floor itself is
 * never drawn — only the shadow lying on it.
 */

interface Card {
  readonly color: string;
  readonly intensity: number;
  readonly position: readonly [number, number, number];
  readonly size: readonly [number, number];
}

const CARDS: readonly Card[] = [
  { color: "#fffaf4", intensity: 3.2, position: [-5, 6, 3], size: [8, 5] },
  { color: "#e9eef6", intensity: 0.7, position: [6, 2.5, 2], size: [5, 4] },
  { color: "#ffffff", intensity: 1.6, position: [0, 3, -6], size: [10, 0.8] },
  { color: "#eef1f4", intensity: 0.5, position: [0, -4, 0], size: [12, 12] },
];

function StudioEnvironment() {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    const studio = new Scene();
    studio.background = new Color("#000000");
    const disposables: Array<{ dispose: () => void }> = [];

    for (const card of CARDS) {
      const geometry = new PlaneGeometry(card.size[0], card.size[1]);
      const material = new MeshBasicMaterial({
        color: new Color(card.color).multiplyScalar(card.intensity),
        side: DoubleSide,
        toneMapped: false,
      });
      const mesh = new Mesh(geometry, material);
      mesh.position.set(card.position[0], card.position[1], card.position[2]);
      mesh.lookAt(0, 0, 0);
      studio.add(mesh);
      disposables.push(geometry, material);
    }

    const generator = new PMREMGenerator(gl);
    const target = generator.fromScene(studio, 0.02);
    scene.environment = target.texture;
    invalidate();

    return () => {
      scene.environment = null;
      target.dispose();
      generator.dispose();
      for (const item of disposables) item.dispose();
    };
  }, [gl, scene, invalidate]);

  return null;
}

/**
 * Phones render a smaller, cheaper shadow: half the map with half the blur
 * radius looks the same at their size, at a quarter of the cost.
 */
const SHADOW = {
  desktop: { size: 1024, radius: 28, samples: 32 },
  mobile: { size: 512, radius: 14, samples: 12 },
} as const;

export function Lights({ quality }: { quality: keyof typeof SHADOW }) {
  const shadow = SHADOW[quality];
  const keyRef = useRef<SpotLight | null>(null);

  useEffect(() => {
    const key = keyRef.current;
    if (key === null) return;
    key.target.position.set(0.4, 0, 0.3);
    key.target.updateMatrixWorld();
  }, []);

  return (
    <>
      <StudioEnvironment />
      <ambientLight intensity={0.3} />
      <spotLight
        ref={keyRef}
        position={[-3.2, 11, 3.4]}
        angle={0.52}
        penumbra={1}
        decay={0}
        intensity={2.6}
        color="#fffcf8"
        castShadow
        shadow-mapSize={[shadow.size, shadow.size]}
        shadow-bias={-0.0003}
        shadow-normalBias={0.015}
        shadow-radius={shadow.radius}
        shadow-blurSamples={shadow.samples}
        shadow-camera-near={5}
        shadow-camera-far={20}
      />

      {/* The floor: invisible except for the shadow that falls on it. Kept
          inside the key's cone, or the edge of its shadow map shows. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[5.5, 48]} />
        <shadowMaterial color="#1b2433" opacity={0.16} />
      </mesh>
    </>
  );
}
