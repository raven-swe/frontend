export function getAccessToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token');
  }
  return null;
}

export function setAccessToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', token);
  }
}

export function clearAccessToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
  }
}

export function isAuthenticated(): boolean {
  const token = getAccessToken();
  return token !== null && token !== undefined && token !== '';
}
