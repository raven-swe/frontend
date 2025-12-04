import type { DmConversationMessagesResponse } from '~~/shared/types/dm';

export default defineWrappedResponseHandler(async (event) => {
  const params = event.context.params;
  const query = getQuery<{ cursor?: string; limit?: number }>(event);
  const conversationId = params?.conversationId as string;
  const fetcher = serverApiFetch(event);
  const response = await fetcher<ApiSuccessResponse<DmConversationMessagesResponse>>(
    `/conversations/${conversationId}/messages`,
    {
      method: 'GET',
      query: {
        cursor: query.cursor,
        limit: query.limit || 20,
      },
    },
  );
  return response;
});
