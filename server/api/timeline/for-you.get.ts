import type { Tweet } from '~~/shared/types/tweets';
import type { timelineSchema, Pagination } from '~~/app/services/home/homeService';
import { defineWrappedResponseHandler } from '~~/server/utils/handler';
export default defineWrappedResponseHandler(async (event) => {
  const query = getQuery<{ timeline: timelineSchema }>(event);
  const response = await serverApiFetch<
    ApiSuccessResponse<{ data: Tweet[]; pagination: Pagination }>
  >('/timeline/for-you', {
    method: 'GET',
    query: query,
  });
  return response;
});
