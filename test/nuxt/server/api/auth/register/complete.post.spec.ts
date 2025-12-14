import { describe, expect, vi, it, beforeEach } from 'vitest';
import { createMockH3Event } from '~~/test/mocks/h3-event';
import { useH3TestUtils } from '~~/test/mocks/h3-test-utils';
import * as jwt from 'jsonwebtoken';
useH3TestUtils();

const mockServerApiFetchRaw = vi.fn();
vi.stubGlobal('serverApiFetch', () => ({
  raw: mockServerApiFetchRaw,
}));

describe('server/api/auth/register/complete.post', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('should return 200 for valid requests', async () => {
    const setAuthCookiesMock = vi.fn();
    vi.doMock('~~/server/utils/auth/setAuthCookies', () => ({
      setAuthCookies: setAuthCookiesMock,
    }));
    const { default: completePostEventHandler } = await import(
      '~~/server/api/auth/register/complete.post'
    );
    const token = jwt.sign({}, 'secret');
    const mockResponse = {
      _data: {
        success: true,
        message: 'Registration completed successfully',
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

    const response = await completePostEventHandler(event);
    expect(setAuthCookiesMock).toHaveBeenCalledWith(event, mockResponse);
    expect(response).toEqual(mockResponse._data);
  });
});
