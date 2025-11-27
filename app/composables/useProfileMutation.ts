import { useMutation } from '@tanstack/vue-query';
import type { FetchError } from 'ofetch';
import { profileInteractionService } from '~/services/profile/profileInteractionService';

type Actions = 'follow' | 'unfollow' | 'mute' | 'unmute' | 'block' | 'unblock';

function isNoOpError(action: Actions, err: FetchError<FetchError<ApiErrorResponse>>) {
  const code = err?.data?.data?.error?.code;
  switch (action) {
    case 'follow':
      return code === 'ALREADY_FOLLOWING';
    case 'unfollow':
      return code === 'ALREADY_NOT_FOLLOWING';
    case 'mute':
      return code === 'ALREADY_MUTED';
    case 'unmute':
      return code === 'NOT_MUTED';
    case 'block':
      return code === 'ALREADY_BLOCKED';
    case 'unblock':
      return code === 'NOT_BLOCKED';
    default:
      return false;
  }
}

export function useProfileMutation<ActionType extends Actions, Q = void>({
  mutationFn,
  username,
  optimisticUpdateFn,
}: {
  mutationFn: ({ username, action }: { username: string; action: ActionType }) => Promise<Q>;
  username: string;
  optimisticUpdateFn: (data: CompactUser | User, action: ActionType) => void;
}) {
  const { t } = useI18n();
  const lowercaseUsername = username.toLowerCase();
  return useMutation<
    Q,
    FetchError<FetchError<ApiErrorResponse>>,
    { username: string; action: ActionType },
    {
      previousFollowers?: {
        pages: ApiSuccessResponse<CompactUser[]>[];
      };
      previousFollowing?: {
        pages: ApiSuccessResponse<CompactUser[]>[];
      };
      previousFollowSuggestions?: {
        pages: ApiSuccessResponse<CompactUser[]>[];
      };
      previousUser?: User;
    }
  >({
    mutationFn,
    onMutate: async (
      { username, action }: { username: string; action: ActionType },
      { client },
    ) => {
      const usernameToMutate = username.toLowerCase();
      const profileQueryKey = ['profile', usernameToMutate];
      const followersQueryKey = ['user-list', 'followers', lowercaseUsername];
      const followingQueryKey = ['user-list', 'following', lowercaseUsername];
      const followSuggestionsQueryKey = ['user-list', 'follow-suggestions'];
      await Promise.all([
        client.cancelQueries({ queryKey: profileQueryKey }),
        client.cancelQueries({ queryKey: followersQueryKey }),
        client.cancelQueries({ queryKey: followingQueryKey }),
        client.cancelQueries({ queryKey: followSuggestionsQueryKey }),
      ]);

      // Get previous data
      const previousUser = client.getQueryData<User>(profileQueryKey);

      const previousFollowers = client.getQueryData<{
        pages: ApiSuccessResponse<CompactUser[]>[];
      }>(followersQueryKey);

      const previousFollowing = client.getQueryData<{
        pages: ApiSuccessResponse<CompactUser[]>[];
      }>(followingQueryKey);

      const previousFollowSuggestions = client.getQueryData<{
        pages: ApiSuccessResponse<CompactUser[]>[];
      }>(followSuggestionsQueryKey);

      if (previousUser) {
        const updatedUser = { ...previousUser };
        optimisticUpdateFn(updatedUser, action);
        client.setQueryData(profileQueryKey, updatedUser);
      }

      if (previousFollowers && previousFollowers.pages) {
        const updatedFollowersPages = previousFollowers.pages.map((page) => {
          const updatedData = page.data.map((user) => {
            if (user.username.toLowerCase() === usernameToMutate) {
              const updatedUser = { ...user };
              optimisticUpdateFn(updatedUser, action);
              return updatedUser;
            }
            return user;
          });
          return { ...page, data: updatedData };
        });

        client.setQueryData(followersQueryKey, {
          ...previousFollowers,
          pages: updatedFollowersPages,
        });
      }

      if (previousFollowing && previousFollowing.pages) {
        const updatedFollowingPages = previousFollowing.pages.map((page) => {
          const updatedData = page.data.map((user) => {
            if (user.username.toLowerCase() === usernameToMutate) {
              const updatedUser = { ...user };
              optimisticUpdateFn(updatedUser, action);
              return updatedUser;
            }
            return user;
          });
          return { ...page, data: updatedData };
        });

        client.setQueryData(followingQueryKey, {
          ...previousFollowing,
          pages: updatedFollowingPages,
        });
      }

      // Optimistic update for follow suggestions (if applicable)
      if (previousFollowSuggestions && previousFollowSuggestions.pages) {
        const updatedFollowSuggestionsPages = previousFollowSuggestions.pages.map((page) => {
          const updatedData = page.data.map((user) => {
            if (user.username.toLowerCase() === usernameToMutate) {
              const updatedUser = { ...user };
              optimisticUpdateFn(updatedUser, action);
              return updatedUser;
            }
            return user;
          });
          return { ...page, data: updatedData };
        });

        client.setQueryData(followSuggestionsQueryKey, {
          ...previousFollowSuggestions,
          pages: updatedFollowSuggestionsPages,
        });
      }

      return {
        previousFollowers,
        previousFollowing,
        previousFollowSuggestions,
        previousUser,
      };
    },

    // Rollback on error
    onError: (err, { username, action }, mutationResult, ctx) => {
      const usernameToMutate = username.toLowerCase();
      if (isNoOpError(action, err)) {
        return;
      }
      if (mutationResult?.previousUser) {
        ctx.client.setQueryData(['profile', usernameToMutate], mutationResult.previousUser);
      }
      if (mutationResult?.previousFollowers) {
        ctx.client.setQueryData(['followers', lowercaseUsername], mutationResult.previousFollowers);
      }
      if (mutationResult?.previousFollowing) {
        ctx.client.setQueryData(['following', lowercaseUsername], mutationResult.previousFollowing);
      }
      if (mutationResult?.previousFollowSuggestions) {
        ctx.client.setQueryData(['follow-suggestions'], mutationResult.previousFollowSuggestions);
      }

      showToaster('error', t(`errors.${err?.data?.data?.error.code || 'UNKNOWN_ERROR'}`));
    },

    // Invalidate queries on finishing request
    // To sync up with the backend
    onSettled: (_data, _err, { username }, mutationResult, { client }) => {
      const loweredUsername = username.toLowerCase();
      client.invalidateQueries({
        queryKey: ['profile', loweredUsername],
      });
    },
  });
}

export function useFollowMutation(username: string) {
  return useProfileMutation<'follow' | 'unfollow'>({
    mutationFn: async ({ username: usernameToMutate, action }) => {
      if (action === 'follow') {
        await profileInteractionService.followUser(usernameToMutate.toLowerCase());
      } else {
        await profileInteractionService.unfollowUser(usernameToMutate.toLowerCase());
      }
    },
    username: username.toLowerCase(),
    optimisticUpdateFn: (user, action) => {
      const relationship = { ...user.relationship };
      if (action === 'follow') {
        relationship.following = true;
        if ('followersCount' in user) {
          user.followersCount += 1;
        }
      } else {
        relationship.following = false;
        if ('followersCount' in user) {
          user.followersCount -= 1;
        }
      }
      user.relationship = relationship;
    },
  });
}

export function useMuteMutation(username: string) {
  return useProfileMutation<'mute' | 'unmute'>({
    mutationFn: async ({ action, username: usernameToMutate }) => {
      if (action === 'mute') {
        await profileInteractionService.muteUser(usernameToMutate.toLowerCase());
      } else {
        await profileInteractionService.unmuteUser(usernameToMutate.toLowerCase());
      }
    },
    username: username.toLowerCase(),
    optimisticUpdateFn: (user, action) => {
      const relationship = { ...user.relationship };
      if (action === 'mute') {
        relationship.muted = true;
      } else {
        relationship.muted = false;
      }
      user.relationship = relationship;
    },
  });
}

export function useBlockMutation(username: string) {
  return useProfileMutation<'block' | 'unblock'>({
    mutationFn: async ({ action, username: usernameToMutate }) => {
      if (action === 'block') {
        await profileInteractionService.blockUser(usernameToMutate.toLowerCase());
      } else {
        await profileInteractionService.unblockUser(usernameToMutate.toLowerCase());
      }
    },
    username: username.toLowerCase(),
    optimisticUpdateFn: (user, action) => {
      const relationship = { ...user.relationship };
      if (action === 'block') {
        relationship.blocking = true;
      } else {
        relationship.blocking = false;
      }
      user.relationship = relationship;
    },
  });
}
