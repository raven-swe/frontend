import { registerEndpoint } from '@nuxt/test-utils/runtime';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exploreService } from '@/services/explore/exploreService';
import type { TrendingHashtag } from '~~/shared/types/hashtag';
import type { Tweet } from '~~/shared/types/tweet';

describe('exploreService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getExploreTab', () => {
    it('calls API with correct params for "trending" tab', async () => {
      const mockData: TrendingHashtag[] = [
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
      ];

      registerEndpoint('/api/explore/trending', () => {
        return {
          data: mockData,
          message: 'Success',
        };
      });

      const res = await exploreService.getExploreTab('trending');

      expect(res).toEqual({
        data: mockData,
        message: 'Success',
      });
      expect(res.data).toHaveLength(2);
      expect(res.data[0].hashtag).toBe('trending1');
    });

    it('calls API with correct params for "news" tab', async () => {
      const mockData: TrendingHashtag[] = [
        {
          hashtag: 'breakingnews',
          tweetsCount: 2000,
          category: 'News',
        },
      ];

      registerEndpoint('/api/explore/news', () => {
        return {
          data: mockData,
          message: 'Success',
        };
      });

      const res = await exploreService.getExploreTab('news');

      expect(res).toEqual({
        data: mockData,
        message: 'Success',
      });
      expect(res.data[0].category).toBe('News');
    });

    it('calls API with correct params for "sports" tab', async () => {
      const mockData: TrendingHashtag[] = [
        {
          hashtag: 'football',
          tweetsCount: 3000,
          category: 'Sports',
        },
      ];

      registerEndpoint('/api/explore/sports', () => {
        return {
          data: mockData,
          message: 'Success',
        };
      });

      const res = await exploreService.getExploreTab('sports');

      expect(res.data[0].hashtag).toBe('football');
    });

    it('calls API with correct params for "entertainment" tab', async () => {
      const mockData: TrendingHashtag[] = [
        {
          hashtag: 'movies',
          tweetsCount: 1500,
          category: 'Entertainment',
        },
      ];

      registerEndpoint('/api/explore/entertainment', () => {
        return {
          data: mockData,
          message: 'Success',
        };
      });

      const res = await exploreService.getExploreTab('entertainment');

      expect(res.data[0].category).toBe('Entertainment');
    });

    it('handles empty response', async () => {
      registerEndpoint('/api/explore/trending', () => {
        return {
          data: [],
          message: 'Success',
        };
      });

      const res = await exploreService.getExploreTab('trending');

      expect(res.data).toHaveLength(0);
    });
  });

  describe('getCategorizedTweets', () => {
    it('calls API and returns categorized tweets', async () => {
      const mockData = {
        categories: [
          {
            category: 'Technology',
            tweets: [
              {
                id: '1',
                text: 'Tech tweet',
                user: {
                  id: '1',
                  username: 'techuser',
                  fullName: 'Tech User',
                },
              } as Tweet,
            ],
          },
          {
            category: 'Sports',
            tweets: [
              {
                id: '2',
                text: 'Sports tweet',
                user: {
                  id: '2',
                  username: 'sportsuser',
                  fullName: 'Sports User',
                },
              } as Tweet,
            ],
          },
        ],
      };

      registerEndpoint('/api/explore/for-you', () => {
        return {
          data: mockData,
          message: 'Success',
        };
      });

      const res = await exploreService.getCategorizedTweets();

      expect(res).toEqual({
        data: mockData,
        message: 'Success',
      });
      expect(res.data.categories).toHaveLength(2);
      expect(res.data.categories[0].category).toBe('Technology');
      expect(res.data.categories[0].tweets).toHaveLength(1);
      expect(res.data.categories[1].category).toBe('Sports');
    });

    it('handles empty categories', async () => {
      registerEndpoint('/api/explore/for-you', () => {
        return {
          data: {
            categories: [],
          },
          message: 'Success',
        };
      });

      const res = await exploreService.getCategorizedTweets();

      expect(res.data.categories).toHaveLength(0);
    });

    it('handles categories with empty tweets', async () => {
      const mockData = {
        categories: [
          {
            category: 'Technology',
            tweets: [],
          },
        ],
      };

      registerEndpoint('/api/explore/for-you', () => {
        return {
          data: mockData,
          message: 'Success',
        };
      });

      const res = await exploreService.getCategorizedTweets();

      expect(res.data.categories).toHaveLength(1);
      expect(res.data.categories[0].tweets).toHaveLength(0);
    });
  });
});
