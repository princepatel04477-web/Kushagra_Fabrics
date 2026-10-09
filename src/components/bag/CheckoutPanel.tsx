"use client";

/**
 * The checkout panel inside the bag drawer: a summary of the order and
 * "Order on WhatsApp" — a plain anchor (never next/link) to wa.me with the
 * full order summary URL-encoded. The number comes from
 * NEXT_PUBLIC_WHATSAPP_NUMBER (see .env.example).
 */

import { getBox, getFabric, getOccasion } from "@/lib/data";
import { formatINR } from "@/lib/format";
import { useGiftStore, useBagTotal, type BagLine } from "@/store/gift";

/** Fallback matches .env.example; set NEXT_PUBLIC_WHATSAPP_NUMBER in production. */
const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "919876543210";

/** The plain-text order summary that travels inside the WhatsApp link. */
function buildSummary(lines: readonly BagLine[], totalInr: number): string {
  const rows = lines.map((line) => {
    const box = getBox(line.boxId);
    const cloths = line.fabricIds
      .map((id) => getFabric(id)?.name ?? id)
      .join(", ");
    const occasion = getOccasion(line.occasionId);
    const parts = [`${box?.name ?? "Gift box"} × ${line.qty}`, cloths];
    if (occasion !== undefined) parts.push(occasion.name);
    if (line.note.to !== "") parts.push(`for ${line.note.to}`);
    parts.push(formatINR(line.unitPriceInr * line.qty));
    return `• ${parts.join(" — ")}`;
  });

  return [
    "Kushagra — new order",
    ...rows,
    `Subtotal: ${formatINR(totalInr)}`,
    "Free gift wrapping on every box. Delivery calculated at checkout.",
  ].join("\n");
}

export interface CheckoutPanelProps {
  readonly onBack: () => void;
}

export function CheckoutPanel({ onBack }: CheckoutPanelProps) {
  const lines = useGiftStore((state) => state.lines);
  const total = useBagTotal();

  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    buildSummary(lines, total),
  )}`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <h3 className="text-suiting">Your order</h3>
        <ul className="flex flex-col">
          {lines.map((line) => {
            const box = getBox(line.boxId);
            const cloths = line.fabricIds
              .map((id) => getFabric(id)?.name ?? id)
              .join(", ");
            return (
              <li
                key={line.id}
                className="flex items-baseline justify-between gap-4 border-t border-line py-3 first:border-t-0 first:pt-0"
              >
                <span className="text-[0.9375rem] text-suiting">
                  {box?.name ?? "Gift box"} × {line.qty}
                  <span className="block text-[0.8125rem] text-chalk">
                    {cloths}
                  </span>
                </span>
                <span
                  data-numeric
                  className="shrink-0 text-[0.9375rem] font-medium text-suiting"
                >
                  {formatINR(line.unitPriceInr * line.qty)}
                </span>
              </li>
            );
          })}
        </ul>
        <div className="flex items-baseline justify-between border-t border-line pt-4">
          <span className="text-[0.9375rem] text-chalk">Subtotal</span>
          <span
            data-numeric
            className="font-display text-[1.5rem] leading-none tracking-[-0.02em] text-suiting"
          >
            {formatINR(total)}
          </span>
        </div>
      </div>

      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-12 items-center justify-center rounded-pill bg-red px-7 text-[1rem] font-semibold text-white transition-opacity duration-300 hover:opacity-90"
      >
        Order on WhatsApp
      </a>

      <button
        type="button"
        onClick={onBack}
        className="self-start text-[0.9375rem] text-chalk underline decoration-line decoration-1 underline-offset-[4px] transition-colors duration-300 hover:text-suiting hover:decoration-suiting"
      >
        Back to bag
      </button>
    </div>
  );
}
