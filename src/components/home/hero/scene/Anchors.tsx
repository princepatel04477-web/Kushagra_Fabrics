"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3, type Group } from "three";

import { heroPose } from "@/lib/heroTimeline";

import type { HeroProgress } from "../progress";
import { CLOTH_SURFACE } from "./Cloths";

/**
 * Points on each length of cloth (back to front: Oxford, end-on-end,
 * herringbone), projected to canvas pixels every frame the reveal is on
 * screen, so the HTML name tags can sit on the cloth they name.
 */

export interface ScreenPoint {
  readonly x: number;
  readonly y: number;
}

/** Box coordinates of each tag's pin: the left third of each length's top. */
export const ANCHOR_POINTS: ReadonlyArray<readonly [number, number, number]> = [
  [-0.95, CLOTH_SURFACE + 0.04, -0.82],
  [-0.95, CLOTH_SURFACE + 0.03, 0],
  [-0.95, CLOTH_SURFACE + 0.02, 0.82],
];

const world = new Vector3();

interface AnchorsProps {
  readonly progress: HeroProgress;
  readonly onProject: (points: readonly ScreenPoint[]) => void;
}

export function Anchors({ progress, onProject }: AnchorsProps) {
  const groupRef = useRef<Group | null>(null);
  const camera = useThree((state) => state.camera);
  const width = useThree((state) => state.size.width);
  const height = useThree((state) => state.size.height);

  useFrame(() => {
    const group = groupRef.current;
    if (group === null) return;
    if (heroPose(progress.get()).reveal <= 0) return;

    const points: ScreenPoint[] = [];
    for (const child of group.children) {
      child.getWorldPosition(world);
      world.project(camera);
      points.push({ x: ((world.x + 1) / 2) * width, y: ((1 - world.y) / 2) * height });
    }
    onProject(points);
  });

  return (
    <group ref={groupRef}>
      {ANCHOR_POINTS.map((point, index) => (
        <object3D key={index} position={[point[0], point[1], point[2]]} />
      ))}
    </group>
  );
}
