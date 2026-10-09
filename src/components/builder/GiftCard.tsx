"use client";

/**
 * The gift card that sits under the gift summary: To and From in Cabin,
 * the message typed letter by letter in Bodoni Moda italic (React Bits
 * TextType). An empty message shows the placeholder line instead.
 */

import { TextType } from "@/components/reactbits/TextType";
import type { GiftNote } from "@/store/gift";

export interface GiftCardProps {
  readonly note: GiftNote;
  /** Occasion name, printed small at the top of the card. */
  readonly occasionName?: string;
}

export function GiftCard({ note, occasionName }: GiftCardProps) {
  return (
    <div className="w-full rounded-m border border-line bg-shirting p-5">
      {occasionName !== undefined ? (
        <p className="text-[0.8125rem] text-chalk">{occasionName}</p>
      ) : null}

      <p className="mt-2 font-body text-[0.9375rem] text-suiting">
        To {note.to !== "" ? note.to : "him"}
      </p>

      {note.message !== "" ? (
        <TextType
          text={note.message}
          className="mt-3 block font-display text-[1.0625rem] italic leading-[1.5] tracking-normal text-suiting"
        />
      ) : (
        <p className="mt-3 font-body text-[0.9375rem] text-chalk">
          Your note will appear here.
        </p>
      )}

      <p className="mt-3 font-body text-[0.9375rem] text-suiting">
        From {note.from !== "" ? note.from : "you"}
      </p>
    </div>
  );
}
