export default defineWrappedResponseHandler(async (event) => {
  const fetcher = serverApiFetch(event);
  const body = await readBody(event);

  const response = await fetcher<
    ApiSuccessResponse<{
      id: string;
      url: string;
    }>
  >(`/media/upload/gif`, {
    method: 'POST',
    body: body,
  });

  return response;
});
