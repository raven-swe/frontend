import type { ApiSuccessResponse } from '~~/shared/types/api';

export default defineWrappedResponseHandler(async (event) => {
  const fetcher = serverApiFetch(event);

  const response = await fetcher<ApiSuccessResponse<{ success: boolean; message: string }>>(
    `/media/upload/video`,
    {
      method: 'POST',
      body: event.node.req,
      headers: {
        'content-type': event.node.req.headers['content-type']!,
      },
    },
  );

  return response;
});
