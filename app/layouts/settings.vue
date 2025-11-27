<script lang="ts" setup>
import { useQuery } from '@tanstack/vue-query';
import { meService } from '~/services/me/meService';

const props = defineProps<{
  hideMiddleOnMobile?: boolean;
  hideRightOnMobile?: boolean;
}>();

const userStore = useUserStore();

// define query key — unique and stable
const queryKey = ['layout-data'];

// Define the query
const { data, error, isError } = useQuery({
  queryKey,
  queryFn: async () => await meService.fetchProfile(),
  // Disable re-fetch after hydration if you want to keep SSR data
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  staleTime: 1000 * 60 * 5, // optional: cache for 5min
});

// Reactively sync userStore when data changes
watch(
  () => data.value,
  (newVal) => {
    if (!newVal) return;

    if (newVal.success) {
      userStore.setUser(newVal.data);
      userStore.error = null;
    } else if (isError.value && error.value) {
      userStore.error = error.value.message;
    }
  },
  { immediate: true, deep: true },
);

// Compute responsive classes based on props
const middleClasses = computed(() => {
  if (props.hideMiddleOnMobile) {
    return 'hidden h-full w-[320px] flex-shrink-0 border lg:block xl:w-[390px] 2xl:w-[450px]';
  }
  return 'h-full lg:w-[320px] flex-1 border sm:w-[560px] sm:flex-none xl:w-[390px] 2xl:w-[450px]';
});

const rightClasses = computed(() => {
  if (props.hideRightOnMobile) {
    return 'hidden h-full flex-1 border sm:w-[560px] sm:flex-none md:w-[600px] lg:block';
  }
  return 'h-full flex-1 border sm:w-[560px] sm:flex-none md:w-[600px]';
});
</script>

<template>
  <div>
    <div class="bg-background">
      <div class="flex h-screen justify-center overflow-hidden">
        <div class="flex w-full max-w-7xl sm:justify-center">
          <!-- Left sidebar -->
          <div class="w-16 flex-shrink-0 sm:w-16 md:w-24 xl:w-[266px] 2xl:w-[206px]">
            <div class="sticky top-0">
              <SideBarLeft />
            </div>
          </div>

          <!-- settings Section -->
          <div :class="middleClasses">
            <slot name="middle" />
          </div>

          <!-- Right sidebar -->
          <div :class="rightClasses">
            <slot name="right" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
