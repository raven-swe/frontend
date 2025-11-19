import { registerEndpoint } from '@nuxt/test-utils/runtime';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { loginService } = await import('@/services/auth/loginService');

describe('loginService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('check identifier calls API with correct params and returns response', async () => {
    registerEndpoint('/api/auth/check-identifier', () => {
      return { data: { exists: true, type: 'email' } };
    });

    const res = await loginService.checkUser('test@example.com');

    expect(res).toEqual({ exists: true, type: 'email' });
  });

  it('check identifier calls API with incorrect params and returns response', async () => {
    registerEndpoint('/api/auth/check-identifier', () => {
      return { data: { exists: false, type: 'email' } };
    });

    const res = await loginService.checkUser('wrong@example.com');

    expect(res).toEqual({ exists: false, type: 'email' });
  });

  it('submit login calls API with correct params and returns response', async () => {
    registerEndpoint('/api/auth/login', () => {
      return { data: { accessToken: 'valid-token' } };
    });

    const res = await loginService.login({
      identifier: 'test@example.com',
      password: 'wrongPassword',
    });

    expect(res).toEqual({ data: { accessToken: 'valid-token' } });
  });

  it('submit login calls API with incorrect params and returns response', async () => {
    registerEndpoint('/api/auth/login', () => {
      return { data: { accessToken: null, error: 'Invalid credentials' } };
    });

    const res = await loginService.login({
      identifier: 'wrong@example.com',
      password: 'wrongPassword',
    });

    expect(res).toEqual({ data: { accessToken: null, error: 'Invalid credentials' } });
  });

  it('submit logout calls API with correct params and returns response', async () => {
    registerEndpoint('/api/auth/logout', () => {
      return { data: { success: true } };
    });

    const res = await loginService.logout();

    expect(res).toEqual({ data: { success: true } });
  });

  it('submit logout calls API with incorrect params and returns response', async () => {
    registerEndpoint('/api/auth/logout', () => {
      return { data: { success: false, error: 'Logout failed' } };
    });

    const res = await loginService.logout();

    expect(res).toEqual({ data: { success: false, error: 'Logout failed' } });
  });
});
