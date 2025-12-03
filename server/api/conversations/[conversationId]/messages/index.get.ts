import type { DmConversationMessagesResponse } from '~~/shared/types/dm';

export default defineWrappedResponseHandler(async (event) => {
  const params = event.context.params;
  const conversationId = params?.conversationId as string;
  const fetcher = serverApiFetch(event);
  const response = await fetcher<ApiSuccessResponse<DmConversationMessagesResponse>>(
    `/conversations/${conversationId}/messages`,
  );
  return response;
});
