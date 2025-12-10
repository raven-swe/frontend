import { apiFetch } from '~/api';
import { DEFAULT_PAGE_SIZE } from '~/constants/pagination';
export type timelineSchema = {
  limit: number;
  cursor: string | null;
};
export type Pagination = {
  cursor: string | null;
  nextCursor: string | null;
  hasNextPage: boolean;
};
export const tweetsService = {
  async tweet(tweetId: string) {
    return await apiFetch(`/api/tweets/${tweetId}`);
  },

  async replies(tweetId: string, timeline: timelineSchema) {
    return await apiFetch(`/api/tweets/${tweetId}/replies`, {
      method: 'GET',
      query: {
        limit: timeline.limit,
        cursor: timeline.cursor ?? undefined,
      },
    });
  },

  retweets: async ({
    tweetid,
    cursor,
    limit,
    signal,
  }: {
    tweetid: string;
    cursor: string | null;
    limit?: number;
    signal?: AbortSignal;
  }) => {
    return await apiFetch(`/api/tweets/${tweetid}/retweets`, {
      method: 'GET',
      query: {
        cursor,
        limit: (limit ?? DEFAULT_PAGE_SIZE).toString(),
      },
      signal,
    });
  },

  likes: async ({
    tweetid,
    cursor,
    limit,
    signal,
  }: {
    tweetid: string;
    cursor: string | null;
    limit?: number;
    signal?: AbortSignal;
  }) => {
    return await apiFetch(`/api/tweets/${tweetid}/likes`, {
      method: 'GET',
      query: {
        cursor,
        limit: (limit ?? DEFAULT_PAGE_SIZE).toString(),
      },
      signal,
    });
  },

  quotes: async ({
    tweetid,
    cursor,
    limit,
    signal,
  }: {
    tweetid: string;
    cursor: string | null;
    limit?: number;
    signal?: AbortSignal;
  }) => {
    return await apiFetch(`/api/tweets/${tweetid}/quotes`, {
      method: 'GET',
      query: {
        cursor,
        limit: (limit ?? DEFAULT_PAGE_SIZE).toString(),
      },
      signal,
    });
  },
};

export const tweetAiSummary = async (id: string, locale: string) => {
  return await apiFetch<ApiSuccessResponse<{ id: string; summary: string }>>(
    `/api/tweets/${id}/summary`,
    {
      method: 'GET',
      query: {
        locale: locale,
      },
    },
  );
};
