import type { ApiSuccessResponse } from '~~/shared/types/api';

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization');

  const response = await serverApiFetch<ApiSuccessResponse<{ success: boolean; message: string }>>(
    `/me/banner`,
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
