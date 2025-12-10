import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockH3Event } from '~~/test/mocks/h3-event';
import { useH3TestUtils } from '~~/test/mocks/h3-test-utils';
import entertainmentEventHandler from '~~/server/api/explore/entertainment.get';
import type { TrendingHashtag } from '~~/shared/types/hashtag';

useH3TestUtils();

const mockServerApiFetch = vi.fn();
vi.stubGlobal('serverApiFetch', () => mockServerApiFetch);

describe('GET /api/explore/entertainment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns entertainment hashtags successfully', async () => {
    const mockResponse: ApiSuccessResponse<TrendingHashtag[]> = {
      data: [
        {
          hashtag: 'movies',
          tweetsCount: 1800,
          category: 'Entertainment',
        },
        {
          hashtag: 'music',
          tweetsCount: 1200,
          category: 'Entertainment',
        },
      ],
      message: 'Success',
    };

    mockServerApiFetch.mockResolvedValueOnce(mockResponse);

    const event = createMockH3Event({
      method: 'GET',
    });

    const response = await entertainmentEventHandler(event);

    expect(mockServerApiFetch).toHaveBeenCalledWith('/explore/entertainment', {
      method: 'GET',
    });
    expect(response).toEqual(mockResponse);
    expect(response.data).toHaveLength(2);
  });

  it('handles empty entertainment hashtags response', async () => {
    const mockResponse: ApiSuccessResponse<TrendingHashtag[]> = {
      data: [],
      message: 'Success',
    };

    mockServerApiFetch.mockResolvedValueOnce(mockResponse);

    const event = createMockH3Event({
      method: 'GET',
    });

    const response = await entertainmentEventHandler(event);

    expect(response).toEqual(mockResponse);
    expect(response.data).toHaveLength(0);
  });

  it('handles server error', async () => {
    const mockError = new Error('Server error');
    mockServerApiFetch.mockRejectedValueOnce(mockError);

    const event = createMockH3Event({
      method: 'GET',
    });

    await expect(entertainmentEventHandler(event)).rejects.toThrow('Internal Server Error');
  });
});
