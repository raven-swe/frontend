<script lang="ts" setup>
import useMyProfileQuery from '~/composables/useMyProfileQuery';
import SettingsSection from '~/components/Settings/SettingsSection/index.vue';
import { useBreakpoints } from '@vueuse/core';
useMyProfileQuery();

const breakpoints = useBreakpoints({ large: 1024 });
const viewportIsLarge = breakpoints.greaterOrEqual('large');
const router = useRouter();
const isSettingsRoot = computed(() => {
  const path = router.currentRoute.value.fullPath;
  return path.endsWith('settings/') || path.endsWith('settings');
});
</script>
<template>
  <div class="bg-background flex min-h-screen justify-center">
    <div class="bg-background flex min-h-screen w-full max-w-7xl justify-center">
      <!-- Left sidebar -->
      <div class="w-16.5 flex-shrink-0 duration-100 xl:w-70" data-cy="left-sidebar">
        <div class="sticky top-0">
          <SideBarLeft />
        </div>
      </div>

      <!-- Main content -->
      <div
        class="midd:!w-96 h-full w-150 border-x lg:block lg:w-80"
        :class="{ hidden: !isSettingsRoot }"
      >
        <SettingsSection />
      </div>

      <div class="h-full w-150 border-x lg:block" :class="{ hidden: isSettingsRoot }">
        <NuxtPage v-if="viewportIsLarge || !isSettingsRoot" />
      </div>
    </div>
  </div>
</template>

<style>
body {
  overflow-y: scroll;
}
</style>
