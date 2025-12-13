import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockH3Event } from '~~/test/mocks/h3-event';
import { useH3TestUtils } from '~~/test/mocks/h3-test-utils';
import { createError } from '#app';
import type { ContentEntities } from '#shared/types/entity';
import type { CompactUser } from '#shared/types/user';
import TweetRetweetsGetHandler from '~~/server/api/tweets/[id]/retweets.get';

type RetweetUser = {
  username: string;
  displayName: string;
  avatarUrl: string;
  isFollowing?: boolean;
  isFollower?: boolean;
  isBlocked?: boolean;
  isMuted?: boolean;
  bio?: {
    text?: string;
    bioEntities?: ContentEntities | null;
  };
};

useH3TestUtils();

const mockServerApiFetch = vi.fn();
vi.stubGlobal('serverApiFetch', () => mockServerApiFetch);

describe('GET /api/tweets/[id]/retweets', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('returns tweet retweeters for valid tweet id', async () => {
    const mockResponse = {
      success: true,
      data: [
        {
          username: 'janedoe',
          displayName: 'Jane Doe',
          avatarUrl: 'http://example.com/avatar.jpg',
          isFollowing: false,
          isFollower: false,
          isBlocked: false,
          isMuted: false,
          bio: {
            text: 'Hello, I am Jane!',
            bioEntities: null,
          },
        },
      ] as RetweetUser[],
    };
    mockServerApiFetch.mockResolvedValueOnce(mockResponse);

    const event = createMockH3Event({
      method: 'GET',
      params: { id: 'tw-id' },
      query: {
        cursor: 'abc123',
        limit: '10',
      },
    });

    const response = await TweetRetweetsGetHandler(event);

    expect(mockServerApiFetch).toHaveBeenCalledWith('/tweets/tw-id/retweets', {
      method: 'GET',
      query: { cursor: 'abc123', limit: '10' },
    });
    expect(response).toMatchObject({
      ...mockResponse,
      data: [
        {
          username: 'janedoe',
          displayName: 'Jane Doe',
          avatarUrl: 'http://example.com/avatar.jpg',
          relationship: {
            blocking: false,
            blockedBy: false,
            muted: false,
            following: false,
            follower: false,
          },
          bio: 'Hello, I am Jane!',
          bioEntities: null,
        },
      ] as CompactUser[],
    });
  });

  it('should handle missing tweet id parameter', async () => {
    const event = createMockH3Event({
      method: 'POST',
    });

    await expect(TweetRetweetsGetHandler(event)).rejects.toEqual(
      createError({
        statusCode: 422,
        statusMessage: 'Validation Error',
        data: {
          message: 'id is a required field',
          errors: ['id is a required field'],
        },
      }),
    );

    expect(mockServerApiFetch).not.toHaveBeenCalled();
  });
});
