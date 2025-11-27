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
  optimisticUpdateFn: (data: CompactUser | User, action: ActionType) => CompactUser | User;
}) {
  const { t } = useI18n();
  const lowercaseUsername = username.toLowerCase();
  return useMutation<
    Q,
    FetchError<FetchError<ApiErrorResponse>>,
    { username: string; action: ActionType },
    {
      previousLists?: [
        readonly unknown[],
        (
          | {
              pages: ApiSuccessResponse<CompactUser[]>[];
            }
          | undefined
        ),
      ][];
      previousUser?: User;
    }
  >({
    mutationFn,
    onMutate: async (
      { username: usenameMutate, action }: { username: string; action: ActionType },
      { client },
    ) => {
      const usernameToMutate = usenameMutate.toLowerCase();
      const profileQueryKey = ['profile', usernameToMutate];
      await client.cancelQueries({ predicate: (query) => query.queryKey[0] === 'user-list' });
      // Get previous data
      const previousUser = client.getQueryData<User>(profileQueryKey);
      if (previousUser) {
        client.setQueryData<User>(profileQueryKey, (old) => {
          if (!old) return old;
          const prevUser = toRaw(old);
          return optimisticUpdateFn(prevUser, action) as User;
        });
      }

      const previousLists = client.getQueriesData<{
        pages: ApiSuccessResponse<CompactUser[]>[];
      }>({
        predicate: (query) =>
          query.queryKey[0] === 'user-list' && query.queryKey[1] === lowercaseUsername,
      });

      // Optimistically update all user-lists
      client.setQueriesData<{
        pages: ApiSuccessResponse<CompactUser[]>[];
      }>(
        {
          predicate: (query) =>
            query.queryKey[0] === 'user-list' && query.queryKey[1] === lowercaseUsername,
        },
        (oldData) => {
          if (!oldData) return oldData;
          const updatedPages = oldData.pages.map((page) => {
            const updatedData = page.data.map((user) => {
              if (user.username.toLowerCase() === usernameToMutate) {
                return optimisticUpdateFn(user, action);
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

      showToaster(
        'error',
        t(`errors.${errorCode}`, err.data?.data?.error.message || t('errors.UNKNOWN_ERROR')),
      );
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
