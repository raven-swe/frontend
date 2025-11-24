export function getAccessToken(): string | null {
  const cookie = useCookie('access_token');
  return cookie.value || null;
}

export function clearAccessToken(): void {
  const cookie = useCookie('access_token');
  cookie.value = null;
}

export function isAuthenticated(): boolean {
  const token = getAccessToken();
  return Boolean(token);
}
