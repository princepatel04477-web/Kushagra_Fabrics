"use client";

import { Suspense, useEffect, useLayoutEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { NeutralToneMapping, type PerspectiveCamera } from "three";

import type { HeroProgress } from "./progress";
import { Box } from "./scene/Box";
import { Lights } from "./scene/Lights";

/**
 * The hero's WebGL stage. It renders on demand only: a frame is drawn when
 * the scroll progress changes (or the canvas resizes), never on an idle loop.
 * Loaded with next/dynamic and ssr: false — three never reaches the server.
 */

/** Ask for a frame whenever GSAP writes a new progress value. */
function Invalidator({ progress }: { progress: HeroProgress }) {
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => progress.subscribe(() => invalidate()), [progress, invalidate]);
  return null;
}

/**
 * The canvas spans the stage edge to edge, but the box is framed to the right
 * of the copy: shift the camera's view window instead of moving the box, so
 * the perspective stays that of a lens pointed straight at it.
 */
function Framing({ shift }: { shift: number }) {
  const camera = useThree((state) => state.camera);
  const width = useThree((state) => state.size.width);
  const height = useThree((state) => state.size.height);
  const invalidate = useThree((state) => state.invalidate);

  useLayoutEffect(() => {
    const lens = camera as PerspectiveCamera;
    if (typeof lens.setViewOffset !== "function") return;
    lens.setViewOffset(width, height, -width * shift, 0, width, height);
    invalidate();
    return () => lens.clearViewOffset();
  }, [camera, width, height, shift, invalidate]);

  return null;
}

interface HeroCanvasProps {
  readonly progress: HeroProgress;
  /** Fraction of the canvas width to push the box right by. */
  readonly shift?: number;
  readonly className?: string;
}

export default function HeroCanvas({ progress, shift = 0, className }: HeroCanvasProps) {
  return (
    <Canvas
      className={className}
      frameloop="demand"
      shadows="variance"
      dpr={[1, 1.75]}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      camera={{ fov: 22, near: 0.5, far: 60, position: [0, 8.5, 14.5] }}
      onCreated={({ gl, camera }) => {
        gl.toneMapping = NeutralToneMapping;
        gl.toneMappingExposure = 1;
        camera.lookAt(0, 0.35, 0);
      }}
      aria-hidden="true"
    >
      <Invalidator progress={progress} />
      <Framing shift={shift} />
      <Lights />
      <Suspense fallback={null}>
        <group rotation={[0, -0.42, 0]}>
          <Box progress={progress} />
        </group>
      </Suspense>
    </Canvas>
  );
}
