import { beforeEach, describe, expect, it, vi } from 'vitest';
import MeEventHandler from '~~/server/api/me/index.patch';
import { createMockH3Event } from '~~/test/mocks/h3-event';
import { useH3TestUtils } from '~~/test/mocks/h3-test-utils';

useH3TestUtils();

const mockServerApiFetch = vi.fn();
vi.stubGlobal('serverApiFetch', () => mockServerApiFetch);

describe('PATCH /api/me', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 200 for valid requests', async () => {
    const mockResponse = {
      status: 200,
      data: {
        success: true,
        message: 'Patch user successfully',
      },
    };
    mockServerApiFetch.mockResolvedValueOnce(mockResponse);
    const event = createMockH3Event({
      method: 'PATCH',
      params: { username: 'johndoe' },
    });
    const response = await MeEventHandler(event);
    expect(mockServerApiFetch).toHaveBeenCalledWith('/me', {
      method: 'PATCH',
      body: event.node.req,
      headers: {
        'content-type': event.node.req.headers['content-type']!,
      },
    });
    expect(response).toEqual(mockResponse);
  });
});
