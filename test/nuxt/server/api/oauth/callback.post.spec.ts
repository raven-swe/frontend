import { describe, expect, vi, it, beforeEach } from 'vitest';
import { createMockH3Event } from '~~/test/mocks/h3-event';
import { useH3TestUtils } from '~~/test/mocks/h3-test-utils';
import * as jwt from 'jsonwebtoken';

const h3 = useH3TestUtils();

const mockServerApiFetchRaw = vi.fn();
vi.stubGlobal('serverApiFetch', () => ({
  raw: mockServerApiFetchRaw,
}));

// Import handler after mocking globals
const callbackPostEventHandler = await import(
  '~~/server/api/oauth/[provider]/callback/index.post'
).then((m) => m.default);

describe('server/api/oauth/[provider]/callback/index.post', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 200 for valid OAuth callback with access token', async () => {
    const token = jwt.sign({}, 'secret');
    mockServerApiFetchRaw.mockResolvedValueOnce({
      _data: {
        success: true,
        message: 'OAuth callback successful',
        data: {
          accessToken: token,
        },
      },
      headers: {
        getSetCookie: () => ['refresh_token=mock-refresh-token; Path=/; HttpOnly'],
      },
    });

    const event = createMockH3Event({
      method: 'POST',
      params: { provider: 'google' },
      body: { code: 'mock-auth-code' },
    });

    const response = await callbackPostEventHandler(event);

    expect(mockServerApiFetchRaw).toHaveBeenCalledWith('/oauth/google/callback', {
      method: 'POST',
      body: { code: 'mock-auth-code' },
      credentials: 'include',
    });

    expect(h3.appendHeader).toHaveBeenCalledWith(
      event,
      'set-cookie',
      'refresh_token=mock-refresh-token; Path=/; HttpOnly',
    );

    expect(h3.appendHeader).toHaveBeenCalledWith(
      event,
      'set-cookie',
      `access_token=${token}; Max-Age=300; Path=/; SameSite=Lax`,
    );

    expect(response).toEqual({
      success: true,
      message: 'OAuth callback successful',
      data: {
        accessToken: token,
      },
    });
  });

  it('should handle OAuth callback with creation token (new user)', async () => {
    mockServerApiFetchRaw.mockResolvedValueOnce({
      _data: {
        success: true,
        message: 'OAuth callback successful',
        data: {
          creationToken: 'mock-creation-token',
        },
      },
      headers: {
        getSetCookie: () => ['session=mock-session; Path=/; HttpOnly'],
      },
    });

    const event = createMockH3Event({
      method: 'POST',
      params: { provider: 'google' },
      body: { code: 'mock-auth-code' },
    });

    const response = await callbackPostEventHandler(event);

    expect(mockServerApiFetchRaw).toHaveBeenCalledWith('/oauth/google/callback', {
      method: 'POST',
      body: { code: 'mock-auth-code' },
      credentials: 'include',
    });

    expect(h3.appendHeader).toHaveBeenCalledWith(
      event,
      'set-cookie',
      'session=mock-session; Path=/; HttpOnly',
    );

    // Should not set access_token cookie for creation token response
    expect(h3.appendHeader).not.toHaveBeenCalledWith(
      event,
      'set-cookie',
      expect.stringContaining('access_token'),
    );

    expect(response).toEqual({
      success: true,
      message: 'OAuth callback successful',
      data: {
        creationToken: 'mock-creation-token',
      },
    });
  });

  it('should handle access token with exp field', async () => {
    const token = jwt.sign({}, 'secret', {
      expiresIn: '1h',
    });

    mockServerApiFetchRaw.mockResolvedValueOnce({
      _data: {
        success: true,
        message: 'OAuth callback successful',
        data: {
          accessToken: token,
        },
      },
      headers: {
        getSetCookie: () => ['refresh_token=mock-refresh-token; Path=/; HttpOnly'],
      },
    });

    const event = createMockH3Event({
      method: 'POST',
      params: { provider: 'github' },
      body: { code: 'mock-auth-code' },
    });

    const response = await callbackPostEventHandler(event);

    expect(h3.appendHeader).toHaveBeenCalledWith(
      event,
      'set-cookie',
      'refresh_token=mock-refresh-token; Path=/; HttpOnly',
    );

    expect(h3.appendHeader).toHaveBeenCalledWith(
      event,
      'set-cookie',
      'access_token=' + token + '; Max-Age=3600; Path=/; SameSite=Lax',
    );

    expect(response).toEqual({
      success: true,
      message: 'OAuth callback successful',
      data: {
        accessToken: token,
      },
    });
  });

  it('should handle response without set-cookie headers', async () => {
    const token = jwt.sign({}, 'secret');
    mockServerApiFetchRaw.mockResolvedValueOnce({
      _data: {
        success: true,
        message: 'OAuth callback successful',
        data: {
          accessToken: token,
        },
      },
      headers: {
        getSetCookie: () => [],
      },
    });

    const event = createMockH3Event({
      method: 'POST',
      params: { provider: 'google' },
      body: { code: 'mock-auth-code' },
    });

    const response = await callbackPostEventHandler(event);

    expect(h3.appendHeader).toHaveBeenCalledWith(
      event,
      'set-cookie',
      `access_token=${token}; Max-Age=300; Path=/; SameSite=Lax`,
    );

    expect(response).toEqual({
      success: true,
      message: 'OAuth callback successful',
      data: {
        accessToken: token,
      },
    });
  });

  it('should handle multiple cookies from backend', async () => {
    const token = jwt.sign({}, 'secret');
    mockServerApiFetchRaw.mockResolvedValueOnce({
      _data: {
        success: true,
        message: 'OAuth callback successful',
        data: {
          accessToken: token,
        },
      },
      headers: {
        getSetCookie: () => [
          'refresh_token=mock-refresh-token; Path=/; HttpOnly',
          'session=mock-session; Path=/; HttpOnly',
        ],
      },
    });

    const event = createMockH3Event({
      method: 'POST',
      params: { provider: 'google' },
      body: { code: 'mock-auth-code' },
    });

    const response = await callbackPostEventHandler(event);

    expect(h3.appendHeader).toHaveBeenCalledWith(
      event,
      'set-cookie',
      'refresh_token=mock-refresh-token; Path=/; HttpOnly',
    );

    expect(h3.appendHeader).toHaveBeenCalledWith(
      event,
      'set-cookie',
      'session=mock-session; Path=/; HttpOnly',
    );

    expect(h3.appendHeader).toHaveBeenCalledWith(
      event,
      'set-cookie',
      `access_token=${token}; Max-Age=300; Path=/; SameSite=Lax`,
    );

    expect(response).toEqual({
      success: true,
      message: 'OAuth callback successful',
      data: {
        accessToken: token,
      },
    });
  });

  it('should work with different OAuth providers', async () => {
    const token = jwt.sign({}, 'secret');
    mockServerApiFetchRaw.mockResolvedValueOnce({
      _data: {
        success: true,
        message: 'OAuth callback successful',
        data: {
          accessToken: token,
        },
      },
      headers: {
        getSetCookie: () => [],
      },
    });

    const event = createMockH3Event({
      method: 'POST',
      params: { provider: 'facebook' },
      body: { code: 'mock-facebook-code' },
    });

    await callbackPostEventHandler(event);

    expect(mockServerApiFetchRaw).toHaveBeenCalledWith('/oauth/facebook/callback', {
      method: 'POST',
      body: { code: 'mock-facebook-code' },
      credentials: 'include',
    });
  });
});
