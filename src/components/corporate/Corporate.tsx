"use client";

/**
 * Corporate gifting — the dark section.
 *
 * Stats row counts up once on viewport entry (CountUp), client wordmarks
 * loop seamlessly (LogoLoop), and a bulk enquiry form validates on blur and
 * submit with plain, specific error messages. Valid submits swap the form
 * for a success panel summarising the enquiry, with a wa.me link carrying
 * the same details as a backup. Front-end only.
 */

import {
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import { CountUp } from "@/components/reactbits/CountUp";
import { LogoLoop } from "@/components/reactbits/LogoLoop";
import { boxes } from "@/lib/data";
import { PHONE_DISPLAY, PHONE_TEL, WHATSAPP_NUMBER } from "@/lib/contact";
import { cn } from "@/lib/cn";

/* ------------------------------------------------------------- constants -- */

const STATS: readonly { readonly end: number; readonly label: string }[] = [
  { end: 12000, label: "boxes delivered" },
  { end: 180, label: "companies" },
  { end: 40, label: "cities" },
];

const CLIENTS: readonly string[] = [
  "Surat Diamond Works",
  "Navkar Textiles",
  "Riddhi Infra",
  "Mehta & Sons",
  "Vantika Diamonds",
  "Shreeji Polymers",
  "Amardeep Steels",
  "Ganga Exports",
  "Kiran Handlooms",
  "Omkar Realtors",
];

const INCLUDES: readonly string[] = [
  "Your logo on the gift card",
  "Mixed fabrics in one order",
  "Delivery to multiple addresses",
  "Dedicated contact on WhatsApp",
];

const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}`;

/* ------------------------------------------------------------ form model -- */

interface FormValues {
  name: string;
  company: string;
  email: string;
  phone: string;
  count: string;
  boxType: string;
  delivery: string;
  message: string;
}

type FieldName = keyof FormValues;

const EMPTY_VALUES: FormValues = {
  name: "",
  company: "",
  email: "",
  phone: "",
  count: "",
  boxType: "",
  delivery: "",
  message: "",
};

const inr = new Intl.NumberFormat("en-IN");

/** Midnight today + 7 days, in local time. */
function minDeliveryDate(): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 7);
  return date;
}

/** YYYY-MM-DD for <input type="date">. */
function toDateInputValue(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/** dd Month yyyy, for the success summary. */
function formatLongDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  if (year === undefined || month === undefined || day === undefined) {
    return iso;
  }
  return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateField(field: FieldName, values: FormValues): string | null {
  switch (field) {
    case "name":
      return values.name.trim() === "" ? "Enter your name" : null;
    case "company":
      return values.company.trim() === "" ? "Enter your company name" : null;
    case "email":
      return EMAIL_RE.test(values.email.trim())
        ? null
        : "Enter a valid work email";
    case "phone": {
      const digits = values.phone.replace(/[^\d]/g, "").replace(/^91/, "");
      return /^[6-9]\d{9}$/.test(digits)
        ? null
        : "Enter a valid 10-digit phone number";
    }
    case "count": {
      const count = Number(values.count);
      return Number.isFinite(count) && count >= 10
        ? null
        : "Minimum order is 10 boxes";
    }
    case "boxType":
      return values.boxType === "" ? "Choose a box type" : null;
    case "delivery": {
      if (values.delivery === "") return "Choose a delivery date";
      const chosen = new Date(`${values.delivery}T00:00:00`);
      return chosen.getTime() >= minDeliveryDate().getTime()
        ? null
        : "Choose a date at least 7 days from today";
    }
    case "message":
      return null;
  }
}

const VALIDATED_FIELDS: readonly FieldName[] = [
  "name",
  "company",
  "email",
  "phone",
  "count",
  "boxType",
  "delivery",
];

function validateAll(values: FormValues): Partial<Record<FieldName, string>> {
  const errors: Partial<Record<FieldName, string>> = {};
  for (const field of VALIDATED_FIELDS) {
    const error = validateField(field, values);
    if (error !== null) errors[field] = error;
  }
  return errors;
}

function waLinkFor(values: FormValues): string {
  const lines = [
    `Bulk enquiry from ${values.name.trim()} (${values.company.trim()})`,
    `${inr.format(Number(values.count))} boxes — ${values.boxType}`,
    `Delivery by ${formatLongDate(values.delivery)}`,
    `Phone: ${values.phone.trim()}`,
    `Email: ${values.email.trim()}`,
  ];
  if (values.message.trim() !== "") lines.push(values.message.trim());
  return `${WHATSAPP_LINK}?text=${encodeURIComponent(lines.join("\n"))}`;
}

/* ------------------------------------------------------------- components -- */

interface FieldProps {
  readonly id: FieldName;
  readonly label: string;
  readonly error?: string;
  readonly children: (props: {
    id: string;
    "aria-invalid": boolean;
    "aria-describedby": string | undefined;
  }) => ReactNode;
}

/** Label + control + error line. The error line reserves no space up front. */
function Field({ id, label, error, children }: FieldProps) {
  const errorId = `${id}-error`;
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-[0.9375rem] font-semibold">
        {label}
      </label>
      {children({
        id,
        "aria-invalid": error !== undefined,
        "aria-describedby": error !== undefined ? errorId : undefined,
      })}
      {error !== undefined ? (
        <p id={errorId} aria-live="polite" className="text-[0.875rem] text-red-soft">
          {error}
        </p>
      ) : null}
    </div>
  );
}

const inputClass = (hasError: boolean) =>
  cn(
    "h-12 w-full rounded-s border bg-paper/[0.06] px-4 text-[1rem] text-shirting",
    "placeholder:text-shirting/50 focus-visible:outline-shirting",
    hasError ? "border-red" : "border-shirting/25",
  );

interface SectionProps {
  /** 1 on its own route, 2 when it sits inside another page. */
  readonly headingLevel?: 1 | 2;
}

export function Corporate({ headingLevel = 2 }: SectionProps) {
  const [values, setValues] = useState<FormValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [submitted, setSubmitted] = useState<FormValues | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const Heading = headingLevel === 1 ? "h1" : "h2";

  const boxOptions = useMemo(
    () => [...boxes.map((box) => box.name), "Mixed"],
    [],
  );
  const minDelivery = useMemo(() => toDateInputValue(minDeliveryDate()), []);

  const setValue = (field: FieldName, value: string) => {
    setValues((previous) => ({ ...previous, [field]: value }));
    // Typing clears the field's error; blur re-checks it.
    setErrors((previous) =>
      previous[field] === undefined
        ? previous
        : { ...previous, [field]: undefined },
    );
  };

  const handleBlur = (field: FieldName) => {
    const error = validateField(field, values);
    setErrors((previous) => ({ ...previous, [field]: error ?? undefined }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateAll(values);
    setErrors(nextErrors);
    if (Object.values(nextErrors).some((error) => error !== undefined)) {
      const firstInvalid = formRef.current?.querySelector<HTMLElement>(
        "[aria-invalid='true']",
      );
      firstInvalid?.focus();
      return;
    }
    setSubmitted(values);
  };

  return (
    <section
      id="corporate"
      aria-labelledby="corporate-heading"
      className={cn(
        "bg-suiting text-shirting",
        headingLevel === 1 ? "page-top" : "section-pad",
      )}
    >
      <div className="grid-shell">
        <div className="col-span-12 flex flex-col gap-6 lg:col-span-7">
          <Heading id="corporate-heading">Gifting for teams</Heading>
          <p className="text-[1.0625rem] text-shirting/70">
            Diwali boxes for 50 people or wedding favours for 500. We handle
            the fabric, the packing and your note in every box.
          </p>
        </div>

        <div className="col-span-12 mt-14 grid grid-cols-1 gap-10 sm:grid-cols-3">
          {STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-1">
              <CountUp
                end={stat.end}
                suffix="+"
                className="font-display text-[clamp(2.5rem,5vw,4rem)] leading-none"
              />
              <p className="text-shirting/70">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="col-span-12 mt-14">
          <LogoLoop
            names={CLIENTS}
            className="text-[1.125rem] text-shirting/60"
          />
        </div>

        <div className="col-span-12 mt-20 grid grid-cols-1 gap-14 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <h3>What every bulk order includes</h3>
            <ul className="flex flex-col gap-4">
              {INCLUDES.map((item) => (
                <li key={item} className="flex items-baseline gap-3">
                  <span
                    aria-hidden="true"
                    className="stitch-line w-6 shrink-0 translate-y-[-3px]"
                  />
                  <span className="text-shirting/70">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            {submitted !== null ? (
              <div
                role="status"
                className="flex flex-col gap-6 rounded-m border border-shirting/25 p-8"
              >
                <h3>Enquiry sent</h3>
                <p className="text-shirting/70">
                  We&apos;ll reply on WhatsApp within one working day.
                </p>
                <dl className="grid grid-cols-1 gap-x-8 gap-y-3 text-[0.9375rem] sm:grid-cols-[auto_1fr]">
                  <dt className="text-shirting/70">Name</dt>
                  <dd>{submitted.name.trim()}</dd>
                  <dt className="text-shirting/70">Company</dt>
                  <dd>{submitted.company.trim()}</dd>
                  <dt className="text-shirting/70">Work email</dt>
                  <dd>{submitted.email.trim()}</dd>
                  <dt className="text-shirting/70">Phone</dt>
                  <dd data-numeric>{submitted.phone.trim()}</dd>
                  <dt className="text-shirting/70">Boxes</dt>
                  <dd data-numeric>
                    {inr.format(Number(submitted.count))} — {submitted.boxType}
                  </dd>
                  <dt className="text-shirting/70">Delivery by</dt>
                  <dd>{formatLongDate(submitted.delivery)}</dd>
                  {submitted.message.trim() !== "" ? (
                    <>
                      <dt className="text-shirting/70">Message</dt>
                      <dd>{submitted.message.trim()}</dd>
                    </>
                  ) : null}
                </dl>
                <p className="text-[0.9375rem] text-shirting/70">
                  If the form did not reach us,{" "}
                  <a
                    href={waLinkFor(submitted)}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-shirting underline decoration-shirting/40 decoration-1 underline-offset-[6px] transition-colors duration-300 hover:decoration-shirting"
                  >
                    send the same details on WhatsApp
                  </a>
                  .
                </p>
              </div>
            ) : (
              <form
                ref={formRef}
                onSubmit={handleSubmit}
                noValidate
                className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2"
              >
                <Field id="name" label="Your name" error={errors.name}>
                  {(props) => (
                    <input
                      {...props}
                      type="text"
                      autoComplete="name"
                      value={values.name}
                      onChange={(e) => setValue("name", e.target.value)}
                      onBlur={() => handleBlur("name")}
                      className={inputClass(errors.name !== undefined)}
                    />
                  )}
                </Field>

                <Field id="company" label="Company" error={errors.company}>
                  {(props) => (
                    <input
                      {...props}
                      type="text"
                      autoComplete="organization"
                      value={values.company}
                      onChange={(e) => setValue("company", e.target.value)}
                      onBlur={() => handleBlur("company")}
                      className={inputClass(errors.company !== undefined)}
                    />
                  )}
                </Field>

                <Field id="email" label="Work email" error={errors.email}>
                  {(props) => (
                    <input
                      {...props}
                      type="email"
                      autoComplete="email"
                      value={values.email}
                      onChange={(e) => setValue("email", e.target.value)}
                      onBlur={() => handleBlur("email")}
                      className={inputClass(errors.email !== undefined)}
                    />
                  )}
                </Field>

                <Field id="phone" label="Phone" error={errors.phone}>
                  {(props) => (
                    <input
                      {...props}
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      value={values.phone}
                      onChange={(e) => setValue("phone", e.target.value)}
                      onBlur={() => handleBlur("phone")}
                      className={inputClass(errors.phone !== undefined)}
                    />
                  )}
                </Field>

                <Field id="count" label="Number of boxes" error={errors.count}>
                  {(props) => (
                    <input
                      {...props}
                      type="number"
                      min={10}
                      step={1}
                      inputMode="numeric"
                      placeholder="10"
                      value={values.count}
                      onChange={(e) => setValue("count", e.target.value)}
                      onBlur={() => handleBlur("count")}
                      className={inputClass(errors.count !== undefined)}
                    />
                  )}
                </Field>

                <Field id="boxType" label="Box type" error={errors.boxType}>
                  {(props) => (
                    <select
                      {...props}
                      value={values.boxType}
                      onChange={(e) => setValue("boxType", e.target.value)}
                      onBlur={() => handleBlur("boxType")}
                      className={inputClass(errors.boxType !== undefined)}
                    >
                      <option value="" disabled>
                        Choose a box
                      </option>
                      {boxOptions.map((name) => (
                        <option key={name} value={name} className="text-suiting">
                          {name}
                        </option>
                      ))}
                    </select>
                  )}
                </Field>

                <Field
                  id="delivery"
                  label="Delivery by"
                  error={errors.delivery}
                >
                  {(props) => (
                    <input
                      {...props}
                      type="date"
                      min={minDelivery}
                      value={values.delivery}
                      onChange={(e) => setValue("delivery", e.target.value)}
                      onBlur={() => handleBlur("delivery")}
                      className={inputClass(errors.delivery !== undefined)}
                      style={{ colorScheme: "dark" }}
                    />
                  )}
                </Field>

                <div className="flex flex-col gap-2 sm:col-span-2">
                  <label htmlFor="message" className="text-[0.9375rem] font-semibold">
                    Message (optional)
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    value={values.message}
                    onChange={(e) => setValue("message", e.target.value)}
                    className={cn(inputClass(false), "h-auto py-3")}
                  />
                </div>

                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    className="inline-flex h-12 items-center rounded-pill bg-red-deep px-7 text-[1rem] font-semibold text-white transition-opacity duration-300 hover:opacity-90"
                  >
                    Send enquiry
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        <p className="col-span-12 mt-12 text-shirting/70">
          Prefer to talk?{" "}
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noreferrer"
            className="inline-block py-2 font-medium text-shirting underline decoration-shirting/40 decoration-1 underline-offset-[6px] transition-colors duration-300 hover:decoration-shirting"
          >
            Message us on WhatsApp
          </a>{" "}
          or{" "}
          <a
            href={`tel:${PHONE_TEL}`}
            data-numeric
            className="inline-block py-2 font-medium text-shirting underline decoration-shirting/40 decoration-1 underline-offset-[6px] transition-colors duration-300 hover:decoration-shirting"
          >
            call {PHONE_DISPLAY}
          </a>
          .
        </p>
      </div>
    </section>
  );
}
