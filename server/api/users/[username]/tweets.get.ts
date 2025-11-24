import { defineWrappedResponseHandler } from '~~/server/utils/handler';
import usernameParamsSchema from '~~/server/schemas/username';

export default defineWrappedResponseHandler(async (event) => {
  const { username } = await getValidatedRouterParams(event, (data) =>
    usernameParamsSchema.validate(data),
  );
  const fetcher = serverApiFetch(event);
  const query = getQuery(event);

  const response = await fetcher<ApiSuccessResponse<Tweet[]>>(`/users/${username}/tweets`, {
    method: 'GET',
    query,
  });
  return response;
});
