import { useMutation, type InfiniteData, type QueryKey } from '@tanstack/vue-query';
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
  optimisticUpdateFn,
}: {
  mutationFn: ({ username, action }: { username: string; action: ActionType }) => Promise<Q>;
  optimisticUpdateFn: (data: CompactUser | User, action: ActionType) => CompactUser | User;
}) {
  const { t } = useI18n();
  return useMutation<
    Q,
    FetchError<FetchError<ApiErrorResponse>>,
    { username: string; action: ActionType },
    {
      previousLists?: [QueryKey, InfiniteData<ApiSuccessResponse<CompactUser[]>> | undefined][];
      previousUser?: User;
    }
  >({
    mutationKey: ['profile-interaction'],
    mutationFn,
    onMutate: async (
      { username: usenameMutate, action }: { username: string; action: ActionType },
      { client },
    ) => {
      const usernameToMutate = usenameMutate.toLowerCase();
      const profileQueryKey = ['profile', usernameToMutate];
      // Get previous data
      const previousUser = client.getQueryData<User>(profileQueryKey);
      if (previousUser) {
        client.setQueryData<User>(profileQueryKey, (old) => {
          if (!old) return old;
          const prevUser = toRaw(old);
          return optimisticUpdateFn(prevUser, action) as User;
        });
      }

      const previousLists = client.getQueriesData<InfiniteData<ApiSuccessResponse<CompactUser[]>>>({
        predicate: (query) => query.queryKey[0] === 'user-list',
      });

      // Optimistically update all user-lists
      client.setQueriesData<InfiniteData<ApiSuccessResponse<CompactUser[]>>>(
        {
          predicate: (query) => query.queryKey[0] === 'user-list',
        },
        (oldData) => {
          if (!oldData) return oldData;
          const updatedPages = oldData.pages.map((page) => {
            const updatedData = page.data.map((user) => {
              if (user.username.toLowerCase() === usernameToMutate) {
                const prevUser = toRaw(user);
                return optimisticUpdateFn(prevUser, action);
              }
              return user;
            });
            return { ...page, data: updatedData };
          });
          return { ...oldData, pages: updatedPages };
        },
      );

      return {
        previousLists,
        previousUser,
      };
    },

    // Rollback on error
    onError: (err, { username, action }, mutationResult, { client }) => {
      const usernameToMutate = username.toLowerCase();
      if (isNoOpError(action, err)) {
        return;
      }

      if (mutationResult?.previousUser) {
        const profileQueryKey = ['profile', usernameToMutate];
        client.setQueryData(profileQueryKey, mutationResult.previousUser);
      }
      // Rollback all previous user-lists
      if (mutationResult?.previousLists) {
        mutationResult.previousLists.forEach(([queryKey, previousData]) => {
          client.setQueryData(queryKey, previousData);
        });
      }

      const errorCode = err?.data?.data?.error?.code;
      console.error('Profile mutation error:', err);

      showToaster(
        'error',
        t(`errors.${errorCode}`, err.data?.data?.error.message || t('errors.UNKNOWN_ERROR')),
      );
    },

    // Invalidate queries on finishing request
    // To sync up with the backend
    onSettled: (_data, _err, { username, action }, mutationResult, { client }) => {
      const loweredUsername = username.toLowerCase();

      // Always invalidate dm-conversations cache when blocking/unblocking a user
      if (action === 'block' || action === 'unblock') {
        client.invalidateQueries({
          queryKey: ['dm-conversations'],
        });
      }

      const stillRunning = client.isMutating({
        mutationKey: ['profile-interaction'],
      });

      if (stillRunning > 0) {
        // Another follow/unfollow/mute/block is still running; let the last one do the invalidation
        return;
      }
      client.invalidateQueries({
        queryKey: ['profile', loweredUsername],
      });
    },
  });
}

export function useFollowMutation() {
  return useProfileMutation<'follow' | 'unfollow'>({
    mutationFn: async ({ username: usernameToMutate, action }) => {
      if (action === 'follow') {
        await profileInteractionService.followUser(usernameToMutate.toLowerCase());
      } else {
        await profileInteractionService.unfollowUser(usernameToMutate.toLowerCase());
      }
    },
    optimisticUpdateFn: (user, action) => {
      const newUser = structuredClone(user);
      if (action === 'follow') {
        newUser.relationship.following = true;
        if ('followersCount' in newUser) {
          newUser.followersCount += 1;
        }
      } else {
        newUser.relationship.following = false;
        if ('followersCount' in newUser) {
          newUser.followersCount -= 1;
        }
      }
      return newUser;
    },
  });
}

export function useMuteMutation() {
  return useProfileMutation<'mute' | 'unmute'>({
    mutationFn: async ({ action, username: usernameToMutate }) => {
      if (action === 'mute') {
        await profileInteractionService.muteUser(usernameToMutate.toLowerCase());
      } else {
        await profileInteractionService.unmuteUser(usernameToMutate.toLowerCase());
      }
    },
    optimisticUpdateFn: (user, action) => {
      const newUser = structuredClone(user);
      if (action === 'mute') {
        newUser.relationship.muted = true;
      } else {
        newUser.relationship.muted = false;
      }
      return newUser;
    },
  });
}

export function useBlockMutation() {
  return useProfileMutation<'block' | 'unblock'>({
    mutationFn: async ({ action, username: usernameToMutate }) => {
      if (action === 'block') {
        await profileInteractionService.blockUser(usernameToMutate.toLowerCase());
      } else {
        await profileInteractionService.unblockUser(usernameToMutate.toLowerCase());
      }
    },
    optimisticUpdateFn: (user, action) => {
      const newUser = structuredClone(user);
      if (action === 'block') {
        newUser.relationship.blocking = true;
        newUser.relationship.following = false;
      } else {
        newUser.relationship.following = false;
        newUser.relationship.blocking = false;
      }
      return newUser;
    },
  });
}
