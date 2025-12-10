import type { TrendingHashtag } from '~~/shared/types/hashtag';
import { defineWrappedResponseHandler } from '~~/server/utils/handler';

export default defineWrappedResponseHandler(async (event) => {
  const fetcher = serverApiFetch(event);
  return await fetcher<ApiSuccessResponse<TrendingHashtag[]>>('/explore/sports', {
    method: 'GET',
  });
});
