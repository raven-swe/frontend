import { apiFetch } from '~/api';
import type { PaginationParams } from '~~/shared/types/pagination';
import type { validSearchTweetsTabs } from '~~/shared/types/timeline';

export const searchService = {
  async getTopThreeHashtags(query: string) {
    return await apiFetch(`/api/search/hashtags/top`, {
      method: 'GET',
      query: {
        query: query,
      },
    });
  },

  async search(query: string) {
    const usersResponse = await this.getPeople({ cursor: null, limit: 10 }, query);
    const users = usersResponse.data;
    const hashtagsResponse = await this.getTopThreeHashtags(query);
    const hashtags: [string] = hashtagsResponse.data;
    return {
      users,
      hashtags,
    };
  },

  async getTweets(
    pagination: PaginationParams,
    query: string,
    tab: (typeof validSearchTweetsTabs)[number],
  ) {
    return apiFetch(`/api/search/tweets`, {
      method: 'GET',
      query: {
        query: query,
        tab: tab,
        limit: pagination.limit,
        cursor: pagination.cursor ?? undefined,
      },
    });
  },

  async getPeople(pagination: PaginationParams, query: string) {
    return apiFetch(`/api/search/users`, {
      method: 'GET',
      query: {
        query: query,
        limit: pagination.limit,
        cursor: pagination.cursor ?? undefined,
      },
    });
  },
};
