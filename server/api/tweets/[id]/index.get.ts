import type { Tweet } from '~~/shared/types/tweets';
import { defineWrappedResponseHandler } from '~~/server/utils/handler';

export default defineWrappedResponseHandler(async (event) => {
  const { id } = event.context.params as { id: string };
  const authHeader = getHeader(event, 'authorization');
  return await serverApiFetch<ApiSuccessResponse<Tweet>>(`/tweets/${id}`, {
    method: 'GET',
    headers: {
      Authorization: authHeader || '',
    },
  });
});
