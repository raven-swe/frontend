import { apiFetch } from '~/api';
import type { ExploreTab } from '~~/shared/types/timeline';
import type { TrendingHashtag } from '~~/shared/types/hashtag';
import type { Tweet } from '~~/shared/types/tweet';

export const exploreService = {
  async getExploreTab(tab: ExploreTab) {
    return await apiFetch<ApiSuccessResponse<TrendingHashtag[]>>(`/api/explore/${tab}`, {
      method: 'GET',
    });
  },

  async getCategorizedTweets() {
    return await apiFetch<
      ApiSuccessResponse<{ categories: { category: string; tweets: Tweet[] }[] }>
    >('/api/explore/for-you', {
      method: 'GET',
    });
  },
};
