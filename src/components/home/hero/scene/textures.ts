import {
  CanvasTexture,
  NoColorSpace,
  RepeatWrapping,
  type Texture,
} from "three";

/**
 * Surface relief for the hero scene, drawn once on a canvas instead of
 * downloaded: a height field is built in memory, then turned into a tangent-
 * space normal map. Every field wraps at its edges, so the maps tile.
 *
 *   linen board  the book-cloth wrapping on the box: a fine plain weave with
 *                slubs, as on the navy board in hero-box.jpg
 *   grosgrain    the ribbon: tight ribs running across its width
 */

/** Small seeded PRNG (mulberry32) so the cloth is the same on every visit. */
function random(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function wrap(index: number, size: number): number {
  return ((index % size) + size) % size;
}

/** Height field → normal map texture. `strength` scales the slope. */
function toNormalMap(
  height: Float32Array,
  size: number,
  strength: number,
): Texture {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (context === null) return new CanvasTexture(canvas);

  const image = context.createImageData(size, size);
  const at = (x: number, y: number) =>
    height[wrap(y, size) * size + wrap(x, size)] ?? 0;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const dx = (at(x + 1, y) - at(x - 1, y)) * strength;
      const dy = (at(x, y + 1) - at(x, y - 1)) * strength;
      const length = Math.hypot(dx, dy, 1);
      const offset = (y * size + x) * 4;
      image.data[offset] = Math.round(((-dx / length) * 0.5 + 0.5) * 255);
      image.data[offset + 1] = Math.round(((dy / length) * 0.5 + 0.5) * 255);
      image.data[offset + 2] = Math.round(((1 / length) * 0.5 + 0.5) * 255);
      image.data[offset + 3] = 255;
    }
  }
  context.putImageData(image, 0, 0);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = NoColorSpace;
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.anisotropy = 8;
  return texture;
}

/** A plain weave with uneven (slubbed) yarns — the board's book-cloth. */
export function linenBoardNormalMap(size = 512, seed = 11): Texture {
  const next = random(seed);
  const height = new Float32Array(size * size);
  const pitch = 4; // pixels per yarn

  // Each yarn gets its own thickness and a slow wobble along its length; the
  // wobble uses whole-number frequencies so it wraps cleanly.
  const yarns = size / pitch;
  const rowAmp = Array.from({ length: yarns }, () => 0.7 + next() * 0.6);
  const colAmp = Array.from({ length: yarns }, () => 0.7 + next() * 0.6);
  const rowPhase = Array.from({ length: yarns }, () => next() * Math.PI * 2);
  const colPhase = Array.from({ length: yarns }, () => next() * Math.PI * 2);

  for (let y = 0; y < size; y += 1) {
    const row = Math.floor(y / pitch);
    const inRow = (y % pitch) / pitch;
    for (let x = 0; x < size; x += 1) {
      const col = Math.floor(x / pitch);
      const inCol = (x % pitch) / pitch;
      const over = (row + col) % 2 === 0;

      const slubX =
        1 + 0.15 * Math.sin((x / size) * Math.PI * 2 * 3 + (rowPhase[row] ?? 0));
      const slubY =
        1 + 0.15 * Math.sin((y / size) * Math.PI * 2 * 3 + (colPhase[col] ?? 0));

      const weft = Math.sin(inRow * Math.PI) * (rowAmp[row] ?? 1) * slubX;
      const warp = Math.sin(inCol * Math.PI) * (colAmp[col] ?? 1) * slubY;

      height[y * size + x] =
        (over ? weft * 0.62 + warp * 0.38 : weft * 0.38 + warp * 0.62) +
        next() * 0.18;
    }
  }

  return toNormalMap(height, size, 1.6);
}

/** Grosgrain: fine, firm ribs across the ribbon (along texture v). */
export function grosgrainNormalMap(size = 256, seed = 5): Texture {
  const next = random(seed);
  const height = new Float32Array(size * size);
  const pitch = 3;

  for (let y = 0; y < size; y += 1) {
    const rib = Math.sin(((y % pitch) / pitch) * Math.PI);
    for (let x = 0; x < size; x += 1) {
      height[y * size + x] = rib + next() * 0.12;
    }
  }

  return toNormalMap(height, size, 2.2);
}

/**
 * The darkening where the box meets the table — a soft rounded-rectangle
 * falloff, baked once. `inset` is the share of each side left for the blur.
 * Drawn with canvas shadowBlur (supported everywhere, unlike ctx.filter):
 * the rectangle itself is painted off-canvas and only its shadow lands.
 */
export function contactShadowTexture(aspect: number, inset = 0.16): Texture {
  const width = 256;
  const height = Math.max(16, Math.round(width / aspect));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  const texture = new CanvasTexture(canvas);
  if (context === null) return texture;

  const padX = width * inset;
  const padY = height * inset;
  context.shadowColor = "rgba(0, 0, 0, 1)";
  context.shadowBlur = Math.min(padX, padY) * 0.9;
  context.shadowOffsetX = width * 2;
  context.fillStyle = "#000";
  context.beginPath();
  context.roundRect(padX - width * 2, padY, width - 2 * padX, height - 2 * padY, 6);
  context.fill();

  texture.needsUpdate = true;
  return texture;
}
