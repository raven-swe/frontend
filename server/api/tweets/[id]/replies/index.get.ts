import type { Tweet } from '~~/shared/types/tweets';
import type { timelineSchema } from '~~/app/services/home/homeService';
import { defineWrappedResponseHandler } from '~~/server/utils/handler';
export default defineWrappedResponseHandler(async (event) => {
  const id = getRouterParams(event).id as string;
  const query = getQuery<{ timeline: timelineSchema }>(event);
  const authHeader = getHeader(event, 'Authorization');
  const response = await serverApiFetch<ApiSuccessResponse<Tweet[]>>(`/tweets/${id}/replies`, {
    method: 'GET',
    query: query,
    headers: { Authorization: authHeader || '' },
  });
  return response;
});
