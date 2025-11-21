import type { Tweet } from '~~/shared/types/tweets';
import { defineWrappedResponseHandler } from '~~/server/utils/handler';

export default defineWrappedResponseHandler(async (event) => {
  const fetcher = serverApiFetch(event);
  return await fetcher<ApiSuccessResponse<Tweet[]>>('/tweets', {
    method: 'GET',
  });
});
