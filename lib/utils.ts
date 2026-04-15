import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class names into a single string using clsx and tailwind-merge.
 * Useful for conditional Tailwind CSS classes.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}