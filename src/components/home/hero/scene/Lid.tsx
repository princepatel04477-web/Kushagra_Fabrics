"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { SRGBColorSpace, TextureLoader, type Group } from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

import { heroPose } from "@/lib/heroTimeline";

import type { HeroProgress } from "../progress";
import { BOX, LID, frameGeometry } from "./geometry";
import type { HeroMaterials } from "./materials";

/**
 * The lid: a top plate, one bevelled skirt and the paper label carrying the
 * logo. Its origin is the centre of its top surface.
 *
 * It lifts straight up — slowly at first, as a snug lid does — then is
 * carried back and set down behind the box, propped at about 24° with
 * its label to the camera, the way the lid stands in hero-box.jpg.
 */

/** How far the lid leans back from lying flat, in radians (about 24°). */
const LEAN = 0.42;

const CLOSED = { y: LID.top, z: 0 } as const;
const LIFTED = { y: LID.top + 0.85, z: 0.1, tilt: -0.06 } as const;
/** Front skirt corner on the table, top edge just clear of the back wall. */
const SET = {
  y: LID.skirt * Math.cos(LEAN) + (LID.d / 2) * Math.sin(LEAN),
  z: -BOX.d / 2 - 0.06 - (LID.d / 2) * Math.cos(LEAN),
  x: -0.75,
  roll: -0.035,
} as const;

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

interface LidProps {
  readonly progress: HeroProgress;
  readonly materials: HeroMaterials;
}

export function Lid({ progress, materials }: LidProps) {
  const lidRef = useRef<Group | null>(null);
  const logo = useLoader(TextureLoader, "/brand/kushagra-logo.png");

  const geometry = useMemo(
    () => ({
      top: new RoundedBoxGeometry(LID.w, BOX.t, LID.d, 3, 0.014),
      skirt: frameGeometry(LID.w, LID.d, LID.r, BOX.t, LID.skirt),
      label: new RoundedBoxGeometry(1.2, 0.006, 0.82, 2, 0.002),
    }),
    [],
  );

  useEffect(() => {
    logo.colorSpace = SRGBColorSpace;
    logo.anisotropy = 8;
    logo.needsUpdate = true;
  }, [logo]);

  useEffect(
    () => () => {
      geometry.top.dispose();
      geometry.skirt.dispose();
      geometry.label.dispose();
    },
    [geometry],
  );

  useFrame(() => {
    const lid = lidRef.current;
    if (lid === null) return;
    const { lidLift, lidSet } = heroPose(progress.get());

    // Up off the base…
    const upY = lerp(CLOSED.y, LIFTED.y, lidLift);
    const upZ = lerp(CLOSED.z, LIFTED.z, lidLift);
    const upTilt = LIFTED.tilt * lidLift;

    // …then back and down, rising a little over the arc so it never brushes
    // the rim, turning to lean as it goes.
    const arc = Math.sin(Math.PI * lidSet) * 0.35;
    lid.position.set(
      lerp(0, SET.x, lidSet),
      lerp(upY, SET.y, lidSet) + arc,
      lerp(upZ, SET.z, lidSet),
    );
    lid.rotation.set(lerp(upTilt, LEAN, lidSet), 0, SET.roll * lidSet);
  });

  return (
    <group ref={lidRef} position={[0, CLOSED.y, CLOSED.z]}>
      <mesh
        geometry={geometry.top}
        material={materials.board}
        position={[0, -BOX.t / 2, 0]}
        castShadow
        receiveShadow
      />
      <mesh
        geometry={geometry.skirt}
        material={materials.board}
        position={[0, -LID.skirt, 0]}
        castShadow
        receiveShadow
      />

      <group position={[-0.78, 0.004, -0.36]}>
        <mesh geometry={geometry.label} material={materials.paper} receiveShadow />
        <mesh position={[0, 0.0045, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.86, 0.86 * (564 / 816)]} />
          <meshStandardMaterial
            map={logo}
            transparent
            roughness={0.9}
            polygonOffset
            polygonOffsetFactor={-1}
          />
        </mesh>
      </group>
    </group>
  );
}
