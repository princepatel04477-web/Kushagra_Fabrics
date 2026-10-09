"use client";

/**
 * Step 3 of the builder: the note card — occasion (preselected from the
 * store), To, From, and the message with a live character counter.
 */

import { occasions } from "@/lib/data";
import { useGiftStore } from "@/store/gift";

const MESSAGE_MAX = 180;

const fieldClass =
  "h-12 w-full rounded-s border border-line bg-paper px-4 font-body text-[1rem] text-suiting placeholder:text-chalk/70";

export function StepNote() {
  const note = useGiftStore((state) => state.note);
  const setNote = useGiftStore((state) => state.setNote);
  const selectedOccasion = useGiftStore((state) => state.selectedOccasion);
  const setOccasion = useGiftStore((state) => state.setOccasion);

  const left = MESSAGE_MAX - note.message.length;

  return (
    <section
      aria-labelledby="step-note-heading"
      className="flex flex-col gap-5"
    >
      <h3 id="step-note-heading">3 · Write the note</h3>

      <label className="flex flex-col gap-2">
        <span className="text-[0.9375rem] text-chalk">Occasion</span>
        <select
          value={selectedOccasion ?? ""}
          onChange={(event) =>
            setOccasion(event.target.value === "" ? null : event.target.value)
          }
          className={fieldClass}
        >
          <option value="">No particular day</option>
          {occasions.map((occasion) => (
            <option key={occasion.id} value={occasion.id}>
              {occasion.name}
            </option>
          ))}
        </select>
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-[0.9375rem] text-chalk">To</span>
          <input
            type="text"
            value={note.to}
            maxLength={40}
            placeholder="Aarav"
            onChange={(event) => setNote({ to: event.target.value })}
            className={fieldClass}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-[0.9375rem] text-chalk">From</span>
          <input
            type="text"
            value={note.from}
            maxLength={40}
            placeholder="Priya"
            onChange={(event) => setNote({ from: event.target.value })}
            className={fieldClass}
          />
        </label>
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-[0.9375rem] text-chalk">Message</span>
        <textarea
          value={note.message}
          maxLength={MESSAGE_MAX}
          rows={4}
          placeholder="Your note will appear here."
          onChange={(event) => setNote({ message: event.target.value })}
          className="w-full rounded-s border border-line bg-paper px-4 py-3 font-body text-[1rem] text-suiting placeholder:text-chalk/70"
        />
        <span
          data-numeric
          aria-live="off"
          className="self-end text-[0.8125rem] text-chalk"
        >
          {left} left
        </span>
      </label>
    </section>
  );
}
