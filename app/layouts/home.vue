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
    <div class="h-29">
      <p class="py-10 text-center">{{ $t('add Post Space') }}</p>
    </div>
    <div class="h-12">
      <p class="text-center">{{ $t('add Show More Space') }}</p>
    </div>

    <!-- Dynamic content from child tab pages -->
    <slot />
  </NuxtLayout>
</template>
