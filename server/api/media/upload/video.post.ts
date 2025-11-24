export default defineWrappedResponseHandler(async (event) => {
  const fetcher = serverApiFetch(event);

  const response = await fetcher<
    ApiSuccessResponse<{
      id: string;
      url: string;
    }>
  >(`/media/upload/video`, {
    method: 'POST',
    body: event.node.req,
    headers: {
      'content-type': event.node.req.headers['content-type']!,
    },
  });

  return response;
});
