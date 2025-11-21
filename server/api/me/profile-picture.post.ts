import { defineWrappedResponseHandler } from '~~/server/utils/handler';

export default defineWrappedResponseHandler(async (event) => {
  const fetcher = serverApiFetch(event);

  const response = await fetcher<ApiResponseBase>(`/me/profile-picture`, {
    method: 'POST',
    body: event.node.req,
    headers: {
      'content-type': event.node.req.headers['content-type']!,
    },
  });

  return response;
});
