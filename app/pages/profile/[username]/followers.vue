<script lang="ts" setup>
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { apiFetch } from '~/api';
import UserRow from '~/components/ui/UserRow.vue';
import type { CompactUser } from '~~/shared/types/user';
import type { FetchError } from 'ofetch';
import { profileInteractionService } from '~/services/profile/profileInteractionService';

definePageMeta({
  layout: 'follower-following',
});
const router = useRouter();
const username = computed(() => {
  const val = router.currentRoute.value.params.username;
  return typeof val === 'string' ? val.toLowerCase() : null;
});

const queryKey = computed(() => ['followers', username.value]);
const { data: users } = useQuery({
  queryKey,
  queryFn: async () => {
    const response = await apiFetch(`/api/users/${username.value}/followers`);
    return response.data;
  },
});
const queryClient = useQueryClient();
const { mutate: followUser } = useMutation<
  ApiResponseBase,
  FetchError<FetchError<ApiErrorResponse>>,
  { username: string; action: 'follow' | 'unfollow' },
  { previousFollowers?: CompactUser[]; previousProfile?: User }
>({
  mutationFn: async ({
    username: usernameToFollow,
    action,
  }: {
    username: string;
    action: 'follow' | 'unfollow';
  }) => {
    if (action === 'follow') {
      return await profileInteractionService.followUser(usernameToFollow);
    } else {
      return await profileInteractionService.unfollowUser(usernameToFollow);
    }
  },
  onMutate: async ({ username: usernameToFollow, action }) => {
    if (!username.value)
      return {
        previousFollowers: undefined,
        previousProfile: undefined,
      };

    // Cancel and snapshot both queries
    const listQueryKey = ['followers', username.value];
    const profileQueryKey = ['profile', usernameToFollow.toLowerCase()];

    await queryClient.cancelQueries({ queryKey: listQueryKey });
    await queryClient.cancelQueries({ queryKey: profileQueryKey });

    const previousFollowers = queryClient.getQueryData<CompactUser[]>(listQueryKey);
    const previousProfile = queryClient.getQueryData<User>(profileQueryKey);

    // Optimistically update the list
    if (previousFollowers) {
      queryClient.setQueryData<CompactUser[]>(
        listQueryKey,
        previousFollowers.map((user) =>
          user.username === usernameToFollow
            ? {
                ...user,
                relationship: {
                  ...user.relationship,
                  following: action === 'follow',
                },
              }
            : user,
        ),
      );
    }

    if (previousProfile) {
      queryClient.setQueryData<User>(profileQueryKey, {
        ...previousProfile,
        relationship: {
          ...previousProfile.relationship,
          following: action === 'follow',
        },
        followersCount:
          action === 'follow'
            ? previousProfile.followersCount + 1
            : previousProfile.followersCount - 1,
      });
    }

    return { previousFollowers, previousProfile };
  },

  onError: (err, { action, username: usernameToFollow }, context) => {
    let previousFollowers = context?.previousFollowers;
    const previousProfile = context?.previousProfile;
    if (isApiError(err)) {
      if (err.data?.data?.error.code === 'ALREADY_FOLLOWING' && action === 'follow') {
        if (previousFollowers) {
          previousFollowers = previousFollowers.map((user) =>
            user.username === usernameToFollow
              ? {
                  ...user,
                  relationship: {
                    ...user.relationship,
                    following: true,
                  },
                }
              : user,
          );
        }
        if (previousProfile) {
          previousProfile.relationship.following = true;
        }
      }
      if (err.data?.data?.error.code === 'ALREADY_NOT_FOLLOWING' && action === 'unfollow') {
        if (previousFollowers) {
          previousFollowers = previousFollowers.map((user) =>
            user.username === usernameToFollow
              ? {
                  ...user,
                  relationship: {
                    ...user.relationship,
                    following: false,
                  },
                }
              : user,
          );
        }
        if (previousProfile) {
          previousProfile.relationship.following = false;
        }
      }
      if (err.statusCode === 429) {
        showToaster('warning', 'You are doing that too much. Please try again later.');
      }
    }
    if (previousFollowers) {
      queryClient.setQueryData<CompactUser[]>(['followers', username.value], previousFollowers);
    }
    if (previousProfile) {
      queryClient.setQueryData<User>(['profile', usernameToFollow.toLowerCase()], previousProfile);
    }
  },

  onSettled: (_data, _error, variables) => {
    queryClient.invalidateQueries({ queryKey: ['profile', variables.username.toLowerCase()] });
    queryClient.invalidateQueries({ queryKey: ['followers', username.value] });
  },
});
</script>

<template>
  <div>
    <UserRow
      v-for="user in users"
      :key="user.username"
      :user="user"
      @follow="
        (username) => {
          followUser({ username, action: 'follow' });
        }
      "
      @unfollow="
        (username) => {
          followUser({ username, action: 'unfollow' });
        }
      "
    />
  </div>
</template>
