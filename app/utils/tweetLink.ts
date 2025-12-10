export function buildTweetLink(username: string, id: string, origin?: string): string {
  const base =
    origin !== undefined ? origin : typeof window !== 'undefined' ? window.location.origin : '';
  return `${base}/profile/${username}/status/${id}`;
}
