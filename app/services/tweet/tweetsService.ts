import { apiFetch } from '~/api';
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
