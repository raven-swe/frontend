export function formatMonthYear(isoDate: string): string {
  const date = new Date(isoDate);

  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}
