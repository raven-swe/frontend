import { defineWrappedResponseHandler } from '~~/server/utils/handler';

export default defineWrappedResponseHandler(async (event) => {
  const query = getQuery(event);
  const fetcher = serverApiFetch(event);

  const response = await fetcher<ApiSuccessResponse<Notification[]>>('/notifications', {
    method: 'GET',
    query,
  });

  return response;
});
