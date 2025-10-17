<script lang="ts" setup>
import ProfileDetails from '~/components/profile/ProfileDetails.vue';
import Tabs from '@/components/ui/Tabs.vue';
import Tab from '@/components/ui/Tab.vue';
</script>

<template>
  <div>
    <ProfileDetails />
    <Tabs>
      <Tab
        :label="$t('profile.tabs.posts')"
        route="/home"
        :is-active="$route.path === '/profile'"
      />
      <Tab
        :label="$t('profile.tabs.replies')"
        route="/home"
        :is-active="$route.path !== '/profile'"
      />
      <Tab
        :label="$t('profile.tabs.media')"
        route="/home"
        :is-active="$route.path !== '/profile'"
      />
      <Tab
        :label="$t('profile.tabs.likes')"
        route="/home"
        :is-active="$route.path !== '/profile'"
      />
    </Tabs>
  </div>
</template>
