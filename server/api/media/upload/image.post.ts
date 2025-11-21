import type { ApiSuccessResponse } from '~~/shared/types/api';

export default defineWrappedResponseHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization');

  const response = await serverApiFetch<ApiSuccessResponse<{ success: boolean; message: string }>>(
    `/media/upload/image`,
    {
      method: 'POST',
      body: event.node.req,
      headers: {
        authorization: authHeader || '',
        'content-type': event.node.req.headers['content-type']!,
      },
    },
  );

  return response;
});
