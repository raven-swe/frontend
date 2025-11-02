import type { Tweet } from '~~/shared/types/tweets';
import type { timelineSchema } from '~~/app/services/home/homeService';
import { defineWrappedResponseHandler } from '~~/server/utils/handler';
export default defineWrappedResponseHandler(async (event) => {
  const query = getQuery<{ timeline: timelineSchema }>(event);
  const authHeader = getHeader(event, 'authorization');
  const response = await serverApiFetch<ApiSuccessResponse<Tweet[]>>('/timeline/for-you', {
    method: 'GET',
    query: query,
    headers: {
      Authorization: authHeader,
    },
  });
  return response;
});
