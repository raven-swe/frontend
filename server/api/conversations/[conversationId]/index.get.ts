export default defineWrappedResponseHandler(async (event) => {
  const params = event.context.params;
  const fetcher = serverApiFetch(event);
  const conversationId = params?.conversationId as string;
  const response = await fetcher<ApiSuccessResponse<DmConversation>>(
    `/conversations/${conversationId}`,
  );
  return response;
});
