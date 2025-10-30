export function cleanUrl(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/, '');
}
