import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { relativeTime, formatDate } from './time';
import { cleanUrl } from './cleanUrl';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export { relativeTime, formatDate, cleanUrl };
