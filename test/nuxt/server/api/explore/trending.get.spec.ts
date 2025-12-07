import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockH3Event } from '~~/test/mocks/h3-event';
import { useH3TestUtils } from '~~/test/mocks/h3-test-utils';
import trendingEventHandler from '~~/server/api/explore/trending.get';
import type { TrendingHashtag } from '~~/shared/types/hashtag';

useH3TestUtils();

const mockServerApiFetch = vi.fn();
vi.stubGlobal('serverApiFetch', () => mockServerApiFetch);

describe('GET /api/explore/trending', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns trending hashtags successfully', async () => {
    const mockResponse: ApiSuccessResponse<TrendingHashtag[]> = {
      data: [
        {
          hashtag: 'trending1',
          tweetsCount: 1000,
          category: 'Technology',
        },
        {
          hashtag: 'trending2',
          tweetsCount: 500,
          category: 'Sports',
        },
      ],
      message: 'Success',
    };

    mockServerApiFetch.mockResolvedValueOnce(mockResponse);

    const event = createMockH3Event({
      method: 'GET',
    });

    const response = await trendingEventHandler(event);

    expect(mockServerApiFetch).toHaveBeenCalledWith('/explore/trending', {
      method: 'GET',
    });
    expect(response).toEqual(mockResponse);
    expect(response.data).toHaveLength(2);
    expect(response.data[0]).toHaveProperty('hashtag');
    expect(response.data[0]).toHaveProperty('tweetsCount');
    expect(response.data[0]).toHaveProperty('category');
  });

  it('handles empty trending hashtags response', async () => {
    const mockResponse: ApiSuccessResponse<TrendingHashtag[]> = {
      data: [],
      message: 'Success',
    };

    mockServerApiFetch.mockResolvedValueOnce(mockResponse);

    const event = createMockH3Event({
      method: 'GET',
    });

    const response = await trendingEventHandler(event);

    expect(mockServerApiFetch).toHaveBeenCalledWith('/explore/trending', {
      method: 'GET',
    });
    expect(response).toEqual(mockResponse);
    expect(response.data).toHaveLength(0);
  });

  it('handles server error', async () => {
    const mockError = new Error('Server error');
    mockServerApiFetch.mockRejectedValueOnce(mockError);

    const event = createMockH3Event({
      method: 'GET',
    });

    await expect(trendingEventHandler(event)).rejects.toThrow('Internal Server Error');
    expect(mockServerApiFetch).toHaveBeenCalledWith('/explore/trending', {
      method: 'GET',
    });
  });
});
