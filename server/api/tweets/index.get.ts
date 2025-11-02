import type { Tweet } from '~~/shared/types/tweets';
import { defineWrappedResponseHandler } from '~~/server/utils/handler';

export default defineWrappedResponseHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization');
  return await serverApiFetch<ApiSuccessResponse<Tweet[]>>('/tweets', {
    method: 'GET',
    headers: {
      Authorization: authHeader || '',
    },
  });
});
