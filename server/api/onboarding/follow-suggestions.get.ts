import { defineWrappedResponseHandler } from '~~/server/utils/handler';

type ModifiedUser = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  bio: string | null;
  bioEntities: ContentEntities | null;
  relationship: {
    isFollower: boolean;
  };
};

export default defineWrappedResponseHandler(async (event) => {
  const fetcher = serverApiFetch(event);
  const query = getQuery(event);
  const res = await fetcher<ApiSuccessResponse<{ suggestions: ModifiedUser[] }>>(
    '/onboarding/follow-suggestions',
    {
      method: 'GET',
      query,
    },
  );

  const normalizedSuggestions: CompactUser[] = res.data.suggestions.map((user) => ({
    username: user.username,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    bioEntities: user.bioEntities,
    relationship: {
      follower: user.relationship.isFollower,
      following: false,
      blocking: false,
      blockedBy: false,
      muted: false,
    },
  }));

  return {
    ...res,
    data: normalizedSuggestions,
  };
});
