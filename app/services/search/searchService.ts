import { apiFetch } from '~/api';
import { DEFAULT_PAGE_SIZE } from '~/constants/pagination';
import { PeopleFilter, type SearchQuery, type TweetsSearchQuery } from '~~/shared/types/search';

export const searchService = {
  async getTopThreeHashtags(query: string) {
    return await apiFetch(`/api/search/suggestions`, {
      method: 'GET',
      query: {
        query: query,
      },
    });
  },

  async search(query: string) {
    const usersResponse = await this.getPeople({
      pagination: { cursor: null, limit: 10 },
      query: query,
      peopleFilter: PeopleFilter.anyone,
      excludeMutedAndBlocked: false,
    });
    const users = usersResponse.data;
    const hashtagsResponse = await this.getTopThreeHashtags(query);
    const hashtags: string[] = hashtagsResponse.data;
    return {
      users,
      hashtags,
    };
  },

  async getTweets(tweetsSearchQuery: TweetsSearchQuery, signal?: AbortSignal) {
    return apiFetch(`/api/search/tweets`, {
      method: 'GET',
      query: {
        query: tweetsSearchQuery.query,
        tab: tweetsSearchQuery.tab,
        limit: (tweetsSearchQuery.pagination.limit ?? DEFAULT_PAGE_SIZE).toString(),
        cursor: tweetsSearchQuery.pagination.cursor ?? undefined,
        peopleFilter: tweetsSearchQuery.peopleFilter,
        excludeMutedAndBlocked: tweetsSearchQuery.excludeMutedAndBlocked,
      },
      signal,
    });
  },

  async getPeople(peopleSearchQuery: SearchQuery, signal?: AbortSignal) {
    return apiFetch(`/api/search/users`, {
      method: 'GET',
      query: {
        query: peopleSearchQuery.query,
        limit: (peopleSearchQuery.pagination.limit ?? DEFAULT_PAGE_SIZE).toString(),
        cursor: peopleSearchQuery.pagination.cursor ?? undefined,
        peopleFilter: peopleSearchQuery.peopleFilter,
        excludeMutedAndBlocked: peopleSearchQuery.excludeMutedAndBlocked,
      },
      signal,
    });
  },
};
