import { defineWrappedResponseHandler } from '~~/server/utils/handler';

export default defineWrappedResponseHandler(async (event) => {
  const fetcher = serverApiFetch(event);

  const response = await fetcher<ApiResponseBase>(`/me/banner`, {
    method: 'DELETE',
  });

  return response;
});
