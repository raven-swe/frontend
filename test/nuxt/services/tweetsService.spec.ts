import { registerEndpoint } from '@nuxt/test-utils/runtime';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { tweetsService } = await import('@/services/tweet/tweetsService');

describe('tweetsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('tweet calls API with correct params and returns response', async () => {
    const mockTweet = {
      id: '123',
      content: 'Test tweet',
      author: {
        username: 'testuser',
        displayName: 'Test User',
        avatarUrl: 'https://example.com/avatar.jpg',
        isFollowing: false,
        isFollower: false,
      },
      createdAt: new Date().toISOString(),
      replyCount: 0,
      retweetCount: 0,
      likeCount: 0,
      isLiked: false,
      isRetweeted: false,
      entities: { mentions: [], hashtags: [] },
      media: [],
    };

    registerEndpoint('/api/tweets/123', () => {
      return {
        data: mockTweet,
      };
    });

    const res = await tweetsService.tweet('123');

    expect(res).toEqual({
      data: mockTweet,
    });
  });

  it('replies calls API with correct params and returns response', async () => {
    const mockReplies = [
      {
        id: '456',
        content: 'Reply 1',
        author: {
          username: 'replier',
          displayName: 'Replier',
          avatarUrl: 'https://example.com/avatar2.jpg',
          isFollowing: false,
          isFollower: false,
        },
        createdAt: new Date().toISOString(),
        replyCount: 0,
        retweetCount: 0,
        likeCount: 0,
        isLiked: false,
        isRetweeted: false,
        entities: { mentions: [], hashtags: [] },
        media: [],
      },
    ];

    registerEndpoint('/api/tweets/456/replies', () => {
      return {
        data: {
          data: mockReplies,
          pagination: { cursor: '0', nextCursor: null, hasNextPage: false },
        },
      };
    });

    const payload = { limit: 10, cursor: null };
    const res = await tweetsService.replies({ tweetid: '456', ...payload });

    expect(res).toEqual({
      data: {
        data: mockReplies,
        pagination: { cursor: '0', nextCursor: null, hasNextPage: false },
      },
    });
  });

  it('replies calls API with cursor and returns response', async () => {
    const mockReplies = [
      {
        id: '789',
        content: 'Reply 2',
        author: {
          username: 'replier2',
          displayName: 'Replier 2',
          avatarUrl: 'https://example.com/avatar3.jpg',
          isFollowing: false,
          isFollower: false,
        },
        createdAt: new Date().toISOString(),
        replyCount: 0,
        retweetCount: 0,
        likeCount: 0,
        isLiked: false,
        isRetweeted: false,
        entities: { mentions: [], hashtags: [] },
        media: [],
      },
    ];

    registerEndpoint('/api/tweets/789/replies', () => {
      return {
        data: {
          data: mockReplies,
          pagination: { cursor: 'cursor-1', nextCursor: 'cursor-2', hasNextPage: true },
        },
      };
    });

    const payload = { limit: 10, cursor: 'cursor-1' };
    const res = await tweetsService.replies({ tweetid: '789', ...payload });

    expect(res).toEqual({
      data: {
        data: mockReplies,
        pagination: { cursor: 'cursor-1', nextCursor: 'cursor-2', hasNextPage: true },
      },
    });
  });
});
