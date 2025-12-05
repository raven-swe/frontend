import { apiFetch } from '~/api';
import type { Tweet } from '~~/shared/types/tweets';
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
    return await apiFetch<ApiSuccessResponse<Tweet>>(`/api/tweets/${tweetId}`);
  },

  async replies(tweetId: string, timeline: timelineSchema) {
    return await apiFetch<ApiSuccessResponse<Tweet[]>>(`/api/tweets/${tweetId}/replies`, {
      method: 'GET',
      query: {
        limit: timeline.limit,
        cursor: timeline.cursor ?? undefined,
      },
    });
  },
};
