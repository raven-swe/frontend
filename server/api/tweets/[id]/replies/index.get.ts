import type { Tweet } from '~~/shared/types/tweets';
import type { timelineSchema, Pagination } from '~~/app/services/home/homeService';
import { defineWrappedResponseHandler } from '~~/server/utils/handler';
export default defineWrappedResponseHandler(async (event) => {
  const id = getRouterParams(event).id as string;
  const query = getQuery<{ timeline: timelineSchema }>(event);
  const response = await serverApiFetch<
    ApiSuccessResponse<{ data: Tweet[]; pagination: Pagination }>
  >(`/tweets/${id}/replies`, {
    method: 'GET',
    query: query,
  });
  return response;
});
