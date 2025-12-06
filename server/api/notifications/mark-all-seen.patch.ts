import { defineWrappedResponseHandler } from '~~/server/utils/handler';

export default defineWrappedResponseHandler(async (event) => {
  const fetcher = serverApiFetch(event);

  const response = await fetcher<ApiSuccessResponse<Notification[]>>(
    '/notifications/mark-all-seen',
    {
      method: 'PATCH',
    },
  );

  return response;
});
