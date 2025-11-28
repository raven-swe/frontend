import { apiFetch } from '~/api';
import type { ExploreTab } from '~~/shared/types/timeline';
// import type { PaginationParams } from '~~/shared/types/pagination';
import type { TrendingHashtag } from '~~/shared/types/hashtag';

export const exploreService = {
  async getExploreTab(tab: ExploreTab) {
    return await apiFetch<ApiSuccessResponse<TrendingHashtag[]>>(`/api/explore/${tab}`, {
      method: 'GET',
    });
  },

  async getForYou() {
    return await apiFetch('/api/explore/for-you', {
      method: 'GET',
    });
  },
};
