import type { ApiSuccessResponse } from '../../../shared/types/api';

const API_URL = process.env.BACKEND_URL;

export default defineWrappedResponseHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization');
  const response = await serverApiFetch<ApiSuccessResponse<User>>(`${API_URL}/me`, {
    method: 'PATCH',
    body: event.node.req,
    headers: {
      authorization: authHeader || '',
      'content-type': event.node.req.headers['content-type']!,
    },
  });

  return response;
});
