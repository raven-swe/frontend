import { defineWrappedResponseHandler } from '~~/server/utils/handler';

export default defineWrappedResponseHandler(async (event) => {
  const body = await readBody<{ interests: string[] }>(event);
  const fetcher = serverApiFetch(event);
  return await fetcher<ApiResponseBase>('/me/settings/interests', {
    method: 'PUT',
    body,
  });
});
