<script lang="ts" setup>
import { useInfiniteQuery } from '@tanstack/vue-query';
import { apiFetch } from '~/api';
import UserRow from '~/components/ui/UserRow.vue';

definePageMeta({
  layout: 'follower-following',
});
const router = useRouter();
const username = computed(() => {
  const val = router.currentRoute.value.params.username;
  return typeof val === 'string' ? val.toLowerCase() : null;
});

const queryKey = computed(() => ['user-list', username.value, 'following']);
const { data: usersPaginated } = useInfiniteQuery({
  queryKey,
  initialPageParam: null as string | null,
  queryFn: async ({ signal, pageParam }) => {
    const response = await apiFetch(`/api/users/${username.value}/following`, {
      signal,
      query: {
        cursor: pageParam,
      },
    });
    return response;
  },
  getNextPageParam: (lastPage) =>
    lastPage.pagination?.hasNextPage ? lastPage.pagination.nextCursor : undefined,
  structuralSharing: false,
});

const users = computed(() => usersPaginated.value?.pages.flatMap((page) => page.data) || []);
const { mutate: followUser } = useFollowMutation(username.value || '');

const handleFollow = (targetUsername: string, action: 'follow' | 'unfollow') => {
  followUser({ username: targetUsername, action });
};
</script>

<template>
  <div>
    <UserRow
      v-for="user in users"
      :key="user.username"
      :user="user"
      @follow="
        (username) => {
          handleFollow(username, 'follow');
        }
      "
      @unfollow="
        (username) => {
          handleFollow(username, 'unfollow');
        }
      "
    />
  </div>
</template>
