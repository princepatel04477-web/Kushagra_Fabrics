"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import {
  ExtrudeGeometry,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Path,
  Shape,
  SRGBColorSpace,
  TextureLoader,
  Vector2,
  type Group,
} from "three";

import type { HeroProgress } from "../progress";
import {
  contactShadowTexture,
  grosgrainNormalMap,
  linenBoardNormalMap,
} from "./textures";

/**
 * The gift box: a navy book-cloth shirt box with a separate lid, a paper
 * label and a red grosgrain ribbon cross. One scene unit is 10 cm.
 *
 * The walls and the lid skirt are each one extruded rounded-rectangle frame,
 * so the rim is a single bevelled edge that catches the light, as card board
 * does — never four planes meeting at a seam.
 */

/** Base: outer width, depth, wall height, board thickness. */
export const BOX = { w: 3.6, d: 2.6, h: 0.72, t: 0.05, r: 0.035 } as const;

/** Lid: a hair larger than the base, with a skirt that covers the rim. */
const CLEARANCE = 0.02;
const LID = {
  w: BOX.w + 2 * (CLEARANCE + BOX.t),
  d: BOX.d + 2 * (CLEARANCE + BOX.t),
  skirt: 0.3,
  r: BOX.r + CLEARANCE + BOX.t,
} as const;

/** The soft dark patch under the base, a little wider than the box. */
const CONTACT = { w: BOX.w * 1.28, d: BOX.d * 1.38 } as const;

const RIBBON = { width: 0.24, lift: 0.004, x: 0.62, z: 0.36 } as const;

/** Traces a rounded rectangle centred on the origin into `shape`. */
function roundedRect<T extends Path>(shape: T, w: number, d: number, r: number): T {
  const x = -w / 2;
  const y = -d / 2;
  shape.moveTo(x + r, y);
  shape.lineTo(x + w - r, y);
  shape.quadraticCurveTo(x + w, y, x + w, y + r);
  shape.lineTo(x + w, y + d - r);
  shape.quadraticCurveTo(x + w, y + d, x + w - r, y + d);
  shape.lineTo(x + r, y + d);
  shape.quadraticCurveTo(x, y + d, x, y + d - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);
  return shape;
}

/** A rounded-rectangle wall frame, standing on y = 0 and rising `height`. */
function frameGeometry(
  w: number,
  d: number,
  r: number,
  thickness: number,
  height: number,
): ExtrudeGeometry {
  const outer = roundedRect(new Shape(), w, d, r);
  outer.holes.push(
    roundedRect(
      new Path(),
      w - 2 * thickness,
      d - 2 * thickness,
      Math.max(0.004, r - thickness),
    ),
  );

  const bevel = 0.006;
  const geometry = new ExtrudeGeometry(outer, {
    depth: height - 2 * bevel,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel * 0.6,
    bevelSegments: 3,
    curveSegments: 10,
  });
  // Extrusion runs along +z; stand it up so it rises along +y.
  geometry.rotateX(-Math.PI / 2);
  geometry.translate(0, bevel, 0);
  return geometry;
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function segment(progress: number, start: number, end: number): number {
  return Math.min(1, Math.max(0, (progress - start) / (end - start)));
}

interface BoxProps {
  readonly progress: HeroProgress;
}

export function Box({ progress }: BoxProps) {
  const lidRef = useRef<Group | null>(null);
  const logo = useLoader(TextureLoader, "/brand/kushagra-logo.png");

  const parts = useMemo(() => {
    const linen = linenBoardNormalMap();
    linen.repeat.set(0.9, 0.9);
    const grosgrain = grosgrainNormalMap();
    grosgrain.repeat.set(1, 4);

    const board = new MeshPhysicalMaterial({
      color: "#26324a",
      roughness: 0.74,
      normalMap: linen,
      normalScale: new Vector2(0.4, 0.4),
      sheen: 0.45,
      sheenRoughness: 0.8,
      sheenColor: "#5a6b8c",
    });
    const liner = new MeshStandardMaterial({ color: "#f3f4f6", roughness: 0.95 });
    const ribbon = new MeshPhysicalMaterial({
      color: "#d8343a",
      roughness: 0.5,
      normalMap: grosgrain,
      normalScale: new Vector2(0.45, 0.45),
      sheen: 0.6,
      sheenRoughness: 0.45,
      sheenColor: "#ff8a8a",
    });
    const paper = new MeshStandardMaterial({ color: "#f5f4f0", roughness: 0.9 });
    const contact = contactShadowTexture(CONTACT.w / CONTACT.d);
    const contactMaterial = new MeshBasicMaterial({
      color: "#1b2433",
      alphaMap: contact,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    });

    return {
      walls: frameGeometry(BOX.w, BOX.d, BOX.r, BOX.t, BOX.h),
      skirt: frameGeometry(LID.w, LID.d, LID.r, BOX.t, LID.skirt),
      board,
      liner,
      ribbon,
      paper,
      contactMaterial,
      textures: [linen, grosgrain, contact],
    };
  }, []);

  useEffect(() => {
    logo.colorSpace = SRGBColorSpace;
    logo.anisotropy = 8;
    logo.needsUpdate = true;
  }, [logo]);

  useEffect(
    () => () => {
      parts.walls.dispose();
      parts.skirt.dispose();
      parts.board.dispose();
      parts.liner.dispose();
      parts.ribbon.dispose();
      parts.paper.dispose();
      parts.contactMaterial.dispose();
      for (const texture of parts.textures) texture.dispose();
    },
    [parts],
  );

  // P0 test motion only: the lid lifts slowly, then tips back on its rear
  // edge. The real choreography arrives with heroTimeline.ts in P2.
  useFrame(() => {
    const lid = lidRef.current;
    if (lid === null) return;
    const p = progress.get();
    const lift = easeInOutCubic(segment(p, 0.05, 0.55));
    const tip = easeInOutCubic(segment(p, 0.4, 0.95));
    lid.position.set(0, BOX.h + BOX.t + lift * 0.85 - tip * 0.55, -LID.d / 2 - tip * 0.22);
    lid.rotation.x = -tip * 1.38;
  });

  const lidTop = BOX.h + BOX.t;

  return (
    <group>
      <mesh
        position={[0, 0.002, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={parts.contactMaterial}
        renderOrder={-1}
      >
        <planeGeometry args={[CONTACT.w, CONTACT.d]} />
      </mesh>

      {/* base */}
      <RoundedBox
            castShadow
            receiveShadow
        args={[BOX.w, BOX.t, BOX.d]}
        radius={0.012}
        smoothness={3}
        position={[0, BOX.t / 2, 0]}
        material={parts.board}
      />
      <mesh geometry={parts.walls} material={parts.board} castShadow receiveShadow />
      <mesh
        position={[0, BOX.t + 0.002, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={parts.liner}
        receiveShadow
      >
        <planeGeometry args={[BOX.w - 2 * BOX.t, BOX.d - 2 * BOX.t]} />
      </mesh>

      {/* lid — its origin sits on the rear top edge, the hinge it tips on */}
      <group ref={lidRef} position={[0, lidTop, -LID.d / 2]}>
        <group position={[0, 0, LID.d / 2]}>
          <RoundedBox
            castShadow
            receiveShadow
            args={[LID.w, BOX.t, LID.d]}
            radius={0.014}
            smoothness={3}
            position={[0, -BOX.t / 2, 0]}
            material={parts.board}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={parts.skirt}
            material={parts.board}
            position={[0, -LID.skirt, 0]}
          />

          {/* label */}
          <group position={[-0.78, RIBBON.lift, -0.36]}>
            <RoundedBox
            castShadow
            receiveShadow
              args={[1.2, 0.006, 0.82]}
              radius={0.002}
              smoothness={2}
              material={parts.paper}
            />
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

          {/* ribbon cross, wrapped over the top and down the skirt */}
          <mesh position={[RIBBON.x, -LID.skirt / 2 + RIBBON.lift, 0]} material={parts.ribbon} castShadow receiveShadow>
            <boxGeometry args={[RIBBON.width, LID.skirt + 2 * RIBBON.lift, LID.d + 2 * RIBBON.lift]} />
          </mesh>
          {/* The second band crosses over the first, so it sits a hair higher. */}
          <mesh position={[0, -LID.skirt / 2 + 2 * RIBBON.lift, RIBBON.z]} material={parts.ribbon} castShadow receiveShadow>
            <boxGeometry args={[LID.w + 4 * RIBBON.lift, LID.skirt + 4 * RIBBON.lift, RIBBON.width]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
