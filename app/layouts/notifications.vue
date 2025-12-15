<script setup lang="ts">
const tabs = [
  {
    label: $t('notifications.tabs.all'),
    route: '/notifications',
    datacy: 'notifications-all-tab',
  },
  {
    label: $t('notifications.tabs.mentions'),
    route: '/notifications/mentions',
    datacy: 'notifications-mentions-tab',
  },
];
</script>

<template>
  <NuxtLayout name="default">
    <div class="bg-background/65 sticky top-0 z-10 p-2 pb-0 backdrop-blur-md">
      <h2 class="text-foreground m-2 ms-3 text-xl font-bold">{{ $t('notifications.title') }}</h2>
      <UiTabs>
        <UiTab
          v-for="tab in tabs"
          :key="tab.route"
          :label="tab.label"
          :route="tab.route"
          :is-active="$route.path.toLowerCase() === tab.route"
          :data-cy="tab.datacy"
        />
      </UiTabs>
    </div>
    <slot />
  </NuxtLayout>
</template>
