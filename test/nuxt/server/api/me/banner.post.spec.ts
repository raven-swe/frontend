import { beforeEach, describe, expect, it, vi } from 'vitest';
import bannerPostHandler from '~~/server/api/me/banner.post';
import { createMockH3Event } from '~~/test/mocks/h3-event';
import { useH3TestUtils } from '~~/test/mocks/h3-test-utils';

useH3TestUtils();

const mockServerApiFetch = vi.fn();
vi.stubGlobal('serverApiFetch', () => mockServerApiFetch);

describe('POST /api/me/banner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update user banner successfully', async () => {
    mockServerApiFetch.mockResolvedValueOnce({
      success: true,
      message: 'Updated user successfully',
    });
    const event = createMockH3Event(
      {
        body: { banner: 'Updated Banner' },
      },
      {
        'content-type': 'application/json',
      },
    );
    const response = await bannerPostHandler(event);
    expect(mockServerApiFetch).toHaveBeenCalledWith('/me/banner', {
      method: 'POST',
      body: event.node.req,
      headers: {
        'content-type': 'application/json',
      },
    });
    expect(response).toEqual({
      success: true,
      message: 'Updated user successfully',
    });
  });
});
