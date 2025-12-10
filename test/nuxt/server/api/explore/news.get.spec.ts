import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockH3Event } from '~~/test/mocks/h3-event';
import { useH3TestUtils } from '~~/test/mocks/h3-test-utils';
import newsEventHandler from '~~/server/api/explore/news.get';
import type { TrendingHashtag } from '~~/shared/types/hashtag';

useH3TestUtils();

const mockServerApiFetch = vi.fn();
vi.stubGlobal('serverApiFetch', () => mockServerApiFetch);

describe('GET /api/explore/news', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns news hashtags successfully', async () => {
    const mockResponse: ApiSuccessResponse<TrendingHashtag[]> = {
      data: [
        {
          hashtag: 'breakingnews',
          tweetsCount: 2000,
          category: 'News',
        },
        {
          hashtag: 'worldnews',
          tweetsCount: 1500,
          category: 'News',
        },
      ],
      message: 'Success',
    };

    mockServerApiFetch.mockResolvedValueOnce(mockResponse);

    const event = createMockH3Event({
      method: 'GET',
    });

    const response = await newsEventHandler(event);

    expect(mockServerApiFetch).toHaveBeenCalledWith('/explore/news', {
      method: 'GET',
    });
    expect(response).toEqual(mockResponse);
    expect(response.data).toHaveLength(2);
  });

  it('handles empty news hashtags response', async () => {
    const mockResponse: ApiSuccessResponse<TrendingHashtag[]> = {
      data: [],
      message: 'Success',
    };

    mockServerApiFetch.mockResolvedValueOnce(mockResponse);

    const event = createMockH3Event({
      method: 'GET',
    });

    const response = await newsEventHandler(event);

    expect(response).toEqual(mockResponse);
    expect(response.data).toHaveLength(0);
  });

  it('handles server error', async () => {
    const mockError = new Error('Server error');
    mockServerApiFetch.mockRejectedValueOnce(mockError);

    const event = createMockH3Event({
      method: 'GET',
    });

    await expect(newsEventHandler(event)).rejects.toThrow('Internal Server Error');
  });
});
