import { beforeEach, describe, expect, it, vi } from 'vitest';
import logoutPostEventHander from '~~/server/api/auth/logout.post';
import { createMockH3Event } from '~~/test/mocks/h3-event';
import { useH3TestUtils } from '~~/test/mocks/h3-test-utils';

const h3 = useH3TestUtils();

const mockServerApiFetchRaw = vi.fn();
vi.stubGlobal('serverApiFetch', () => ({
  raw: mockServerApiFetchRaw,
}));

describe('server/api/auth/logout.post', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('should return 200 for valid requests', async () => {
    const event = createMockH3Event({
      method: 'POST',
    });

    const mockResponse = {
      _data: {
        success: true,
        message: 'Logged out successfully',
      },
    };

    mockServerApiFetchRaw.mockResolvedValueOnce(mockResponse);

    const response = await logoutPostEventHander(event);
    expect(h3.deleteCookie).toHaveBeenCalledTimes(2);
    expect(response).toEqual(mockResponse._data);
  });

  it('should forward cookies from request to serverApiFetch', async () => {
    const event = createMockH3Event(
      {
        method: 'POST',
      },
      {
        cookie: 'access_token=abc; refreshToken=def',
      },
    );

    const mockResponse = {
      _data: {
        success: true,
        message: 'Logged out successfully',
      },
    };

    mockServerApiFetchRaw.mockResolvedValueOnce(mockResponse);

    const response = await logoutPostEventHander(event);
    expect(mockServerApiFetchRaw).toHaveBeenCalledWith('/auth/logout', {
      method: 'POST',
      credentials: 'include',
      headers: {
        cookie: 'access_token=abc; refreshToken=def',
      },
    });
    expect(response).toEqual(mockResponse._data);
  });
});
