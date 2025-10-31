import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { relativeTimeFormat, formatDate, birthDateFormat } from './time';
import { cleanUrl } from './cleanUrl';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export {
  relativeTimeFormat as relativeTime,
  formatDate,
  cleanUrl as dataFormat,
  birthDateFormat as formatBirthDate,
  cleanUrl,
};
