import { clsx, type ClassValue } from "clsx";

/** Conditional className joiner used across the whole codebase. */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
