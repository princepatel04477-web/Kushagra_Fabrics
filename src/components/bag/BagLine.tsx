"use client";

/**
 * One line in the bag: the cloth in the box (a small FabricTrio), box name, fabric
 * names, occasion and recipient, a quantity stepper (1–50), remove, and the
 * line price.
 */

import { FabricTrio } from "@/components/boxes/FabricTrio";
import { getBox, getFabric, getOccasion, type Fabric } from "@/lib/data";
import { formatINR } from "@/lib/format";
import {
  MAX_LINE_QTY,
  useGiftStore,
  type BagLine as BagLineData,
} from "@/store/gift";

function MinusIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M2.5 7h9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M2.5 7h9M7 2.5v9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function BagLine({ line }: { readonly line: BagLineData }) {
  const setLineQty = useGiftStore((state) => state.setLineQty);
  const removeLine = useGiftStore((state) => state.removeLine);

  const box = getBox(line.boxId);
  const boxName = box?.name ?? "Gift box";

  const fabricNames = line.fabricIds
    .map((id) => getFabric(id))
    .filter((fabric): fabric is Fabric => fabric !== undefined)
    .map((fabric) => fabric.name);

  const occasion = getOccasion(line.occasionId);
  const tag = [
    occasion?.name,
    line.note.to !== "" ? `for ${line.note.to}` : undefined,
  ]
    .filter((part) => part !== undefined)
    .join(" · ");

  return (
    <li className="flex flex-col gap-4 border-b border-line py-5 first:pt-0 last:border-b-0">
      <div className="flex gap-4">
        <FabricTrio ids={line.fabricIds} size={48} className="self-start" />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <p className="font-medium text-suiting">{boxName}</p>
          <p className="text-[0.9375rem] text-chalk">
            {fabricNames.join(", ")}
          </p>
          {tag !== "" ? (
            <p className="text-[0.9375rem] text-chalk">{tag}</p>
          ) : null}
        </div>
        <p
          data-numeric
          className="shrink-0 text-[0.9375rem] font-medium text-suiting"
        >
          {formatINR(line.unitPriceInr * line.qty)}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center rounded-pill border border-line">
          <button
            type="button"
            disabled={line.qty <= 1}
            aria-label={`Decrease quantity of ${boxName}`}
            onClick={() => setLineQty(line.id, line.qty - 1)}
            className="grid h-9 w-9 place-items-center rounded-pill text-suiting transition-colors duration-300 hover:bg-suiting hover:text-shirting disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-suiting"
          >
            <MinusIcon />
          </button>
          <span
            data-numeric
            aria-label={`Quantity ${line.qty}`}
            className="min-w-8 text-center text-[0.9375rem] text-suiting"
          >
            {line.qty}
          </span>
          <button
            type="button"
            disabled={line.qty >= MAX_LINE_QTY}
            aria-label={`Increase quantity of ${boxName}`}
            onClick={() => setLineQty(line.id, line.qty + 1)}
            className="grid h-9 w-9 place-items-center rounded-pill text-suiting transition-colors duration-300 hover:bg-suiting hover:text-shirting disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-suiting"
          >
            <PlusIcon />
          </button>
        </div>

        <button
          type="button"
          onClick={() => removeLine(line.id)}
          className="text-[0.9375rem] text-chalk underline decoration-line decoration-1 underline-offset-[4px] transition-colors duration-300 hover:text-suiting hover:decoration-suiting"
        >
          Remove
        </button>
      </div>
    </li>
  );
}
