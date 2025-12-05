import { apiFetch } from '~/api';
import { PeopleFilter, type SearchQuery, type TweetsSearchQuery } from '~~/shared/types/search';

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
    const usersResponse = await this.getPeople({
      pagination: { cursor: null, limit: 10 },
      query: query,
      peopleFilter: PeopleFilter.anyone,
      removeBlocked: false,
    });
    const users = usersResponse.data;
    const hashtagsResponse = await this.getTopThreeHashtags(query);
    const hashtags: [string] = hashtagsResponse.data;
    return {
      users,
      hashtags,
    };
  },

  async getTweets(tweetsSearchQuery: TweetsSearchQuery) {
    return apiFetch(`/api/search/tweets`, {
      method: 'GET',
      query: {
        query: tweetsSearchQuery.query,
        tab: tweetsSearchQuery.tab,
        limit: tweetsSearchQuery.pagination.limit,
        cursor: tweetsSearchQuery.pagination.cursor ?? undefined,
        peopleFilter: tweetsSearchQuery.peopleFilter,
        excludeMutedAndBlocked: tweetsSearchQuery.removeBlocked,
      },
    });
  },

  async getPeople(peopleSearchQuery: SearchQuery) {
    return apiFetch(`/api/search/users`, {
      method: 'GET',
      query: {
        query: peopleSearchQuery.query,
        limit: peopleSearchQuery.pagination.limit,
        cursor: peopleSearchQuery.pagination.cursor ?? undefined,
        peopleFilter: peopleSearchQuery.peopleFilter,
        excludeMutedAndBlocked: peopleSearchQuery.removeBlocked,
      },
    });
  },
};
