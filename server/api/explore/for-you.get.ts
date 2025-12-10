import { defineWrappedResponseHandler } from '~~/server/utils/handler';

export default defineWrappedResponseHandler(async (event) => {
  const fetcher = serverApiFetch(event);
  return await fetcher<ApiSuccessResponse<{ categories: { category: string; tweets: Tweet[] }[] }>>(
    '/explore/for-you',
    {
      method: 'GET',
    },
  );
});
