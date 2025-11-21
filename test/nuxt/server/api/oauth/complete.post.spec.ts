import { describe, expect, vi, it, beforeEach } from 'vitest';
import { createMockH3Event } from '~~/test/mocks/h3-event';
import { useH3TestUtils } from '~~/test/mocks/h3-test-utils';
import * as jwt from 'jsonwebtoken';

const h3 = useH3TestUtils();

const mockServerApiFetchRaw = vi.fn();
vi.stubGlobal('serverApiFetch', { raw: mockServerApiFetchRaw });

// Import handler after mocking globals
const completePostEventHandler = await import('~~/server/api/oauth/complete/index.post').then(
  (m) => m.default,
);

describe('server/api/oauth/complete/index.post', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 200 for valid OAuth complete request', async () => {
    const token = jwt.sign({}, 'secret');
    mockServerApiFetchRaw.mockResolvedValueOnce({
      _data: {
        success: true,
        message: 'OAuth complete successful',
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
      body: {
        creationToken: 'mock-creation-token',
        birthDate: '2000-01-01',
      },
    });

    const response = await completePostEventHandler(event);

    expect(mockServerApiFetchRaw).toHaveBeenCalledWith('/oauth/complete', {
      method: 'POST',
      body: {
        creationToken: 'mock-creation-token',
        birthDate: '2000-01-01',
      },
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
      message: 'OAuth complete successful',
      data: {
        accessToken: token,
      },
    });
  });

  it('should handle access token with exp field', async () => {
    const token = jwt.sign({}, 'secret', {
      expiresIn: '7d',
    });

    mockServerApiFetchRaw.mockResolvedValueOnce({
      _data: {
        success: true,
        message: 'OAuth complete successful',
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
      body: {
        creationToken: 'mock-creation-token',
        birthDate: '1995-05-15',
      },
    });

    const response = await completePostEventHandler(event);

    expect(h3.appendHeader).toHaveBeenCalledWith(
      event,
      'set-cookie',
      'refresh_token=mock-refresh-token; Path=/; HttpOnly',
    );

    expect(h3.appendHeader).toHaveBeenCalledWith(
      event,
      'set-cookie',
      'access_token=' + token + '; Max-Age=604800; Path=/; SameSite=Lax',
    );

    expect(response).toEqual({
      success: true,
      message: 'OAuth complete successful',
      data: {
        accessToken: token,
      },
    });
  });

  it('should handle response without access token', async () => {
    mockServerApiFetchRaw.mockResolvedValueOnce({
      _data: {
        success: true,
        message: 'OAuth complete successful',
        data: {},
      },
      headers: {
        getSetCookie: () => ['session=mock-session; Path=/; HttpOnly'],
      },
    });

    const event = createMockH3Event({
      method: 'POST',
      body: {
        creationToken: 'mock-creation-token',
        birthDate: '2000-01-01',
      },
    });

    const response = await completePostEventHandler(event);

    expect(h3.appendHeader).toHaveBeenCalledWith(
      event,
      'set-cookie',
      'session=mock-session; Path=/; HttpOnly',
    );

    // Should not set access_token cookie when accessToken is not in response
    expect(h3.appendHeader).not.toHaveBeenCalledWith(
      event,
      'set-cookie',
      expect.stringContaining('access_token'),
    );

    expect(response).toEqual({
      success: true,
      message: 'OAuth complete successful',
      data: {},
    });
  });

  it('should handle response without set-cookie headers', async () => {
    const token = jwt.sign({}, 'secret');
    mockServerApiFetchRaw.mockResolvedValueOnce({
      _data: {
        success: true,
        message: 'OAuth complete successful',
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
      body: {
        creationToken: 'mock-creation-token',
        birthDate: '2000-01-01',
      },
    });

    const response = await completePostEventHandler(event);

    expect(h3.appendHeader).toHaveBeenCalledWith(
      event,
      'set-cookie',
      `access_token=${token}; Max-Age=300; Path=/; SameSite=Lax`,
    );

    expect(response).toEqual({
      success: true,
      message: 'OAuth complete successful',
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
        message: 'OAuth complete successful',
        data: {
          accessToken: token,
        },
      },
      headers: {
        getSetCookie: () => [
          'refresh_token=mock-refresh-token; Path=/; HttpOnly',
          'session=mock-session; Path=/; HttpOnly',
          'user_id=12345; Path=/; HttpOnly',
        ],
      },
    });

    const event = createMockH3Event({
      method: 'POST',
      body: {
        creationToken: 'mock-creation-token',
        birthDate: '2000-01-01',
      },
    });

    const response = await completePostEventHandler(event);

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
      'user_id=12345; Path=/; HttpOnly',
    );

    expect(h3.appendHeader).toHaveBeenCalledWith(
      event,
      'set-cookie',
      `access_token=${token}; Max-Age=300; Path=/; SameSite=Lax`,
    );

    expect(response).toEqual({
      success: true,
      message: 'OAuth complete successful',
      data: {
        accessToken: token,
      },
    });
  });

  it('should handle different birthDate formats', async () => {
    const token = jwt.sign({}, 'secret');
    mockServerApiFetchRaw.mockResolvedValueOnce({
      _data: {
        success: true,
        message: 'OAuth complete successful',
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
      body: {
        creationToken: 'mock-creation-token',
        birthDate: '1990-12-31',
      },
    });

    await completePostEventHandler(event);

    expect(mockServerApiFetchRaw).toHaveBeenCalledWith('/oauth/complete', {
      method: 'POST',
      body: {
        creationToken: 'mock-creation-token',
        birthDate: '1990-12-31',
      },
      credentials: 'include',
    });
  });

  it('should use default maxAge when token has no exp field', async () => {
    const token = jwt.sign({}, 'secret'); // No expiration
    mockServerApiFetchRaw.mockResolvedValueOnce({
      _data: {
        success: true,
        message: 'OAuth complete successful',
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
      body: {
        creationToken: 'mock-creation-token',
        birthDate: '2000-01-01',
      },
    });

    await completePostEventHandler(event);

    // Should use default 300 seconds (5 minutes) when no exp field
    expect(h3.appendHeader).toHaveBeenCalledWith(
      event,
      'set-cookie',
      `access_token=${token}; Max-Age=300; Path=/; SameSite=Lax`,
    );
  });
});
