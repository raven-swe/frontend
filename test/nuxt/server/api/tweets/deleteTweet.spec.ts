import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useH3TestUtils } from '~~/test/mocks/h3-test-utils';
import deleteTweetHandler from '~~/server/api/tweets/[id]/delete/index.delete';
import { createMockH3Event } from '~~/test/mocks/h3-event';

useH3TestUtils();

const mockServerApiFetch = vi.fn();
vi.stubGlobal('serverApiFetch', () => mockServerApiFetch);

describe('DELETE /api/tweets/[id]/delete', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should delete tweet successfully', async () => {
    mockServerApiFetch.mockResolvedValueOnce({
      success: true,
      message: 'Tweet deleted successfully',
    });

    const event = createMockH3Event({
      method: 'DELETE',
      params: { id: '123' },
    });

    const response = await deleteTweetHandler(event);

    expect(mockServerApiFetch).toHaveBeenCalledWith('/tweets/123', {
      method: 'DELETE',
    });
    expect(response).toEqual({
      success: true,
      message: 'Tweet deleted successfully',
    });
  });

  it('should throw validation error if id is missing', async () => {
    const event = createMockH3Event({
      method: 'DELETE',
      params: {},
    });

    await expect(deleteTweetHandler(event)).rejects.toThrow();
  });
});
