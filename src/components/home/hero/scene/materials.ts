import {
  DoubleSide,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Vector2,
  type Material,
  type Texture,
} from "three";

import {
  contactShadowTexture,
  grosgrainNormalMap,
  linenBoardNormalMap,
  tissueNormalMap,
  weaveMaps,
  type WeaveKind,
} from "./textures";

/**
 * Every material in the hero scene, created once per canvas and disposed
 * with it. Colours are tuned under NeutralToneMapping to land on the brand
 * tokens: the board reads as --color-suiting, the ribbon as --color-red.
 */

export interface HeroMaterials {
  readonly board: MeshPhysicalMaterial;
  readonly liner: MeshStandardMaterial;
  readonly ribbon: MeshPhysicalMaterial;
  readonly paper: MeshStandardMaterial;
  readonly tissue: MeshPhysicalMaterial;
  readonly contact: MeshBasicMaterial;
  readonly cloth: Record<WeaveKind, MeshPhysicalMaterial>;
  dispose: () => void;
}

/** Sheen tints per cloth: the colour the light catches at a glancing angle. */
const SHEEN: Record<WeaveKind, string> = {
  oxford: "#ffffff",
  endonend: "#dfeaff",
  herringbone: "#9aa0aa",
};

export function createHeroMaterials(contactAspect: number): HeroMaterials {
  const textures: Texture[] = [];
  const materials: Material[] = [];
  const keep = <T extends Texture>(texture: T): T => {
    textures.push(texture);
    return texture;
  };
  const own = <T extends Material>(material: T): T => {
    materials.push(material);
    return material;
  };

  const linen = keep(linenBoardNormalMap());
  linen.repeat.set(0.9, 0.9);
  const grosgrain = keep(grosgrainNormalMap());
  grosgrain.repeat.set(1, 4);
  const crinkle = keep(tissueNormalMap());
  crinkle.repeat.set(1.5, 1.5);
  const contact = keep(contactShadowTexture(contactAspect));

  const board = own(
    new MeshPhysicalMaterial({
      color: "#26324a",
      roughness: 0.74,
      normalMap: linen,
      normalScale: new Vector2(0.4, 0.4),
      sheen: 0.45,
      sheenRoughness: 0.8,
      sheenColor: "#5a6b8c",
    }),
  );

  const ribbon = own(
    new MeshPhysicalMaterial({
      color: "#e0383e",
      roughness: 0.48,
      normalMap: grosgrain,
      normalScale: new Vector2(0.45, 0.45),
      sheen: 0.7,
      sheenRoughness: 0.4,
      sheenColor: "#ff9a9a",
      side: DoubleSide,
    }),
  );

  const tissue = own(
    new MeshPhysicalMaterial({
      color: "#fbfbf9",
      roughness: 0.62,
      normalMap: crinkle,
      normalScale: new Vector2(0.35, 0.35),
      sheen: 0.3,
      sheenColor: "#ffffff",
      transparent: true,
      opacity: 0.94,
      side: DoubleSide,
    }),
  );

  const makeCloth = (kind: WeaveKind): MeshPhysicalMaterial => {
    const { map, normalMap } = weaveMaps(kind);
    keep(map);
    keep(normalMap);
    return own(
      new MeshPhysicalMaterial({
        map,
        normalMap,
        normalScale: new Vector2(0.5, 0.5),
        roughness: 0.88,
        sheen: 1,
        sheenRoughness: 0.5,
        sheenColor: SHEEN[kind],
      }),
    );
  };
  const cloth: Record<WeaveKind, MeshPhysicalMaterial> = {
    oxford: makeCloth("oxford"),
    endonend: makeCloth("endonend"),
    herringbone: makeCloth("herringbone"),
  };

  return {
    board,
    liner: own(new MeshStandardMaterial({ color: "#f3f4f6", roughness: 0.95 })),
    ribbon,
    paper: own(new MeshStandardMaterial({ color: "#f5f4f0", roughness: 0.9 })),
    tissue,
    contact: own(
      new MeshBasicMaterial({
        color: "#1b2433",
        alphaMap: contact,
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
      }),
    ),
    cloth,
    dispose: () => {
      for (const material of materials) material.dispose();
      for (const texture of textures) texture.dispose();
    },
  };
}
