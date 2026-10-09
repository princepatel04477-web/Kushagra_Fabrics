/**
 * Money. All prices in this project are stored as integer rupees — never
 * floats, never paise — so arithmetic stays exact and formatting is the only
 * place rounding is decided.
 */

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/** 24900 → "₹24,900". */
export function formatINR(amountInr: number): string {
  return inrFormatter.format(amountInr);
}

/** 24900, 31500 → "₹24,900 – ₹31,500". */
export function formatINRRange(minInr: number, maxInr: number): string {
  if (minInr === maxInr) return formatINR(minInr);
  return `${formatINR(minInr)} – ${formatINR(maxInr)}`;
}

/** 1, "shirt length" → "1 shirt length". */
export function pluralize(count: number, singular: string, plural?: string): string {
  return `${count} ${count === 1 ? singular : (plural ?? `${singular}s`)}`;
}
