import {
  BufferAttribute,
  BufferGeometry,
  ExtrudeGeometry,
  Path,
  Shape,
  Vector3,
} from "three";

/**
 * Geometry shared by the hero scene. One scene unit is 10 cm.
 */

/** Base: outer width, depth, wall height, board thickness, corner radius. */
export const BOX = { w: 3.6, d: 2.6, h: 0.72, t: 0.05, r: 0.035 } as const;

const CLEARANCE = 0.02;

/** Lid: a hair larger than the base, with a skirt that covers the rim. */
export const LID = {
  w: BOX.w + 2 * (CLEARANCE + BOX.t),
  d: BOX.d + 2 * (CLEARANCE + BOX.t),
  skirt: 0.3,
  r: BOX.r + CLEARANCE + BOX.t,
  /** Height of the lid's top surface when it sits closed. */
  top: BOX.h + BOX.t,
} as const;

/** Inside of the base: where the tissue hinges and the cloth lies. */
export const INNER = {
  w: BOX.w - 2 * BOX.t,
  d: BOX.d - 2 * BOX.t,
  floor: BOX.t,
} as const;

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

/**
 * A rounded-rectangle wall frame standing on y = 0 and rising `height`: the
 * walls of the base, or the skirt of the lid, as one piece with a single
 * bevelled rim — never four planes meeting at a seam.
 */
export function frameGeometry(
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

/* ------------------------------------------------------------- strips ---- */

/**
 * A flat ribbon following a centre line. Each point carries the direction
 * the ribbon's face looks (its surface normal); the width runs across the
 * centre line, perpendicular to both. The geometry is allocated once and
 * rewritten in place as the pose changes.
 */
export interface Strip {
  readonly geometry: BufferGeometry;
  /** Rewrites the strip from `points` and `normals` (same length as created). */
  update: (points: readonly Vector3[], normals: readonly Vector3[]) => void;
}

export function createStrip(count: number, width: number): Strip {
  const geometry = new BufferGeometry();
  const positions = new Float32Array(count * 2 * 3);
  const normalData = new Float32Array(count * 2 * 3);
  const uvs = new Float32Array(count * 2 * 2);
  const indices: number[] = [];

  for (let i = 0; i < count; i += 1) {
    const v = i / Math.max(1, count - 1);
    uvs.set([0, v, 1, v], i * 4);
    if (i < count - 1) {
      const a = i * 2;
      indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
  }

  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new BufferAttribute(normalData, 3));
  geometry.setAttribute("uv", new BufferAttribute(uvs, 2));
  geometry.setIndex(indices);

  const tangent = new Vector3();
  const side = new Vector3();
  const half = width / 2;

  const update = (points: readonly Vector3[], normals: readonly Vector3[]) => {
    for (let i = 0; i < count; i += 1) {
      const point = points[i];
      const normal = normals[i];
      if (point === undefined || normal === undefined) continue;

      const before = points[Math.max(0, i - 1)] ?? point;
      const after = points[Math.min(count - 1, i + 1)] ?? point;
      tangent.subVectors(after, before);
      if (tangent.lengthSq() < 1e-10) tangent.set(1, 0, 0);
      tangent.normalize();
      side.crossVectors(tangent, normal);
      if (side.lengthSq() < 1e-10) side.set(0, 0, 1);
      side.normalize();

      const o = i * 6;
      positions[o] = point.x - side.x * half;
      positions[o + 1] = point.y - side.y * half;
      positions[o + 2] = point.z - side.z * half;
      positions[o + 3] = point.x + side.x * half;
      positions[o + 4] = point.y + side.y * half;
      positions[o + 5] = point.z + side.z * half;
      normalData[o] = normal.x;
      normalData[o + 1] = normal.y;
      normalData[o + 2] = normal.z;
      normalData[o + 3] = normal.x;
      normalData[o + 4] = normal.y;
      normalData[o + 5] = normal.z;
    }
    const position = geometry.getAttribute("position");
    const normal = geometry.getAttribute("normal");
    position.needsUpdate = true;
    normal.needsUpdate = true;
    geometry.computeBoundingSphere();
  };

  return { geometry, update };
}

/** Resamples a polyline to `count` points evenly spaced along its length. */
export function resample(
  points: readonly Vector3[],
  normals: readonly Vector3[],
  count: number,
): { points: Vector3[]; normals: Vector3[] } {
  const lengths = [0];
  for (let i = 1; i < points.length; i += 1) {
    const a = points[i - 1];
    const b = points[i];
    const previous = lengths[i - 1] ?? 0;
    lengths.push(a !== undefined && b !== undefined ? previous + a.distanceTo(b) : previous);
  }
  const total = lengths[lengths.length - 1] ?? 0;

  const outPoints: Vector3[] = [];
  const outNormals: Vector3[] = [];
  let cursor = 1;
  for (let i = 0; i < count; i += 1) {
    const target = (total * i) / Math.max(1, count - 1);
    while (cursor < lengths.length - 1 && (lengths[cursor] ?? 0) < target) cursor += 1;
    const l0 = lengths[cursor - 1] ?? 0;
    const l1 = lengths[cursor] ?? l0;
    const t = l1 > l0 ? (target - l0) / (l1 - l0) : 0;
    const p0 = points[cursor - 1] ?? new Vector3();
    const p1 = points[cursor] ?? p0;
    const n0 = normals[cursor - 1] ?? new Vector3(0, 1, 0);
    const n1 = normals[cursor] ?? n0;
    outPoints.push(new Vector3().lerpVectors(p0, p1, t));
    outNormals.push(new Vector3().lerpVectors(n0, n1, t).normalize());
  }
  return { points: outPoints, normals: outNormals };
}
