import {
  CanvasTexture,
  NoColorSpace,
  RepeatWrapping,
  SRGBColorSpace,
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
 *   weaves       the three lengths in the box — Oxford white, Sky
 *                end-on-end, Charcoal herringbone — colour and relief
 *   tissue       soft creases of paper folded once and opened again
 *   note card    the giver's line, set in the display face
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

/* ------------------------------------------------------------- weaves ---- */

export type WeaveKind = "oxford" | "endonend" | "herringbone";

interface Rgb {
  readonly r: number;
  readonly g: number;
  readonly b: number;
}

function hex(value: string): Rgb {
  const n = Number.parseInt(value.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

/** Warp and weft colours for each cloth, true to the swatch book. */
const WEAVE_COLOURS: Record<WeaveKind, { warp: readonly Rgb[]; weft: Rgb }> = {
  // Oxford: a white weft over a faintly greyer warp, in a 2 × 2 basket.
  oxford: { warp: [hex("#e6e8ea")], weft: hex("#fafbfb") },
  // End-on-end: sky-blue and white warp ends alternate over a white weft.
  endonend: { warp: [hex("#5f8fd0"), hex("#e4ecf8")], weft: hex("#bcd0ec") },
  // Herringbone: a near-black warp twilled over a mid-grey weft.
  herringbone: { warp: [hex("#212429")], weft: hex("#767a82") },
};

/**
 * Colour and relief for one cloth, 512 px square, tiling. A tile spans
 * `WEAVE_TILE` scene units (10 cm), so the herringbone's chevrons come out
 * about 1 cm wide — the scale a person sees on the real cloth.
 */
export const WEAVE_TILE = 1;

export function weaveMaps(kind: WeaveKind, seed = 3): { map: Texture; normalMap: Texture } {
  const size = 512;
  const next = random(seed);
  const height = new Float32Array(size * size);
  const colour = new Uint8ClampedArray(size * size * 4);
  const { warp, weft } = WEAVE_COLOURS[kind];

  // Yarn pitch and chevron width both divide 512, so the tile wraps. The
  // herringbone uses coarser yarns so its twill survives mipmapping at
  // screen size; the chevrons come out about 1.25 cm wide.
  const pitch = kind === "herringbone" ? 8 : 4;
  const chevron = 64;

  for (let y = 0; y < size; y += 1) {
    const row = Math.floor(y / pitch);
    const inRow = (y % pitch) / pitch;
    for (let x = 0; x < size; x += 1) {
      const col = Math.floor(x / pitch);
      const inCol = (x % pitch) / pitch;

      let warpUp: boolean;
      if (kind === "herringbone") {
        // 2/2 twill whose diagonal flips every chevron.
        const direction = Math.floor(x / chevron) % 2 === 0 ? 1 : -1;
        warpUp = ((((col + direction * row) % 4) + 4) % 4) < 2;
      } else if (kind === "oxford") {
        warpUp = (Math.floor(col / 2) + Math.floor(row / 2)) % 2 === 0;
      } else {
        warpUp = (col + row) % 2 === 0;
      }

      const warpBulge = Math.sin(inCol * Math.PI);
      const weftBulge = Math.sin(inRow * Math.PI);
      const grain = next() * 0.15;
      height[y * size + x] = (warpUp ? 0.6 + 0.4 * warpBulge : 0.6 * weftBulge) + grain;

      const base = warpUp ? (warp[col % warp.length] ?? weft) : weft;
      const shade = 0.88 + 0.12 * (warpUp ? warpBulge : weftBulge) + (next() - 0.5) * 0.05;
      const o = (y * size + x) * 4;
      colour[o] = base.r * shade;
      colour[o + 1] = base.g * shade;
      colour[o + 2] = base.b * shade;
      colour[o + 3] = 255;
    }
  }

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  const map = new CanvasTexture(canvas);
  if (context !== null) {
    context.putImageData(new ImageData(colour, size, size), 0, 0);
  }
  map.colorSpace = SRGBColorSpace;
  map.wrapS = RepeatWrapping;
  map.wrapT = RepeatWrapping;
  map.anisotropy = 8;

  return { map, normalMap: toNormalMap(height, size, 1.4) };
}

/* ------------------------------------------------------------- tissue ---- */

/** Soft, straight creases across tissue paper that was folded and opened. */
export function tissueNormalMap(size = 256, seed = 23): Texture {
  const next = random(seed);
  const height = new Float32Array(size * size);
  const creases = Array.from({ length: 14 }, () => {
    const angle = next() * Math.PI;
    return {
      nx: Math.cos(angle),
      ny: Math.sin(angle),
      offset: next() * size,
      width: 2 + next() * 5,
      depth: (next() - 0.5) * 1.6,
    };
  });

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      let h = next() * 0.04;
      for (const crease of creases) {
        const distance = Math.abs(x * crease.nx + y * crease.ny - crease.offset);
        h += crease.depth * Math.exp(-Math.pow(distance / crease.width, 2));
      }
      height[y * size + x] = h;
    }
  }
  return toNormalMap(height, size, 0.9);
}

/* ---------------------------------------------------------- note card ---- */

/**
 * The note card's face: paper with one line in the display face. Drawn after
 * the web font has loaded, so the canvas uses Bodoni Moda, not a fallback.
 */
export function noteCardTexture(fontFamily: string, lines: readonly string[]): Texture {
  const width = 1024;
  const height = 690;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;

  const context = canvas.getContext("2d");
  if (context === null) return texture;

  context.fillStyle = "#f6f4ee";
  context.fillRect(0, 0, width, height);
  context.fillStyle = "#1b2433";
  context.textBaseline = "alphabetic";
  context.font = `400 76px ${fontFamily}`;
  lines.forEach((line, index) => {
    context.fillText(line, 96, 250 + index * 96);
  });

  // A short tacking stitch under the line, in thread.
  context.strokeStyle = "#f28c3c";
  context.lineWidth = 5;
  context.setLineDash([22, 16]);
  context.beginPath();
  context.moveTo(96, 250 + lines.length * 96 + 10);
  context.lineTo(420, 250 + lines.length * 96 + 10);
  context.stroke();

  texture.needsUpdate = true;
  return texture;
}
