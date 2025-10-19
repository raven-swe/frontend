<script lang="ts" setup>
import ProfileDetails from '~/components/profile/ProfileDetails.vue';
import Tabs from '@/components/ui/Tabs.vue';
import Tab from '@/components/ui/Tab.vue';
</script>

<template>
  <NuxtLayout name="default">
    <!-- Profile header and tabs (sticky across all profile pages) -->
    <ProfileDetails />
    <Tabs>
      <Tab
        :label="$t('profile.tabs.posts')"
        route="/profile"
        :is-active="$route.path === '/profile'"
      />
      <Tab
        :label="$t('profile.tabs.replies')"
        route="/profile/replies"
        :is-active="$route.path === '/profile/replies'"
      />
      <Tab
        :label="$t('profile.tabs.media')"
        route="/profile/media"
        :is-active="$route.path === '/profile/media'"
      />
      <Tab
        :label="$t('profile.tabs.likes')"
        route="/profile/likes"
        :is-active="$route.path === '/profile/likes'"
      />
    </Tabs>

    <!-- Dynamic content from child tab pages -->
    <slot />
  </NuxtLayout>
</template>
