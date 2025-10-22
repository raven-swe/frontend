import * as cookieUtil from 'cookie';
import type { CookieOptions } from '#app';

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

export function parseSetCookie(setCookieValue: string) {
  const parsed = cookieUtil.parse(setCookieValue, {
    decode: (val) => val,
  });
  const [name] = setCookieValue.trim().split('=');
  return {
    name: name,
    value: parsed[name!],
    options: {
      maxAge: parsed['Max-Age'] ? parseInt(parsed['Max-Age'], 10) : undefined,
      expires: parsed.Expires ? new Date(parsed.Expires) : undefined,
      path: parsed.Path || '/',
      sameSite: parsed.SameSite ? (parsed.SameSite as CookieOptions['sameSite']) : undefined,
    },
  };
}
