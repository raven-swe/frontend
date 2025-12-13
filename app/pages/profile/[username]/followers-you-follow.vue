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
        profileTabsService.getMutualFollowersPaginated({
          username: username ?? '',
          cursor,
          signal,
        })
    "
    show-dropdown
    :current-username="username"
    query-key-suffix="mutual-followers"
    :empty-title="
      $t('profile.followers-you-follow.messages.empty.title', {
        username: username,
      })
    "
    :empty-description="$t('profile.followers-you-follow.messages.empty.description')"
  />
</template>
