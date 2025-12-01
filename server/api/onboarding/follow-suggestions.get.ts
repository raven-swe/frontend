import { defineWrappedResponseHandler } from '~~/server/utils/handler';

export default defineWrappedResponseHandler(async (event) => {
  const fetcher = serverApiFetch(event);
  const query = getQuery(event);
  return await fetcher<ApiSuccessResponse<CompactUser[]>>('/onboarding/follow-suggestions', {
    method: 'GET',
    query,
  });
});
