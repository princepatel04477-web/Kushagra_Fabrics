import { clsx, type ClassValue } from "clsx";

/**
 * Joins conditional class names. Used everywhere instead of template-string
 * concatenation so that `false`/`undefined` never leak into the DOM.
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
