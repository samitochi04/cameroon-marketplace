import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * A utility function that merges class names together
 * This combines clsx for conditional classes with tailwind-merge to handle conflicting Tailwind classes
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
