import { describe, expect, vi, it, beforeEach } from 'vitest';
import usernameUpdateHandler from '~~/server/api/settings/username/update.patch';
import { createMockH3Event } from '~~/test/mocks/h3-event';
import { useH3TestUtils } from '~~/test/mocks/h3-test-utils';

useH3TestUtils();

const mockServerApiFetch = vi.fn();
vi.stubGlobal('serverApiFetch', mockServerApiFetch);

describe('server/api/settings/username/update.patch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 200 for valid requests', async () => {
    mockServerApiFetch.mockResolvedValueOnce({
      success: true,
      message: 'Username updated successfully',
    });

    const event = createMockH3Event({
      method: 'PATCH',
      // Handler uses getQuery, so provide values via query
      query: {
        newUsername: 'new_name',
      },
    });

    const response = await usernameUpdateHandler(event);

    expect(mockServerApiFetch).toHaveBeenCalledWith('/me/settings/username', {
      method: 'PATCH',
      body: {
        newUsername: 'new_name',
      },
      headers: {},
    });

    expect(response).toEqual({
      success: true,
      message: 'Username updated successfully',
    });
  });

  it('should forward Authorization header to backend', async () => {
    mockServerApiFetch.mockResolvedValueOnce({
      success: true,
      message: 'Username updated successfully',
    });

    const event = createMockH3Event({
      method: 'PATCH',
      query: {
        newUsername: 'new_name',
      },
    });

    // Set Authorization header so getHeader(event, 'Authorization') returns it
    event.headers.set('Authorization', 'Bearer mock-token');

    const response = await usernameUpdateHandler(event);

    expect(mockServerApiFetch).toHaveBeenCalledWith('/me/settings/username', {
      method: 'PATCH',
      body: {
        newUsername: 'new_name',
      },
      headers: {
        Authorization: 'Bearer mock-token',
      },
    });

    expect(response).toEqual({
      success: true,
      message: 'Username updated successfully',
    });
  });
});
