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
  <div>
    <div class="bg-background">
      <div class="flex h-screen justify-center overflow-hidden">
        <div class="flex w-full max-w-7xl sm:justify-center">
          <!-- Left sidebar -->
          <div class="w-16 flex-shrink-0 sm:w-16 md:w-24 xl:w-[306px]">
            <div class="sticky top-0">
              <SideBarLeft />
            </div>
          </div>

          <!-- settings Section -->
          <div
            class="h-full w-150 border-x lg:block lg:w-80 xl:w-96 2xl:w-112"
            :class="{ hidden: !isSettingsRoot }"
          >
            <SettingsSection />
          </div>

          <!-- Setting content -->
          <div class="h-full w-150 border-x lg:block" :class="{ hidden: isSettingsRoot }">
            <NuxtPage v-if="viewportIsLarge || !isSettingsRoot" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
