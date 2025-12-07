import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockH3Event } from '~~/test/mocks/h3-event';
import { useH3TestUtils } from '~~/test/mocks/h3-test-utils';
import { createError } from '#app';
import userTweetsHandler from '~~/server/api/users/[username]/tweets.get';
import type { Tweet } from '~~/shared/types/tweets';

useH3TestUtils();

const mockServerApiFetch = vi.fn();
vi.stubGlobal('serverApiFetch', () => mockServerApiFetch);

const mockTweet: Tweet = {
  id: 'tweet123',
  content: 'This is a test tweet',
  createdAt: '2024-01-01T00:00:00Z',
  author: {
    avatarUrl: 'https://example.com/avatar.jpg',
    displayName: 'John Doe',
    username: 'johndoe',
    isFollowing: false,
    isBlocked: false,
    isFollower: false,
  },
  likeCount: 10,
  replyCount: 5,
  retweetCount: 2,
  entities: {
    hashtags: [],
    mentions: [],
  },
  isLiked: false,
  isRetweeted: false,
  media: [],
};

describe('GET /api/users/[username]/tweets', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('returns tweets for valid username', async () => {
    const mockResponse = {
      success: true,
      data: [mockTweet],
    };
    mockServerApiFetch.mockResolvedValueOnce(mockResponse);

    const event = createMockH3Event({
      method: 'GET',
      params: { username: 'johndoe' },
      query: {
        cursor: 10,
        limit: 20,
      },
    });

    const response = await userTweetsHandler(event);

    expect(mockServerApiFetch).toHaveBeenCalledWith('/users/johndoe/tweets', {
      method: 'GET',
      query: {
        cursor: 10,
        limit: 20,
      },
    });
    expect(response).toEqual(mockResponse);
  });

  it('throws error for invalid username parameter', async () => {
    const emptyUsernameEvent = createMockH3Event({
      method: 'GET',
      params: {},
    });

    await expect(userTweetsHandler(emptyUsernameEvent)).rejects.toEqual(
      createError({
        statusCode: 422,
        statusMessage: 'Validation Error',
        data: {
          errors: ['username is a required field'],
          message: 'username is a required field',
        },
      }),
    );
    expect(mockServerApiFetch).not.toHaveBeenCalled();

    const shortUsernameEvent = createMockH3Event({
      method: 'GET',
      params: { username: 'a' },
    });

    await expect(userTweetsHandler(shortUsernameEvent)).rejects.toEqual(
      createError({
        statusCode: 422,
        statusMessage: 'Validation Error',
        data: {
          errors: ['username must be at least 3 characters'],
          message: 'username must be at least 3 characters',
        },
      }),
    );
    expect(mockServerApiFetch).not.toHaveBeenCalled();
  });
});
