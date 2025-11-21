import type { DmConversation } from '~~/shared/types/dm';

export default defineWrappedResponseHandler(async (event) => {
  const authHeader = getHeader(event, 'Authorization');
  const response = await serverApiFetch<ApiSuccessResponse<DmConversation[]>>('/conversations', {
    method: 'GET',
    headers: {
      Authorization: authHeader || '',
    },
  });
  return response;
});
