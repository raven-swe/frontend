import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { relativeTime } from './time';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export { relativeTime };
