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
export const homeService = {
  async forYou(timeline: timelineSchema) {
    return await apiFetch<ApiSuccessResponse<{ data: Tweet[]; pagination: Pagination }>>(
      '/api/timeline/for-you',
      {
        method: 'GET',
        query: {
          limit: timeline.limit,
          cursor: timeline.cursor,
        },
      },
    );
  },

  async following(timeline: timelineSchema) {
    return await apiFetch<ApiSuccessResponse<{ data: Tweet[]; pagination: Pagination }>>(
      '/api/timeline/following',
      {
        method: 'GET',
        query: {
          limit: timeline.limit,
          cursor: timeline.cursor ?? undefined,
        },
      },
    );
  },
};
