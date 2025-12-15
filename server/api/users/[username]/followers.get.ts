import { defineWrappedResponseHandler } from '~~/server/utils/handler';
import usernameParamsSchema from '~~/server/schemas/username';
import type { CompactUser } from '~~/shared/types/user';

type ModifiedCompactUser = CompactUser & {
  isFollowing: boolean;
  followsYou: boolean;
  isBlocked: boolean;
};

export default defineWrappedResponseHandler(async (event) => {
  const { username } = await getValidatedRouterParams(event, (data) =>
    usernameParamsSchema.validate(data),
  );
  const fetcher = serverApiFetch(event);
  const query = getQuery(event);

  const response = await fetcher<ApiSuccessResponse<ModifiedCompactUser[]>>(
    `/users/${username}/followers`,
    {
      method: 'GET',
      query,
    },
  );
  return response;
});
