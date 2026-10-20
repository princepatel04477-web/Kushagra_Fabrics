"use client";

import { useEffect, useMemo } from "react";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

import { BOX, frameGeometry } from "./geometry";
import type { HeroMaterials } from "./materials";

/**
 * The base of the gift box: a navy book-cloth tray whose four walls are one
 * extruded frame with a bevelled rim, a pale liner on the floor, and the
 * soft dark patch where it meets the table.
 */

/** The contact patch, a little wider than the box. */
export const CONTACT = { w: BOX.w * 1.28, d: BOX.d * 1.38 } as const;

interface BoxProps {
  readonly materials: HeroMaterials;
}

export function Box({ materials }: BoxProps) {
  const geometry = useMemo(
    () => ({
      floor: new RoundedBoxGeometry(BOX.w, BOX.t, BOX.d, 3, 0.012),
      walls: frameGeometry(BOX.w, BOX.d, BOX.r, BOX.t, BOX.h),
    }),
    [],
  );

  useEffect(
    () => () => {
      geometry.floor.dispose();
      geometry.walls.dispose();
    },
    [geometry],
  );

  return (
    <group>
      <mesh
        position={[0, 0.002, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={materials.contact}
        renderOrder={-1}
      >
        <planeGeometry args={[CONTACT.w, CONTACT.d]} />
      </mesh>

      <mesh
        geometry={geometry.floor}
        material={materials.board}
        position={[0, BOX.t / 2, 0]}
        castShadow
        receiveShadow
      />
      <mesh geometry={geometry.walls} material={materials.board} castShadow receiveShadow />
      <mesh
        position={[0, BOX.t + 0.002, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={materials.liner}
        receiveShadow
      >
        <planeGeometry args={[BOX.w - 2 * BOX.t, BOX.d - 2 * BOX.t]} />
      </mesh>
    </group>
  );
}
