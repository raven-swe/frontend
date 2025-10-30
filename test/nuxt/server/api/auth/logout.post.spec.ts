import { describe, expect, it, vi } from 'vitest';
import logoutPostEventHander from '~~/server/api/auth/logout.post';
import { createMockH3Event } from '~~/test/mocks/h3-event';
import { useH3TestUtils } from '~~/test/mocks/h3-test-utils';

useH3TestUtils();

const mockServerApiFetchRaw = vi.fn(async (url: string, options: { method: string }) => {
  if (url === '/auth/logout' && options.method === 'POST') {
    return {
      _data: {
        success: true,
        message: 'Logged out successfully',
      },
    };
  }
});
vi.stubGlobal('serverApiFetch', { raw: mockServerApiFetchRaw });

describe('server/api/auth/logout.post', () => {
  it('should return 200 for valid requests', async () => {
    const event = createMockH3Event({
      method: 'POST',
    });

    const response = await logoutPostEventHander(event);
    expect(response).toEqual({
      success: true,
      message: 'Logged out successfully',
    });
  });
});
