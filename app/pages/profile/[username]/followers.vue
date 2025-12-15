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
        profileTabsService.getFollowersPaginated({
          username: username ?? '',
          cursor,
          signal,
        })
    "
    show-dropdown
    :current-username="username"
    query-key-suffix="followers"
    :empty-title="$t('profile.followers.messages.empty.title')"
    :empty-description="$t('profile.followers.messages.empty.description')"
  />
</template>
