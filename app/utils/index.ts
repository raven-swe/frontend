import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { cleanUrl } from './cleanUrl';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export { cleanUrl };
