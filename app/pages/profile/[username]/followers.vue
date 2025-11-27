<script lang="ts" setup>
import UserList from '~/components/common/UserList.vue';
import { profileTabsService } from '~/services/profile/profileTabsService';

definePageMeta({
  layout: 'follower-following',
});
const router = useRouter();
const username = computed(() => {
  const val = router.currentRoute.value.params.username;
  return typeof val === 'string' ? val.toLowerCase() : null;
});
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
    :current-username="username"
    query-key-suffix="followers"
    :empty-title="$t('profile.followers.messages.empty.title')"
    :empty-description="$t('profile.followers.messages.empty.description')"
  />
</template>
