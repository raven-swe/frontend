import { defineWrappedResponseHandler } from '~~/server/utils/handler';

export default defineWrappedResponseHandler(async (event) => {
  // This is a dummy protected resource that requires authentication
  const fetcher = serverApiFetch(event);
  return await fetcher<ApiSuccessResponse<{ data: string }>>('/auth/dummy-protected-resource', {
    method: 'GET',
  });
});
