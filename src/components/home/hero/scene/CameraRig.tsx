"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera, Vector3 } from "three";

import { heroPose } from "@/lib/heroTimeline";

import type { HeroProgress } from "../progress";

/**
 * One camera, one continuous move: a slow dolly in while the box is opened,
 * then a tilt down over the open box for the reveal.
 *
 * The box is framed off-centre by shifting the lens's view window
 * (setViewOffset) rather than moving the camera, so the perspective stays
 * that of a lens pointed straight at the box. Because the vertical field of
 * view is fixed, the box's size on screen follows the canvas height and its
 * centre sits at (0.5 + shift) of the width at every aspect ratio — which is
 * what lets a still poster stand in for the first frame exactly.
 */

export type HeroLayout = "desktop" | "mobile";

interface Shot {
  readonly position: readonly [number, number, number];
  readonly target: readonly [number, number, number];
}

interface Rig {
  readonly fov: number;
  /** Fraction of the canvas width the box sits right of centre. */
  readonly shift: number;
  readonly start: Shot;
  readonly approach: Shot;
  readonly reveal: Shot;
}

export const RIGS: Record<HeroLayout, Rig> = {
  desktop: {
    fov: 22,
    shift: 0.2,
    start: { position: [0, 8.7, 14.9], target: [0, 0.35, 0] },
    approach: { position: [0, 8.3, 13.9], target: [0, 0.4, 0] },
    reveal: { position: [0.3, 14.2, 11.0], target: [0, 0.2, -0.6] },
  },
  mobile: {
    fov: 20,
    shift: 0,
    start: { position: [0, 9.4, 15.8], target: [0, 0.45, 0.35] },
    approach: { position: [0, 9.0, 14.8], target: [0, 0.45, 0.3] },
    reveal: { position: [0.35, 20.2, 15.9], target: [0, 0.2, -0.45] },
  },
};

const from = new Vector3();
const to = new Vector3();
const look = new Vector3();
const lookTo = new Vector3();

function blend(out: Vector3, rig: Rig, key: "position" | "target", approach: number, reveal: number) {
  const a = rig.start[key];
  const b = rig.approach[key];
  const c = rig.reveal[key];
  from.set(a[0], a[1], a[2]).lerp(to.set(b[0], b[1], b[2]), approach);
  out.copy(from).lerp(to.set(c[0], c[1], c[2]), reveal);
}

interface CameraRigProps {
  readonly progress: HeroProgress;
  readonly layout: HeroLayout;
  /** Follow the pointer by a degree or so (desktop, motion allowed). */
  readonly parallax: boolean;
  /** Overrides the rig's horizontal framing. */
  readonly shift?: number | undefined;
}

export function CameraRig({ progress, layout, parallax, shift }: CameraRigProps) {
  const camera = useThree((state) => state.camera);
  const width = useThree((state) => state.size.width);
  const height = useThree((state) => state.size.height);
  const invalidate = useThree((state) => state.invalidate);
  const rig = RIGS[layout];
  const offset = shift ?? rig.shift;

  const pointer = useRef({ x: 0, y: 0 });
  const eased = useRef({ x: 0, y: 0 });

  useLayoutEffect(() => {
    if (!(camera instanceof PerspectiveCamera)) return;
    camera.fov = rig.fov;
    camera.setViewOffset(width, height, -width * offset, 0, width, height);
    camera.updateProjectionMatrix();
    invalidate();
    return () => camera.clearViewOffset();
  }, [camera, width, height, rig, offset, invalidate]);

  useEffect(() => {
    if (!parallax) return;
    const move = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (event.clientY / window.innerHeight) * 2 - 1;
      invalidate();
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [parallax, invalidate]);

  useFrame(() => {
    const { approach, reveal } = heroPose(progress.get());
    blend(look, rig, "position", approach, reveal);
    blend(lookTo, rig, "target", approach, reveal);

    // Ease toward the pointer; keep asking for frames until settled.
    const target = parallax ? pointer.current : { x: 0, y: 0 };
    const e = eased.current;
    e.x += (target.x - e.x) * 0.08;
    e.y += (target.y - e.y) * 0.08;
    if (Math.abs(target.x - e.x) > 0.001 || Math.abs(target.y - e.y) > 0.001) invalidate();

    // The pointer's pull fades out over the reveal, so the end frame is the
    // poster's exact framing and the cloth tags sit true.
    const pull = 1 - reveal;
    camera.position.set(look.x + e.x * 0.32 * pull, look.y - e.y * 0.18 * pull, look.z);
    camera.lookAt(lookTo);
  });

  return null;
}
