const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/**
 * Format integer rupees as Indian currency, e.g. 12500 -> "₹12,500".
 * Prices are always stored as integer rupees, never floats.
 */
export function formatINR(rupees: number): string {
  return inr.format(rupees);
}
