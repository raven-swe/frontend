<script lang="ts" setup>
import UserList from '~/components/user/UserList.vue';
import { profileTabsService } from '~/services/profile/profileTabsService';

definePageMeta({
  layout: 'follower-following',
});
const router = useRouter();
const username = computed(
  () => router.currentRoute.value.params.username?.toString().toLowerCase() ?? null,
);
</script>

<template>
  <UserList
    :fetcher-fn="
      (cursor, signal) =>
        profileTabsService.getFollowingPaginated({
          username: username ?? '',
          cursor,
          signal,
        })
    "
    :current-username="username"
    query-key-suffix="following"
    :empty-title="$t('profile.following.messages.empty.title')"
    :empty-description="$t('profile.following.messages.empty.description')"
  />
</template>
