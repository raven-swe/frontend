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
