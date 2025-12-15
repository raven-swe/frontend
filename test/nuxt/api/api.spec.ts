import { registerEndpoint } from '@nuxt/test-utils/runtime';
import { it, describe, expect, vi, beforeEach } from 'vitest';
import { apiFetch } from '~/api';
import { getHeaders, sendError, createError } from 'h3';

const authServiceMock = vi.hoisted(() => {
  return {
    getAccessToken: vi.fn(),
    clearAccessToken: vi.fn(),
  };
});

vi.mock('~/services/auth/authService', () => {
  return {
    getAccessToken: authServiceMock.getAccessToken,
    clearAccessToken: authServiceMock.clearAccessToken,
  };
});

describe('API Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should include Authorization header when access token is present', async () => {
    registerEndpoint('/api/protected-endpoint', {
      method: 'GET',
      handler: (event) => {
        // not using getHeader with 'Authorization'
        // because it breaks for some reason in regeisterEndpoint
        const auth = getHeaders(event)['Authorization'];
        if (auth !== 'Bearer test-token') {
          return sendError(event, createError({ statusCode: 401 }));
        }

        return { success: true };
      },
    });

    authServiceMock.getAccessToken.mockReturnValue('test-token');

    const response = await apiFetch('/api/protected-endpoint', {
      method: 'GET',
    });

    expect(response).toEqual({ success: true });
  });

  it('try refreshing token on 401 response and clears access token on failure', async () => {
    let firstCall = true;

    registerEndpoint('/api/protected-endpoint', {
      method: 'GET',
      handler: (event) => {
        if (firstCall) {
          firstCall = false;
          return sendError(event, createError({ statusCode: 401 }));
        }
        return { success: true };
      },
    });

    registerEndpoint('/api/auth/refresh-token', {
      method: 'POST',
      handler: (event) => {
        return sendError(event, createError({ statusCode: 401 }));
      },
    });

    authServiceMock.getAccessToken.mockReturnValue('expired-token');

    await expect(
      apiFetch('/api/protected-endpoint', {
        method: 'GET',
      }),
    ).rejects.toThrow();

    expect(authServiceMock.clearAccessToken).toHaveBeenCalled();
  });

  it('does not try to refresh token when calling refresh-token endpoint', async () => {
    let refreshTokenCalled = false;

    registerEndpoint('/api/auth/refresh-token', {
      method: 'POST',
      handler: () => {
        refreshTokenCalled = true;
        return { token: 'new-token' };
      },
    });

    authServiceMock.getAccessToken.mockReturnValue(null);

    const response = await apiFetch('/api/auth/refresh-token', {
      method: 'POST',
    });

    expect(refreshTokenCalled).toBe(true);
    expect(response).toEqual({ token: 'new-token' });
  });

  it('return correct data after refreshing the token successfully', async () => {
    registerEndpoint('/api/protected-endpoint', {
      method: 'GET',
      handler: (event) => {
        const auth = getHeaders(event)['Authorization'];
        if (auth === 'Bearer expired-token') {
          return sendError(event, createError({ statusCode: 401 }));
        }
        return { success: true };
      },
    });

    registerEndpoint('/api/auth/refresh-token', {
      method: 'POST',
      handler: () => {
        return { token: 'new-token' };
      },
    });

    authServiceMock.getAccessToken
      .mockReturnValueOnce('expired-token')
      .mockReturnValue('new-token');

    const response = await apiFetch('/api/protected-endpoint', {
      method: 'GET',
    });

    expect(response).toEqual({ success: true });
  });

  it('throws error on any other response than 401', async () => {
    registerEndpoint('/api/protected-endpoint', {
      method: 'GET',
      handler: (event) => {
        return sendError(event, createError({ statusCode: 500 }));
      },
    });

    authServiceMock.getAccessToken.mockReturnValue('test-token');

    await expect(
      apiFetch('/api/protected-endpoint', {
        method: 'GET',
      }),
    ).rejects.toThrow();
  });
});
