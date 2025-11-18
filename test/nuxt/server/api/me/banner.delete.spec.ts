import { beforeEach, describe, expect, it, vi } from 'vitest';
import bannerPostHandler from '~~/server/api/me/banner.delete';
import { createMockH3Event } from '~~/test/mocks/h3-event';
import { useH3TestUtils } from '~~/test/mocks/h3-test-utils';

useH3TestUtils();

const mockServerApiFetch = vi.fn();
vi.stubGlobal('serverApiFetch', () => mockServerApiFetch);

describe('DELETE /api/me/banner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should delete user banner successfully', async () => {
    mockServerApiFetch.mockResolvedValueOnce({
      success: true,
      message: 'Deleted user banner successfully',
    });
    const event = createMockH3Event({}, {});
    const response = await bannerPostHandler(event);
    expect(mockServerApiFetch).toHaveBeenCalledWith('/me/banner', {
      method: 'DELETE',
    });
    expect(response).toEqual({
      success: true,
      message: 'Deleted user banner successfully',
    });
  });
});
