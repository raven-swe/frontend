import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useH3TestUtils } from '~~/test/mocks/h3-test-utils';
import tweetByIdGetHandler from '~~/server/api/tweets/[id]/index.get';
import { createError, type Tweet } from '#imports';
import { createMockH3Event } from '~~/test/mocks/h3-event';

useH3TestUtils();

const mockServerApiFetch = vi.fn();
vi.stubGlobal('serverApiFetch', () => mockServerApiFetch);

describe('GET /api/tweets/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch tweet by id successfully', async () => {
    const sampleTweet: Tweet = {
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
    };

    mockServerApiFetch.mockResolvedValueOnce({
      success: true,
      message: 'fetched tweet successfully',
      data: sampleTweet,
    });

    const event = createMockH3Event({
      method: 'GET',
      params: { id: '1' },
    });

    const response = await tweetByIdGetHandler(event);

    expect(mockServerApiFetch).toHaveBeenCalledWith('/tweets/1', {
      method: 'GET',
    });

    expect(response).toEqual({
      success: true,
      message: 'fetched tweet successfully',
      data: sampleTweet,
    });
  });

  it('should handle API fetch failure', async () => {
    const backendError = createError({
      statusCode: 404,
      statusMessage: 'tweet not found',
      data: { message: 'tweet not found', success: false },
    });
    mockServerApiFetch.mockRejectedValueOnce(backendError);
    const event = createMockH3Event({
      method: 'GET',
      params: { id: '1' },
    });

    await expect(tweetByIdGetHandler(event)).rejects.toEqual(backendError);

    expect(mockServerApiFetch).toHaveBeenCalledWith('/tweets/1', {
      method: 'GET',
    });
  });

  it('should handle non api errors', async () => {
    mockServerApiFetch.mockRejectedValueOnce(new Error('Network Error'));
    const event = createMockH3Event({
      method: 'GET',
      params: { id: '1' },
    });

    await expect(tweetByIdGetHandler(event)).rejects.toEqual(
      createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
        data: { message: 'Network Error' },
      }),
    );

    expect(mockServerApiFetch).toHaveBeenCalledWith('/tweets/1', {
      method: 'GET',
    });
  });

  it('should handle missing tweet id parameter', async () => {
    const event = createMockH3Event({
      method: 'GET',
    });

    await expect(tweetByIdGetHandler(event)).rejects.toEqual(
      createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
        data: { message: 'id is a required field' },
      }),
    );

    expect(mockServerApiFetch).not.toHaveBeenCalled();
  });
});
