import { defineWrappedResponseHandler } from '~~/server/utils/handler';
import type { CompactUser } from '~~/shared/types/user';

export default defineWrappedResponseHandler(async (event) => {
  const fetcher = serverApiFetch(event);
  const query = getQuery(event);

  const response = await fetcher<ApiSuccessResponse<Omit<CompactUser, 'relationship'>[]>>(
    `/me/settings/blocks`,
    {
      method: 'GET',
      query,
    },
  );
  // note that the backend will update the format to fix this, this is temporary
  const normalizedUsers: CompactUser[] = response.data.map((user) => ({
    ...user,
    relationship: {
      blocking: true,
      blockedBy: false,
      muted: false,
      following: false,
      follower: false,
    },
  }));
  const modifiedResponse: ApiSuccessResponse<CompactUser[]> = {
    ...response,
    data: normalizedUsers,
  };
  return modifiedResponse;
});
