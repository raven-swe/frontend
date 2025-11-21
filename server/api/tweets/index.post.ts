export default defineWrappedResponseHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization');
  const response = await serverApiFetch<ApiSuccessResponse<User>>(`/tweets`, {
    headers: {
      authorization: authHeader || '',
    },
  });
  return response;
});
