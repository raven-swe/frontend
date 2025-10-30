import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as cookieModule from '~~/app/services/auth/authService';

const { useCookieMock } = vi.hoisted(() => {
  return {
    useCookieMock: vi.fn(),
  };
});

mockNuxtImport('useCookie', () => {
  return useCookieMock;
});

describe('getAccessToken', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns token value if present', () => {
    useCookieMock.mockReturnValue({ value: 'abc123' });
    const token = cookieModule.getAccessToken();
    expect(useCookieMock).toHaveBeenCalled();
    expect(token).toBe('abc123');
  });

  it('returns null if no token', () => {
    useCookieMock.mockReturnValue({ value: null });
    const token = cookieModule.getAccessToken();
    expect(useCookieMock).toHaveBeenCalled();
    expect(token).toBeNull();
  });
});

describe('clearAccessToken', () => {
  it('sets cookie value to null', () => {
    const cookieObj = { value: 'token' };
    useCookieMock.mockReturnValue(cookieObj);
    cookieModule.clearAccessToken();
    expect(cookieObj.value).toBeNull();
  });
});

describe('isAuthenticated', () => {
  it('returns true if token exists', () => {
    useCookieMock.mockReturnValue({ value: 'abc123' });
    expect(cookieModule.isAuthenticated()).toBe(true);
  });

  it('returns false if no token', () => {
    useCookieMock.mockReturnValue({ value: null });
    expect(cookieModule.isAuthenticated()).toBe(false);
  });
});

describe('parseSetCookie', () => {
  it('parses simple Set-Cookie header', () => {
    const setCookieValue = 'access_token=abc123; Max-Age=3600; Path=/; SameSite=Lax';
    const parsed = cookieModule.parseSetCookie(setCookieValue);

    expect(parsed).toEqual({
      name: 'access_token',
      value: 'abc123',
      options: {
        maxAge: 3600,
        expires: undefined,
        path: '/',
        sameSite: 'Lax',
      },
    });
  });

  it('parses Set-Cookie with Expires', () => {
    const expires = 'Wed, 30 Oct 2025 20:00:00 GMT';
    const setCookieValue = `access_token=abc123; Expires=${expires}; Path=/`;
    const parsed = cookieModule.parseSetCookie(setCookieValue);

    expect(parsed.name).toBe('access_token');
    expect(parsed.value).toBe('abc123');
    expect(parsed.options.expires).toEqual(new Date(expires));
    expect(parsed.options.path).toBe('/');
  });

  it('handles missing optional attributes', () => {
    const setCookieValue = 'access_token=abc123';
    const parsed = cookieModule.parseSetCookie(setCookieValue);

    expect(parsed.options.maxAge).toBeUndefined();
    expect(parsed.options.expires).toBeUndefined();
    expect(parsed.options.path).toBe('/');
    expect(parsed.options.sameSite).toBeUndefined();
  });
});
