import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useH3TestUtils } from '~~/test/mocks/h3-test-utils';
import tweetsGetHandler from '~~/server/api/tweets/index.get';
import type { Tweet } from '#imports';
import { createMockH3Event } from '~~/test/mocks/h3-event';

useH3TestUtils();

const mockServerApiFetch = vi.fn();
vi.stubGlobal('serverApiFetch', mockServerApiFetch);

describe('GET /api/tweets', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch all tweets successfully', async () => {
    const sampleTweets: Tweet[] = [
      {
        id: '1',
        content: 'Hello world',
        createdAt: new Date().toISOString(),
        author: {
          username: 'john',
          displayName: 'John',
          avatarUrl: 'x',
          isFollowing: false,
          isFollower: false,
        },
        replyCount: 0,
        retweetCount: 0,
        likeCount: 0,
        isLiked: false,
        isRetweeted: false,
        entities: { mentions: [], hashtags: [] },
        media: [],
      },
    ];

    mockServerApiFetch.mockResolvedValueOnce({
      success: true,
      message: 'fetched tweets successfully',
      data: sampleTweets,
    });

    const event = createMockH3Event(
      {
        method: 'GET',
      },
      {
        authorization: 'Bearer mock-token',
      },
    );

    const response = await tweetsGetHandler(event);

    expect(mockServerApiFetch).toHaveBeenCalledWith('/tweets', {
      method: 'GET',
      headers: {
        Authorization: 'Bearer mock-token',
      },
    });

    expect(response).toEqual({
      success: true,
      message: 'fetched tweets successfully',
      data: sampleTweets,
    });
  });

  it('should handle API fetch failure', async () => {
    const backendError = createError({
      statusCode: 404,
      statusMessage: 'tweets not found',
      data: { message: 'tweets not found', success: false },
    });
    mockServerApiFetch.mockRejectedValueOnce(backendError);
    const event = createMockH3Event(
      {
        method: 'GET',
      },
      {
        authorization: 'Bearer mock-token',
      },
    );

    await expect(tweetsGetHandler(event)).rejects.toEqual(backendError);

    expect(mockServerApiFetch).toHaveBeenCalledWith('/tweets', {
      method: 'GET',
      headers: {
        Authorization: 'Bearer mock-token',
      },
    });
  });

  it('should handle non api errors', async () => {
    mockServerApiFetch.mockRejectedValueOnce(new Error('Network Error'));
    const event = createMockH3Event(
      {
        method: 'GET',
      },
      {
        authorization: 'Bearer mock-token',
      },
    );
    await expect(tweetsGetHandler(event)).rejects.toEqual(
      createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
        data: { message: 'Network Error' },
      }),
    );

    expect(mockServerApiFetch).toHaveBeenCalledWith('/tweets', {
      method: 'GET',
      headers: {
        Authorization: 'Bearer mock-token',
      },
    });
  });
});
