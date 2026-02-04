import { clsx, type ClassValue } from "clsx";

/**
 * Utility function for conditionally joining class names.
 * Combines clsx for conditional class handling.
 *
 * @example
 * cn("base-class", condition && "conditional-class", { "object-class": true })
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
