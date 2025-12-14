import { describe, expect, vi, it, beforeEach } from 'vitest';
import { createMockH3Event } from '~~/test/mocks/h3-event';
import { useH3TestUtils } from '~~/test/mocks/h3-test-utils';
import * as jwt from 'jsonwebtoken';

useH3TestUtils();

const mockServerApiFetchRaw = vi.fn();
vi.stubGlobal('serverApiFetch', () => ({
  raw: mockServerApiFetchRaw,
}));

describe('POST /api/oauth/complete', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('should return 200 for valid requests', async () => {
    const setAuthCookiesMock = vi.fn();
    vi.doMock('~~/server/utils/auth/setAuthCookies', async () => {
      const actual = await vi.importActual('~~/server/utils/auth/setAuthCookies');
      return {
        ...actual,
        setAuthCookies: setAuthCookiesMock,
      };
    });
    const { default: callbackPostEventHandler } = await import(
      '~~/server/api/oauth/complete/index.post'
    );
    const token = jwt.sign({}, 'secret');
    const mockResponse = {
      _data: {
        success: true,
        message: 'Login successful',
        data: {
          accessToken: token,
        },
      },
      headers: {
        getSetCookie: () => ['mock-cookie=mock-value; Path=/; HttpOnly'],
      },
    };
    mockServerApiFetchRaw.mockResolvedValueOnce(mockResponse);
    const event = createMockH3Event({
      method: 'POST',
    });
    const response = await callbackPostEventHandler(event);
    expect(setAuthCookiesMock).toHaveBeenCalledWith(event, mockResponse);
    expect(response).toEqual(mockResponse._data);
  });

  it('should not call setAuthCookies if response has no accessToken', async () => {
    const setAuthCookiesMock = vi.fn();
    vi.doMock('~~/server/utils/auth/setAuthCookies', async () => {
      const actual = await vi.importActual('~~/server/utils/auth/setAuthCookies');
      return {
        ...actual,
        setAuthCookies: setAuthCookiesMock,
      };
    });
    const { default: callbackPostEventHandler } = await import(
      '~~/server/api/oauth/complete/index.post'
    );
    const mockResponse = {
      _data: {
        success: true,
        message: 'Login successful',
        data: {
          // No accessToken here
          creationToken: 'some-creation-token',
        },
      },
      headers: {
        getSetCookie: () => ['mock-cookie=mock-value; Path=/; HttpOnly'],
      },
    };
    mockServerApiFetchRaw.mockResolvedValueOnce(mockResponse);
    const event = createMockH3Event({
      method: 'POST',
    });
    const response = await callbackPostEventHandler(event);
    expect(setAuthCookiesMock).not.toHaveBeenCalled();
    expect(response).toEqual(mockResponse._data);
  });
});
