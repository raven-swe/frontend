import type { DmMessage } from '~~/shared/types/dm';

export default defineWrappedResponseHandler(async (event) => {
  const params = event.context.params;
  const conversationId = params?.conversationId as string;
  const authHeader = getHeader(event, 'Authorization');
  const response = await serverApiFetch<ApiSuccessResponse<DmMessage[]>>(
    `/conversations/${conversationId}/messages`,
    {
      method: 'GET',
      headers: {
        Authorization: authHeader || '',
      },
    },
  );
  return response;
});
