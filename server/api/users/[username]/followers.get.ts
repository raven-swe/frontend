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
  // note that the backend will update the format to fix this, this is temporary
  const normalizedUsers: CompactUser[] = response.data.map((user) => ({
    ...user,
    relationship: {
      blocking: user.isBlocked,
      blockedBy: false, // Assuming we don't have this info in the current response
      muted: false, // Assuming we don't have this info in the current response
      following: user.isFollowing,
      follower: user.followsYou,
    },
  }));
  const modifiedResponse: ApiSuccessResponse<CompactUser[]> = {
    ...response,
    data: normalizedUsers,
  };
  return modifiedResponse;
});
