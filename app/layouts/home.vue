<script lang="ts" setup>
import Tabs from '@/components/ui/Tabs.vue';
import Tab from '@/components/ui/Tab.vue';
import AccountSetup from '@/components/profile/account-setup/index.vue';

const { start, isOpen } = useAccountSetup();
onMounted(() => {
  if (sessionStorage.getItem('showAccountSetup') === 'true') {
    start();
    sessionStorage.removeItem('showAccountSetup');
  }
});
</script>

<template>
  <NuxtLayout name="default">
    <AccountSetup v-if="isOpen" />
    <Tabs
      class="bg-background/60 fixed top-0 z-50 inline-flex h-12 w-full max-w-[598px] cursor-pointer items-center gap-2 rounded-b-md py-1 text-sm font-medium backdrop-blur-sm"
    >
      <Tab
        :label="$t('home.tabs.for-you')"
        route="/home/for-you"
        :is-active="$route.path === '/home/for-you'"
      />
      <Tab
        :label="$t('home.tabs.following')"
        route="/home/following"
        :is-active="$route.path === '/home/following'"
      />
    </Tabs>
    <slot />
  </NuxtLayout>
</template>
