export default defineWrappedResponseHandler(async (event) => {
  const params = event.context.params;
  const conversationId = params?.conversationId as string;
  const authHeader = getHeader(event, 'Authorization');
  const response = await serverApiFetch<ApiSuccessResponse<DmConversation>>(
    `/conversations/${conversationId}`,
    {
      method: 'GET',
      headers: {
        Authorization: authHeader || '',
      },
    },
  );
  return response;
});
