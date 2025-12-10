export const relativeTime = (iso: string, locale = 'en-US') => {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diff = Math.max(0, Math.floor((now - then) / 1000));
  if (locale === 'ar-EG') {
    const arabicMap = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'] as const;
    const toArabicDigits = (n: number): string =>
      String(n).replace(/\d/g, (d) => arabicMap[Number(d)] || d);
    if (diff < 60) return `${toArabicDigits(diff)} ث`;
    if (diff < 3600) return `${toArabicDigits(Math.floor(diff / 60))} د`;
    if (diff < 86400) return `${toArabicDigits(Math.floor(diff / 3600))} س`;
    const dateObj = new Date(then);
    return new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'long' }).format(dateObj);
  } else {
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)}d`;
    const months = Math.floor(diff / 2592000);
    return `${months}mo`;
  }
};

export function formatDate(isoString: string, locale = 'en-US'): string {
  const date = new Date(isoString);

  const time = date.toLocaleTimeString(locale, {
    hour: 'numeric',
    minute: '2-digit',
  });

  const fullDate = date.toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return `${time} · ${fullDate}`;
}

export function birthDateFormat(isoString: string, locale = 'en-US'): string {
  if (!isoString) return '';

  const date = new Date(isoString);
  // Check if date is valid
  if (isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}
