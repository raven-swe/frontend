import { defineWrappedResponseHandler } from '~~/server/utils/handler';

export default defineWrappedResponseHandler(async (event) => {
  const { id } = event.context.params as { id: string };
  const authHeader = getHeader(event, 'authorization');

  return await serverApiFetch<ApiResponseBase>(`/tweets/${id}/like`, {
    method: 'POST',
    headers: {
      Authorization: authHeader || '',
    },
  });
});
