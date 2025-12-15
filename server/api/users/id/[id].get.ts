import { defineWrappedResponseHandler } from '~~/server/utils/handler';

export default defineWrappedResponseHandler(async (event) => {
  const { id } = event.context.params as { id: string };
  const fetcher = serverApiFetch(event);

  const response = await fetcher<ApiSuccessResponse<User>>(`/users/${id}/profile`, {
    method: 'GET',
  });

  // note that this is temporary until the real backend implementation is done
  const modifiedResponse: ApiSuccessResponse<{
    username: string;
    displayName: string;
  }> = {
    ...response,
    data: {
      username: response.data.username,
      displayName: response.data.displayName,
    },
  };
  return modifiedResponse;
});
