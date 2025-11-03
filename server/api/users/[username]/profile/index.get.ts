import { defineWrappedResponseHandler } from '~~/server/utils/handler';

export default defineWrappedResponseHandler(async (event) => {
  const params = event.context.params;
  const username = params?.username as string;
  const fetcher = serverApiFetch(event);

  const response = await fetcher<ApiSuccessResponse<User>>(`/users/${username}/profile`, {
    method: 'GET',
  });
  return response;
});
