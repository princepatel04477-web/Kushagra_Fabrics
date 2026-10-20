"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3, type Group } from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

import { clamp01, easeInOutCubic, heroPose } from "@/lib/heroTimeline";

import type { HeroProgress } from "../progress";
import { LID, createStrip, resample, type Strip } from "./geometry";
import type { HeroMaterials } from "./materials";

/**
 * The red grosgrain ribbon: two bands crossing over the closed lid and a
 * bow tied where they cross, in box coordinates.
 *
 * Undoing it is two motions. The bow pulls through first — its loops and
 * tails draw into the knot. Then each band peels off from its leading end,
 * travels over in a low arc and settles on the table in front of the box in
 * a loose curl, as the ribbon lies in hero-box.jpg. Every point of a band
 * runs on its own slightly later clock, so the band reads as one length of
 * ribbon sliding off rather than a rigid strip being moved.
 */

const WIDTH = 0.24;
const POINTS = 56;
/** Gap between the ribbon and the board it lies on. */
const GAP = 0.005;
/** Where the bands cross on the lid. */
const CROSS = { x: 0.62, z: 0.36 } as const;

const UP = new Vector3(0, 1, 0);

interface Path {
  readonly points: Vector3[];
  readonly normals: Vector3[];
}

/**
 * The centre line of a band wrapped around the closed lid: up one skirt,
 * over the top, down the far skirt. `along` is the axis it runs on; `at` is
 * its position on the other axis. Starts at the end that will lead.
 */
function wrapPath(along: "x" | "z", at: number, lift: number, reverse: boolean): Path {
  const half = (along === "z" ? LID.d : LID.w) / 2 + GAP + lift;
  const top = LID.top + GAP + lift;
  const bottom = LID.top - LID.skirt + 0.01;
  const corner = 0.03;

  // Work in (u, y): u along the band's axis.
  const raw: Array<{ u: number; y: number; nu: number; ny: number }> = [];
  raw.push({ u: -half, y: bottom, nu: -1, ny: 0 });
  raw.push({ u: -half, y: top - corner, nu: -1, ny: 0 });
  for (let k = 1; k <= 4; k += 1) {
    const a = (k / 4) * (Math.PI / 2);
    raw.push({
      u: -half + corner - corner * Math.cos(a),
      y: top - corner + corner * Math.sin(a),
      nu: -Math.cos(a),
      ny: Math.sin(a),
    });
  }
  for (let k = 1; k <= 4; k += 1) {
    const a = (k / 4) * (Math.PI / 2);
    raw.push({
      u: half - corner + corner * Math.sin(a),
      y: top - corner + corner * Math.cos(a),
      nu: Math.sin(a),
      ny: Math.cos(a),
    });
  }
  raw.push({ u: half, y: bottom, nu: 1, ny: 0 });

  const ordered = reverse ? [...raw].reverse() : raw;
  const points = ordered.map(({ u, y }) =>
    along === "z" ? new Vector3(at, y, u) : new Vector3(u, y, at),
  );
  const normals = ordered.map(({ nu, ny }) =>
    along === "z" ? new Vector3(0, ny, nu) : new Vector3(nu, ny, 0),
  );
  return resample(points, normals, POINTS);
}

interface FallSpec {
  /** Start and end of the band's line on the table (x, z). */
  readonly from: readonly [number, number];
  readonly to: readonly [number, number];
  /** Sideways wave across that line. */
  readonly wave: number;
  readonly phase: number;
  /** The curl: where along the band (0–1) it stands up in a loop, and its radius. */
  readonly loopAt: readonly [number, number];
  readonly radius: number;
  readonly height: number;
}

/**
 * The band lying on the table: a soft S along the line, with one curl where
 * the ribbon stands up on itself. Inside the curl the face turns toward the
 * loop's centre, so the curl reads as ribbon, not a bent stick.
 */
function fallPath(spec: FallSpec): Path {
  const dir = new Vector3(spec.to[0] - spec.from[0], 0, spec.to[1] - spec.from[1]);
  const length = dir.length();
  dir.normalize();
  const across = new Vector3(-dir.z, 0, dir.x);
  const loopLength = 2 * Math.PI * spec.radius;
  const [loopStart, loopEnd] = spec.loopAt;

  const points: Vector3[] = [];
  const normals: Vector3[] = [];
  const samples = 160;
  for (let i = 0; i < samples; i += 1) {
    const u = i / (samples - 1);
    const sway = Math.sin(u * Math.PI * 2.2 + spec.phase) * spec.wave;
    const point = new Vector3(spec.from[0], spec.height, spec.from[1])
      .addScaledVector(dir, u * length)
      .addScaledVector(across, sway);
    const normal = UP.clone();

    if (u > loopStart && u < loopEnd) {
      const theta = ((u - loopStart) / (loopEnd - loopStart)) * Math.PI * 2;
      // Pull back along the line so the curl does not stretch it, then go
      // round the loop in the vertical plane through the line.
      const progressInLoop = (u - loopStart) / (loopEnd - loopStart);
      point.addScaledVector(dir, -progressInLoop * loopLength * 0.55 + spec.radius * Math.sin(theta));
      point.y += spec.radius * (1 - Math.cos(theta));
      normal
        .copy(dir)
        .multiplyScalar(-Math.sin(theta))
        .addScaledVector(UP, Math.cos(theta))
        .normalize();
    } else if (u >= loopEnd) {
      point.addScaledVector(dir, -loopLength * 0.55);
    }

    points.push(point);
    normals.push(normal);
  }
  return resample(points, normals, POINTS);
}

/** A bow loop: a flattened ring rising from the knot along +x. */
function loopPath(length: number, height: number): Path {
  const points: Vector3[] = [];
  const normals: Vector3[] = [];
  const centre = new Vector3(length / 2, height * 0.25, 0);
  for (let i = 0; i < POINTS; i += 1) {
    const theta = (i / (POINTS - 1)) * Math.PI * 2;
    const point = new Vector3(
      (length * (1 - Math.cos(theta))) / 2,
      (height * (1 - Math.cos(theta))) / 4 + height * 0.45 * Math.sin(theta) + height * 0.2,
      0,
    );
    points.push(point);
    normals.push(centre.clone().sub(point).normalize());
  }
  return { points, normals };
}

/** A tail: lying on the lid from the knot, with a slight wave. */
function tailPath(to: readonly [number, number], y: number): Path {
  const points: Vector3[] = [];
  const normals: Vector3[] = [];
  for (let i = 0; i < POINTS; i += 1) {
    const u = i / (POINTS - 1);
    points.push(
      new Vector3(
        to[0] * u + Math.sin(u * Math.PI) * 0.05,
        y + Math.sin(u * Math.PI) * 0.012,
        to[1] * u,
      ),
    );
    normals.push(UP.clone());
  }
  return { points, normals };
}

interface Band {
  readonly strip: Strip;
  readonly wrap: Path;
  readonly fall: Path;
}

function makeBand(wrap: Path, fall: Path): Band {
  return { strip: createStrip(POINTS, WIDTH), wrap, fall };
}

const scratchPoints = Array.from({ length: POINTS }, () => new Vector3());
const scratchNormals = Array.from({ length: POINTS }, () => new Vector3());

/** Moves a band between wrapped (t = 0) and fallen (t = 1), peeling from index 0. */
function poseBand(band: Band, t: number, arc: number) {
  const lag = 0.65;
  for (let i = 0; i < POINTS; i += 1) {
    const order = i / (POINTS - 1);
    const local = easeInOutCubic(clamp01(t * (1 + lag) - lag * order));
    const w = band.wrap.points[i];
    const f = band.fall.points[i];
    const wn = band.wrap.normals[i];
    const fn = band.fall.normals[i];
    const point = scratchPoints[i];
    const normal = scratchNormals[i];
    if (w === undefined || f === undefined || wn === undefined || fn === undefined) continue;
    if (point === undefined || normal === undefined) continue;
    point.lerpVectors(w, f, local);
    point.y += Math.sin(Math.PI * local) * arc;
    normal.lerpVectors(wn, fn, local);
    if (normal.lengthSq() < 1e-6) normal.copy(UP);
    normal.normalize();
  }
  band.strip.update(scratchPoints, scratchNormals);
}

interface RibbonProps {
  readonly progress: HeroProgress;
  readonly materials: HeroMaterials;
}

export function Ribbon({ progress, materials }: RibbonProps) {
  const bowRef = useRef<Group | null>(null);

  const parts = useMemo(() => {
    // Band A runs front to back; it leads from the front and curls on the
    // table in front of the box. Band B runs side to side, on top of A.
    const bandA = makeBand(
      wrapPath("z", CROSS.x, 0, true),
      fallPath({
        from: [1.45, 1.52],
        to: [-0.7, 1.86],
        wave: 0.13,
        phase: 0.4,
        loopAt: [0.5, 0.72],
        radius: 0.13,
        height: 0.004,
      }),
    );
    const bandB = makeBand(
      wrapPath("x", CROSS.z, 0.003, false),
      fallPath({
        from: [-0.95, 2.2],
        to: [1.9, 1.9],
        wave: 0.11,
        phase: 1.7,
        loopAt: [0.3, 0.52],
        radius: 0.16,
        height: 0.01,
      }),
    );

    const loop = loopPath(0.56, 0.17);
    const loops = [createStrip(POINTS, WIDTH * 0.9), createStrip(POINTS, WIDTH * 0.9)];
    for (const strip of loops) strip.update(loop.points, loop.normals);

    const tailY = 0.006;
    const tailA = tailPath([-0.32, 0.62], tailY);
    const tailB = tailPath([0.34, 0.66], tailY);
    const tails = [createStrip(POINTS, WIDTH * 0.9), createStrip(POINTS, WIDTH * 0.9)];
    tails[0]?.update(tailA.points, tailA.normals);
    tails[1]?.update(tailB.points, tailB.normals);

    const knot = new RoundedBoxGeometry(0.2, 0.07, 0.22, 2, 0.03);
    return { bandA, bandB, loops, tails, knot };
  }, []);

  useEffect(
    () => () => {
      parts.bandA.strip.geometry.dispose();
      parts.bandB.strip.geometry.dispose();
      for (const strip of [...parts.loops, ...parts.tails]) strip.geometry.dispose();
      parts.knot.dispose();
    },
    [parts],
  );

  useFrame(() => {
    const { bow, bandA, bandB } = heroPose(progress.get());
    poseBand(parts.bandA, bandA, 0.55);
    poseBand(parts.bandB, bandB, 0.7);

    const knot = bowRef.current;
    if (knot !== null) {
      const s = Math.max(0.001, 1 - bow);
      knot.scale.setScalar(s);
      knot.rotation.y = -0.2 + bow * 0.6;
      knot.visible = bow < 0.999;
    }
  });

  const knotTop = LID.top + GAP + 0.003;

  return (
    <group>
      <mesh geometry={parts.bandA.strip.geometry} material={materials.ribbon} castShadow receiveShadow />
      <mesh geometry={parts.bandB.strip.geometry} material={materials.ribbon} castShadow receiveShadow />

      <group ref={bowRef} position={[CROSS.x, knotTop, CROSS.z]} rotation={[0, -0.2, 0]}>
        <mesh geometry={parts.knot} material={materials.ribbon} position={[0, 0.03, 0]} castShadow />
        {parts.loops.map((strip, index) => (
          <mesh
            key={`loop-${index}`}
            geometry={strip.geometry}
            material={materials.ribbon}
            position={[0, 0.01, 0]}
            rotation={[0, index === 0 ? Math.PI + 0.28 : -0.22, 0]}
            castShadow
          />
        ))}
        {parts.tails.map((strip, index) => (
          <mesh
            key={`tail-${index}`}
            geometry={strip.geometry}
            material={materials.ribbon}
            position={[0, 0.004, 0]}
            castShadow
            receiveShadow
          />
        ))}
      </group>
    </group>
  );
}
