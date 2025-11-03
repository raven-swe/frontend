import { describe, expect, vi, it, beforeEach } from 'vitest';
import passwordPutEventHandler from '~~/server/api/settings/password/index.put';
import { createMockH3Event } from '~~/test/mocks/h3-event';
import { useH3TestUtils } from '~~/test/mocks/h3-test-utils';

useH3TestUtils();

const mockServerApiFetch = vi.fn();
vi.stubGlobal('serverApiFetch', mockServerApiFetch);

describe('server/api/settings/password/index.put', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 200 for valid requests', async () => {
    mockServerApiFetch.mockResolvedValueOnce({
      success: true,
      message: 'Password changed successfully',
    });

    const event = createMockH3Event({
      method: 'PUT',
      // Handler uses getQuery, so provide values via query
      query: {
        currentPassword: '123456789',
        newPassword: 'NewP@ssw0rd',
      },
    });

    const response = await passwordPutEventHandler(event);

    expect(mockServerApiFetch).toHaveBeenCalledWith('/me/password', {
      method: 'PUT',
      body: {
        currentPassword: '123456789',
        newPassword: 'NewP@ssw0rd',
      },
      headers: {},
    });

    expect(response).toEqual({
      success: true,
      message: 'Password changed successfully',
    });
  });

  it('should forward Authorization header to backend', async () => {
    mockServerApiFetch.mockResolvedValueOnce({
      success: true,
      message: 'Password changed successfully',
    });

    const event = createMockH3Event({
      method: 'PUT',
      query: {
        currentPassword: '123456789',
        newPassword: 'NewP@ssw0rd',
      },
    });

    // Set Authorization header so getHeader(event, 'Authorization') returns it
    event.headers.set('Authorization', 'Bearer mock-token');

    const response = await passwordPutEventHandler(event);

    expect(mockServerApiFetch).toHaveBeenCalledWith('/me/password', {
      method: 'PUT',
      body: {
        currentPassword: '123456789',
        newPassword: 'NewP@ssw0rd',
      },
      headers: {
        Authorization: 'Bearer mock-token',
      },
    });

    expect(response).toEqual({
      success: true,
      message: 'Password changed successfully',
    });
  });
});
