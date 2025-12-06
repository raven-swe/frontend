import { defineWrappedResponseHandler } from '~~/server/utils/handler';

export default defineWrappedResponseHandler(async (event) => {
  const fetcher = serverApiFetch(event);

  const response = await fetcher<ApiSuccessResponse<Notification[]>>('/notifications/seen', {
    method: 'PATCH',
  });

  return response;
});
