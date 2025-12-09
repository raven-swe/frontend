import { defineWrappedResponseHandler } from '~~/server/utils/handler';
import * as yup from 'yup';

const paramsSchema = yup.object({ id: yup.string().required().min(1) });

type RetweetUser = {
  username: 'string';
  displayName: 'string';
  avatarUrl: 'string';
  isFollowing?: boolean;
  isFollower?: boolean;
  isBlocked?: boolean;
  isMuted?: boolean;
  bio?: {
    text?: string;
    bioEntities?: ContentEntities | null;
  };
};

export default defineWrappedResponseHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, (data) => paramsSchema.validate(data));
  const fetcher = serverApiFetch(event);
  const query = getQuery(event);

  const response = await fetcher<ApiSuccessResponse<RetweetUser[]>>(`/tweets/${id}/retweets`, {
    method: 'GET',
    query,
  });
  // note that the backend will update the format to fix this, this is temporary
  const normalizedUsers: CompactUser[] = response.data.map((user) => {
    const { bio, ...rest } = user;
    return {
      relationship: {
        blocking: user.isBlocked ?? false,
        blockedBy: false,
        muted: user.isMuted ?? false,
        following: user.isFollowing ?? false,
        follower: user.isFollower ?? false,
      },
      bioEntities: bio?.bioEntities ?? null,
      bio: bio?.text ?? null,
      ...rest,
    };
  });
  const modifiedResponse: ApiSuccessResponse<CompactUser[]> = {
    ...response,
    data: normalizedUsers,
  };
  return modifiedResponse;
});
