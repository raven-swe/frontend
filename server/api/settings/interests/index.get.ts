import { defineWrappedResponseHandler } from '~~/server/utils/handler';

export default defineWrappedResponseHandler(async (event) => {
  const fetcher = serverApiFetch(event);
  return await fetcher<ApiSuccessResponse<Interest[]>>(`/me/settings/interests`, {
    method: 'GET',
  });
});
