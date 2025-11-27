import { useMutation, useQueryClient } from '@tanstack/vue-query';
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
  const queryClient = useQueryClient();
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
    onMutate: async ({ username, action }: { username: string; action: ActionType }) => {
      const usernameToMutate = username.toLowerCase();
      const profileQueryKey = ['profile', usernameToMutate];
      const followersQueryKey = ['followers', lowercaseUsername];
      const followingQueryKey = ['following', lowercaseUsername];
      const followSuggestionsQueryKey = ['follow-suggestions'];
      await Promise.all([
        queryClient.cancelQueries({ queryKey: profileQueryKey }),
        queryClient.cancelQueries({ queryKey: followersQueryKey }),
        queryClient.cancelQueries({ queryKey: followingQueryKey }),
        queryClient.cancelQueries({ queryKey: followSuggestionsQueryKey }),
      ]);

      // Get previous data
      const previousUser = queryClient.getQueryData<User>(profileQueryKey);

      const previousFollowers = queryClient.getQueryData<{
        pages: ApiSuccessResponse<CompactUser[]>[];
      }>(followersQueryKey);

      const previousFollowing = queryClient.getQueryData<{
        pages: ApiSuccessResponse<CompactUser[]>[];
      }>(followingQueryKey);

      const previousFollowSuggestions = queryClient.getQueryData<{
        pages: ApiSuccessResponse<CompactUser[]>[];
      }>(followSuggestionsQueryKey);

      if (previousUser) {
        const updatedUser = { ...previousUser };
        optimisticUpdateFn(updatedUser, action);
        queryClient.setQueryData(profileQueryKey, updatedUser);
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

        queryClient.setQueryData(followersQueryKey, {
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

        queryClient.setQueryData(followingQueryKey, {
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

        queryClient.setQueryData(followSuggestionsQueryKey, {
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
    onError: (err, { username, action }, ctx) => {
      const usernameToMutate = username.toLowerCase();
      if (isNoOpError(action, err)) {
        return;
      }
      if (ctx?.previousUser) {
        queryClient.setQueryData(['profile', usernameToMutate], ctx.previousUser);
      }
      if (ctx?.previousFollowers) {
        queryClient.setQueryData(['followers', lowercaseUsername], ctx.previousFollowers);
      }
      if (ctx?.previousFollowing) {
        queryClient.setQueryData(['following', lowercaseUsername], ctx.previousFollowing);
      }
      if (ctx?.previousFollowSuggestions) {
        queryClient.setQueryData(['follow-suggestions'], ctx.previousFollowSuggestions);
      }

      showToaster('error', t(`errors.${err?.data?.data?.error.code || 'UNKNOWN_ERROR'}`));
    },

    // Invalidate queries on finishing request
    // To sync up with the backend
    onSettled: (_data, _err, { username }) => {
      const loweredUsername = username.toLowerCase();
      queryClient.invalidateQueries({
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
