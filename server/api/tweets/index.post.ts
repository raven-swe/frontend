export default defineWrappedResponseHandler(async (event) => {
  const fetcher = serverApiFetch(event);

  const response = await fetcher<ApiSuccessResponse<User>>(`/tweets`, {
    method: 'POST',
    body: event.node.req,
  });
  return response;
});
