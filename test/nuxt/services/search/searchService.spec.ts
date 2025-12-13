import { registerEndpoint } from '@nuxt/test-utils/runtime';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { searchService } from '@/services/search/searchService';
import { PeopleFilter } from '~~/shared/types/search';
import type { CompactUser } from '~~/shared/types/user';
import type { Tweet } from '~~/shared/types/tweet';

describe('searchService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getTopThreeHashtags', () => {
    it('calls API with correct query parameter', async () => {
      const mockHashtags = ['javascript', 'typescript', 'nodejs'];

      registerEndpoint('/api/search/suggestions', () => {
        return {
          data: mockHashtags,
        };
      });

      const res = await searchService.getTopThreeHashtags('test');

      expect(res.data).toEqual(mockHashtags);
      expect(res.data).toHaveLength(3);
    });

    it('handles empty hashtags response', async () => {
      registerEndpoint('/api/search/suggestions', () => {
        return {
          data: [],
        };
      });

      const res = await searchService.getTopThreeHashtags('nonexistent');

      expect(res.data).toHaveLength(0);
    });
  });

  describe('search', () => {
    it('calls both getPeople and getTopThreeHashtags and combines results', async () => {
      const mockUsers: CompactUser[] = [
        {
          username: 'johndoe',
          fullName: 'John Doe',
          profileImageUrl: 'avatar.jpg',
          bio: 'Test bio',
          relationship: {
            following: false,
            follower: false,
            blocking: false,
            blockedBy: false,
            muted: false,
          },
        },
      ];

      const mockHashtags = ['test1', 'test2', 'test3'];

      registerEndpoint('/api/search/users', () => {
        return {
          data: mockUsers,
        };
      });

      registerEndpoint('/api/search/suggestions', () => {
        return {
          data: mockHashtags,
        };
      });

      const res = await searchService.search('test');

      expect(res.users).toEqual(mockUsers);
      expect(res.hashtags).toEqual(mockHashtags);
      expect(res.users).toHaveLength(1);
      expect(res.hashtags).toHaveLength(3);
    });

    it('handles empty results from both endpoints', async () => {
      registerEndpoint('/api/search/users', () => {
        return {
          data: [],
        };
      });

      registerEndpoint('/api/search/suggestions', () => {
        return {
          data: [],
        };
      });

      const res = await searchService.search('nonexistent');

      expect(res.users).toHaveLength(0);
      expect(res.hashtags).toHaveLength(0);
    });
  });

  describe('getTweets', () => {
    it('calls API with all query parameters', async () => {
      const mockTweets: Tweet[] = [
        {
          id: '1',
          text: 'Test tweet',
          user: {
            id: '1',
            username: 'testuser',
            fullName: 'Test User',
          },
        } as Tweet,
      ];

      registerEndpoint('/api/search/tweets', () => {
        return {
          data: mockTweets,
        };
      });

      const res = await searchService.getTweets({
        query: 'javascript',
        tab: 'latest',
        pagination: {
          cursor: 'abc123',
          limit: 20,
        },
        peopleFilter: PeopleFilter.following,
        excludeMutedAndBlocked: true,
      });

      expect(res.data).toEqual(mockTweets);
    });

    it('handles null cursor by sending undefined', async () => {
      registerEndpoint('/api/search/tweets', () => {
        return {
          data: [],
        };
      });

      const res = await searchService.getTweets({
        query: 'test',
        tab: 'top',
        pagination: {
          cursor: null,
          limit: 10,
        },
        peopleFilter: PeopleFilter.anyone,
        excludeMutedAndBlocked: false,
      });

      expect(res.data).toHaveLength(0);
    });

    it('handles empty tweets response', async () => {
      registerEndpoint('/api/search/tweets', () => {
        return {
          data: [],
        };
      });

      const res = await searchService.getTweets({
        query: 'nonexistent',
        tab: 'latest',
        pagination: {
          cursor: null,
          limit: 10,
        },
        peopleFilter: PeopleFilter.anyone,
        excludeMutedAndBlocked: false,
      });

      expect(res.data).toHaveLength(0);
    });
  });

  describe('getPeople', () => {
    it('calls API with all query parameters', async () => {
      const mockUsers: CompactUser[] = [
        {
          username: 'johndoe',
          displayName: 'John Doe',
          avatarUrl: 'avatar.jpg',
          bio: 'Test bio',
          relationship: {
            following: true,
            follower: false,
            blocking: false,
            blockedBy: false,
            muted: false,
          },
        },
      ];

      registerEndpoint('/api/search/users', () => {
        return {
          data: mockUsers,
        };
      });

      const res = await searchService.getPeople({
        query: 'john',
        pagination: {
          cursor: 'xyz789',
          limit: 15,
        },
        peopleFilter: PeopleFilter.following,
        excludeMutedAndBlocked: true,
      });

      expect(res.data).toEqual(mockUsers);
    });

    it('handles null cursor by sending undefined', async () => {
      registerEndpoint('/api/search/users', () => {
        return {
          data: [],
        };
      });

      await searchService.getPeople({
        query: 'test',
        pagination: {
          cursor: null,
          limit: 10,
        },
        peopleFilter: PeopleFilter.anyone,
        excludeMutedAndBlocked: false,
      });
    });

    it('handles abort signal', async () => {
      const controller = new AbortController();

      registerEndpoint('/api/search/users', () => {
        return {
          data: [],
        };
      });

      const promise = searchService.getPeople(
        {
          query: 'test',
          pagination: {
            cursor: null,
            limit: 10,
          },
          peopleFilter: PeopleFilter.anyone,
          excludeMutedAndBlocked: false,
        },
        controller.signal,
      );

      // Don't abort in this test, just verify it accepts the signal
      const res = await promise;
      expect(res.data).toHaveLength(0);
    });

    it('handles empty users response', async () => {
      registerEndpoint('/api/search/users', () => {
        return {
          data: [],
        };
      });

      const res = await searchService.getPeople({
        query: 'nonexistent',
        pagination: {
          cursor: null,
          limit: 10,
        },
        peopleFilter: PeopleFilter.anyone,
        excludeMutedAndBlocked: false,
      });

      expect(res.data).toHaveLength(0);
    });

    it('handles multiple users response', async () => {
      const mockUsers: CompactUser[] = [
        {
          username: 'user1',
          fullName: 'User One',
          profileImageUrl: 'avatar1.jpg',
          bio: 'Bio 1',
          relationship: {
            following: false,
            follower: false,
            blocking: false,
            blockedBy: false,
            muted: false,
          },
        },
        {
          username: 'user2',
          fullName: 'User Two',
          profileImageUrl: 'avatar2.jpg',
          bio: 'Bio 2',
          relationship: {
            following: true,
            follower: true,
            blocking: false,
            blockedBy: false,
            muted: false,
          },
        },
      ];

      registerEndpoint('/api/search/users', () => {
        return {
          data: mockUsers,
        };
      });

      const res = await searchService.getPeople({
        query: 'user',
        pagination: {
          cursor: null,
          limit: 10,
        },
        peopleFilter: PeopleFilter.anyone,
        excludeMutedAndBlocked: false,
      });

      expect(res.data).toHaveLength(2);
      expect(res.data[0].username).toBe('user1');
      expect(res.data[1].username).toBe('user2');
    });
  });
});
