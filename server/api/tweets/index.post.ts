export default defineWrappedResponseHandler(async (event) => {
  const fetcher = serverApiFetch(event);
  const body = await readBody(event);
  const response = await fetcher<ApiSuccessResponse<Tweet>>(`/tweets`, {
    method: 'POST',
    body,
  });
  return response;
});
