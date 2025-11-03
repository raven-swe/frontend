import { defineWrappedResponseHandler } from '~~/server/utils/handler';

export default defineWrappedResponseHandler(async (event) => {
  const body = await readBody<UpdateProfileRequest>(event);
  const fetcher = serverApiFetch(event);

  const response = await fetcher<ApiSuccessResponse<User>>('/me', {
    method: 'PATCH',
    body,
  });

  return response;
});
