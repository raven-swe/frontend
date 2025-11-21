import { apiFetch } from '~/api';

export const homeService = {
  async forYou(timeline: TimelineSchema) {
    return await apiFetch<ApiSuccessResponse<Tweet[]>>('/api/timeline/for-you', {
      method: 'GET',
      query: {
        limit: timeline.limit,
        cursor: timeline.cursor ?? undefined,
      },
    });
  },

  async following(timeline: TimelineSchema) {
    return await apiFetch<ApiSuccessResponse<Tweet[]>>('/api/timeline/following', {
      method: 'GET',
      query: {
        limit: timeline.limit,
        cursor: timeline.cursor ?? undefined,
      },
    });
  },
};
