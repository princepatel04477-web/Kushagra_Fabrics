"use client";

import { Suspense, useEffect, useMemo } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { NeutralToneMapping } from "three";

import type { HeroProgress } from "./progress";
import { Anchors, type ScreenPoint } from "./scene/Anchors";
import { Box, CONTACT } from "./scene/Box";
import { CameraRig, type HeroLayout } from "./scene/CameraRig";
import { Cloths } from "./scene/Cloths";
import { Lid } from "./scene/Lid";
import { Lights } from "./scene/Lights";
import { createHeroMaterials } from "./scene/materials";
import { Ribbon } from "./scene/Ribbon";
import { Tissue } from "./scene/Tissue";

/**
 * The hero's WebGL stage. It renders on demand only — a frame is drawn when
 * the scroll progress changes, the canvas resizes or the pointer moves —
 * never on an idle loop. Loaded with next/dynamic and ssr: false, so three
 * never reaches the server or the first-load bundle.
 */

/** Ask for a frame whenever GSAP writes a new progress value. */
function Invalidator({ progress }: { progress: HeroProgress }) {
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => progress.subscribe(() => invalidate()), [progress, invalidate]);
  return null;
}

/** Mounts once everything inside Suspense has loaded and a frame is drawn. */
function Ready({ onReady }: { onReady?: () => void }) {
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    invalidate();
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => onReady?.());
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, [invalidate, onReady]);
  return null;
}

interface SceneProps {
  readonly progress: HeroProgress;
  readonly onAnchors?: (points: readonly ScreenPoint[]) => void;
}

function Scene({ progress, onAnchors }: SceneProps) {
  const materials = useMemo(() => createHeroMaterials(CONTACT.w / CONTACT.d), []);
  useEffect(() => () => materials.dispose(), [materials]);

  return (
    <group rotation={[0, -0.42, 0]}>
      <Box materials={materials} />
      <Cloths progress={progress} materials={materials} />
      <Tissue progress={progress} materials={materials} />
      <Lid progress={progress} materials={materials} />
      <Ribbon progress={progress} materials={materials} />
      {onAnchors !== undefined ? <Anchors progress={progress} onProject={onAnchors} /> : null}
    </group>
  );
}

export interface HeroSceneProps {
  readonly progress: HeroProgress;
  readonly layout: HeroLayout;
  readonly parallax?: boolean;
  readonly onReady?: () => void;
  /** Canvas pixel positions of the three cloth tags, while the reveal shows. */
  readonly onAnchors?: (points: readonly ScreenPoint[]) => void;
  /** Overrides the layout's horizontal framing (the poster renders use 0). */
  readonly shift?: number;
  readonly className?: string;
}

export default function HeroScene({
  progress,
  layout,
  parallax = false,
  onReady,
  onAnchors,
  shift,
  className,
}: HeroSceneProps) {
  return (
    <Canvas
      className={className}
      frameloop="demand"
      shadows="variance"
      dpr={layout === "desktop" ? [1, 1.75] : [1, 1.5]}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      camera={{ fov: 22, near: 0.5, far: 60, position: [0, 8.5, 14.5] }}
      onCreated={({ gl }) => {
        gl.toneMapping = NeutralToneMapping;
        gl.toneMappingExposure = 1;
      }}
      aria-hidden="true"
    >
      <Invalidator progress={progress} />
      <CameraRig progress={progress} layout={layout} parallax={parallax} shift={shift} />
      <Lights quality={layout} />
      <Suspense fallback={null}>
        <Scene progress={progress} onAnchors={onAnchors} />
        <Ready onReady={onReady} />
      </Suspense>
    </Canvas>
  );
}
