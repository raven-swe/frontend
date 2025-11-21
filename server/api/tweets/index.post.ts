export default defineWrappedResponseHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization');
  const response = await serverApiFetch<ApiSuccessResponse<User>>(`/tweets`, {
    method: 'POST',
    body: event.node.req,
    headers: {
      authorization: authHeader || '',
    },
  });
  return response;
});
