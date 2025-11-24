import { defineWrappedResponseHandler } from '~~/server/utils/handler';
import usernameParamsSchema from '~~/server/schemas/username';

export default defineWrappedResponseHandler(async (event) => {
  const { username } = await getValidatedRouterParams(event, (data) =>
    usernameParamsSchema.validate(data),
  );
  const fetcher = serverApiFetch(event);

  const response = await fetcher<ApiResponseBase>(`/me/blocks/${username}`, {
    method: 'DELETE',
  });
  return response;
});
