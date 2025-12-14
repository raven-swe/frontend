export default defineWrappedResponseHandler(async (event) => {
  const params = event.context.params;
  const conversationId = params?.conversationId as string;
  const messageId = params?.messageId as string;
  const fetcher = serverApiFetch(event);
  const response = await fetcher<ApiResponseBase>(
    `/conversations/${conversationId}/messages/${messageId}`,
    {
      method: 'DELETE',
    },
  );
  return response;
});
