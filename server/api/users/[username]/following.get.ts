import { defineWrappedResponseHandler } from '~~/server/utils/handler';
import usernameParamsSchema from '~~/server/schemas/username';
import type { CompactUser } from '~~/shared/types/user';

export default defineWrappedResponseHandler(async (event) => {
  const { username } = await getValidatedRouterParams(event, (data) =>
    usernameParamsSchema.validate(data),
  );
  const fetcher = serverApiFetch(event);
  const query = getQuery(event);

  const response = await fetcher<ApiSuccessResponse<CompactUser[]>>(
    `/users/${username}/following`,
    {
      method: 'GET',
      query,
    },
  );
  return response;
});
