<script lang="ts" setup>
import Tabs from '@/components/ui/Tabs.vue';
import Tab from '@/components/ui/Tab.vue';
</script>

<template>
  <NuxtLayout name="default">
    <Tabs>
      <Tab :label="$t('home.tabs.for-you')" route="/home" :is-active="$route.path === '/home'" />
      <Tab
        :label="$t('home.tabs.following')"
        route="/home/following"
        :is-active="$route.path === '/home/following'"
      />
    </Tabs>
    <TweetComposer />

    <slot />
  </NuxtLayout>
</template>
