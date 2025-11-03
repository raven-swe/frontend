export const relativeTimeFormat = (iso: string) => {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diff = Math.max(0, Math.floor((now - then) / 1000));
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d`;
  const months = Math.floor(diff / 2592000);
  return `${months}mo`;
};

// Backwards-compatible named export expected by tests and some imports
export { relativeTimeFormat as relativeTime };

export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function birthDateFormat(isoString: string, locale = 'en'): string {
  if (!isoString) return '';

  const date = new Date(isoString);

  // Check if date is valid
  if (isNaN(date.getTime())) return '';

  const lang = locale === 'ar' ? 'ar-EG' : 'en-US';

  return new Intl.DateTimeFormat(lang, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}
