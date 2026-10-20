"use client";

import { useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { BufferAttribute, BufferGeometry } from "three";

import { clamp01, easeInOutSine, heroPose } from "@/lib/heroTimeline";

import type { HeroProgress } from "../progress";
import { BOX, INNER } from "./geometry";
import type { HeroMaterials } from "./materials";

/**
 * Two sheets of tissue, hinged at the inside top edge of the left and right
 * walls. Closed, each runs down the inner wall and lies over the cloth,
 * meeting past the middle (the right sheet on top). Open, each curls over
 * its wall and falls down the outside onto the table, as in hero-box.jpg.
 *
 * A sheet is described by the angle of its surface along its length — its
 * bend — rather than by positions. The pose blends the closed bend into the
 * open one, the free edge leading, and the shape is integrated from the
 * hinge, so the paper turns over like a page instead of a hinged board.
 * The far end swings up and over (never down through the cloth): the open
 * angles are taken a full turn round from the closed ones.
 */

/** Long enough to cross the middle when closed: down the wall, then a little past centre. */
const LENGTH = 2.28;
const SEG_S = 60;
const SEG_Z = 12;
const DEPTH = INNER.d - 0.06;
const HINGE_Y = BOX.h + 0.004;
const FLOOR_Y = 0.006;
/** The tissue never sinks below the cloth while it is inside the box. */
const CLOTH_TOP = INNER.floor + 0.2;

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

/** Closed: straight down the inner wall, then turning flat over the cloth. */
function closedAngle(s: number): number {
  return -Math.PI / 2 - (Math.PI / 2) * smoothstep(0.3, 0.62, s);
}

/** Open: up over the rim in a tight curl, then down the outside, flaring a little. */
function openAngle(s: number, flare: number): number {
  return -1.5 * Math.PI - (Math.PI - 0.25 - flare) * smoothstep(0, 0.14, s);
}

interface Sheet {
  readonly geometry: BufferGeometry;
  /** +1 for the right sheet (opens toward +x), −1 for the left. */
  readonly side: 1 | -1;
  /** Height above the other sheet, so the right one lies on top. */
  readonly lift: number;
}

function createSheet(side: 1 | -1, lift: number): Sheet {
  const geometry = new BufferGeometry();
  const count = (SEG_S + 1) * (SEG_Z + 1);
  const uvs = new Float32Array(count * 2);
  const indices: number[] = [];
  for (let j = 0; j <= SEG_Z; j += 1) {
    for (let i = 0; i <= SEG_S; i += 1) {
      const k = j * (SEG_S + 1) + i;
      uvs[k * 2] = (i / SEG_S) * 2;
      uvs[k * 2 + 1] = (j / SEG_Z) * 2.4;
      if (i < SEG_S && j < SEG_Z) {
        const a = k;
        const b = k + 1;
        const c = k + SEG_S + 1;
        const d = c + 1;
        indices.push(a, c, b, b, c, d);
      }
    }
  }
  geometry.setAttribute("position", new BufferAttribute(new Float32Array(count * 3), 3));
  geometry.setAttribute("uv", new BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  return { geometry, side, lift };
}

const hs = new Float32Array(SEG_S + 1);
const ys = new Float32Array(SEG_S + 1);

function poseSheet(sheet: Sheet, t: number) {
  const position = sheet.geometry.getAttribute("position");
  const array = position.array;
  if (!(array instanceof Float32Array)) return;

  const ds = LENGTH / SEG_S;
  const hingeX = sheet.side * (INNER.w / 2);
  const lag = 0.7;

  for (let j = 0; j <= SEG_Z; j += 1) {
    const zf = j / SEG_Z;
    // Paper is never perfectly even: each strip across the sheet runs a
    // touch ahead or behind, and hangs with its own flare.
    const ripple = 0.04 * Math.sin(zf * Math.PI * 2.3 + sheet.side);
    const flare = 0.07 * Math.sin(zf * 5.1 + sheet.side * 1.3);

    let h = 0;
    let y = HINGE_Y;
    hs[0] = h;
    ys[0] = y;
    for (let i = 1; i <= SEG_S; i += 1) {
      const s = (i - 0.5) * ds;
      const lead = 1 - s / LENGTH;
      const q = easeInOutSine(clamp01(t * (1 + lag) - lag * lead + ripple * t * (1 - t) * 4));
      const angle = closedAngle(s) + (openAngle(s, flare) - closedAngle(s)) * q;

      let nh = h + Math.cos(angle) * ds;
      let ny = y + Math.sin(angle) * ds;
      // Lying inside the box: on the cloth. Outside: on the table.
      if (nh < 0 && ny < CLOTH_TOP + sheet.lift) ny = CLOTH_TOP + sheet.lift;
      if (ny < FLOOR_Y + sheet.lift) {
        ny = FLOOR_Y + sheet.lift;
        nh = h + ds * (Math.cos(angle) >= 0 ? 1 : -1);
      }
      h = nh;
      y = ny;
      hs[i] = h;
      ys[i] = y;
    }

    const z = -DEPTH / 2 + zf * DEPTH;
    for (let i = 0; i <= SEG_S; i += 1) {
      const k = (j * (SEG_S + 1) + i) * 3;
      array[k] = hingeX + sheet.side * (hs[i] ?? 0);
      array[k + 1] = ys[i] ?? HINGE_Y;
      array[k + 2] = z;
    }
  }

  position.needsUpdate = true;
  sheet.geometry.computeVertexNormals();
  sheet.geometry.computeBoundingSphere();
}

interface TissueProps {
  readonly progress: HeroProgress;
  readonly materials: HeroMaterials;
}

export function Tissue({ progress, materials }: TissueProps) {
  const sheets = useMemo(() => ({ left: createSheet(-1, 0), right: createSheet(1, 0.008) }), []);

  useEffect(
    () => () => {
      sheets.left.geometry.dispose();
      sheets.right.geometry.dispose();
    },
    [sheets],
  );

  useFrame(() => {
    const { tissueLeft, tissueRight } = heroPose(progress.get());
    poseSheet(sheets.left, tissueLeft);
    poseSheet(sheets.right, tissueRight);
  });

  return (
    <group>
      <mesh geometry={sheets.left.geometry} material={materials.tissue} castShadow receiveShadow />
      <mesh geometry={sheets.right.geometry} material={materials.tissue} castShadow receiveShadow />
    </group>
  );
}
