"use client";

import { useEffect, useRef } from "react";
import { Environment, Lightformer } from "@react-three/drei";
import type { SpotLight } from "three";

/**
 * Studio light matching hero-box.jpg: a broad soft window from the top left
 * (the key), a dim card on the right (fill), and a thin strip behind (rim)
 * that lifts the navy edges off the pale page. The environment is built from
 * these light cards locally, so no HDR file is downloaded.
 *
 * The key is a wide spot rather than a directional light: its penumbra
 * gives the lid the gentle fall-off of a window across a table, and it casts
 * the one soft shadow (VSM) onto a shadow-only floor. The canvas is
 * transparent, so the page's shirting shows through and the floor itself is
 * never drawn, only the shadow lying on it.
 */
export function Lights() {
  const keyRef = useRef<SpotLight | null>(null);

  useEffect(() => {
    const key = keyRef.current;
    if (key === null) return;
    key.target.position.set(0.4, 0, 0.3);
    key.target.updateMatrixWorld();
  }, []);

  return (
    <>
      <ambientLight intensity={0.3} />
      <spotLight
        ref={keyRef}
        position={[-3.2, 11, 3.4]}
        angle={0.52}
        penumbra={1}
        decay={0}
        intensity={2.6}
        color="#fffaf3"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0003}
        shadow-normalBias={0.015}
        shadow-radius={28}
        shadow-blurSamples={32}
        shadow-camera-near={5}
        shadow-camera-far={20}
      />

      <Environment resolution={256} frames={1}>
        <Lightformer
          form="rect"
          intensity={3.2}
          color="#fff8ef"
          position={[-5, 6, 3]}
          scale={[8, 5, 1]}
          target={[0, 0, 0]}
        />
        <Lightformer
          form="rect"
          intensity={0.7}
          color="#e9eef6"
          position={[6, 2.5, 2]}
          scale={[5, 4, 1]}
          target={[0, 0, 0]}
        />
        <Lightformer
          form="rect"
          intensity={1.6}
          color="#ffffff"
          position={[0, 3, -6]}
          scale={[10, 0.8, 1]}
          target={[0, 0, 0]}
        />
        <Lightformer
          form="rect"
          intensity={0.5}
          color="#eef1f4"
          position={[0, -4, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[12, 12, 1]}
        />
      </Environment>

      {/* The floor: invisible except for the shadow that falls on it. Kept
          inside the key's cone, or the edge of its shadow map shows. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[5.5, 48]} />
        <shadowMaterial color="#1b2433" opacity={0.16} />
      </mesh>
    </>
  );
}
