<script lang="ts" setup>
import { useQuery } from '@tanstack/vue-query';
import { meService } from '~/services/me/meService';
import { useDmSse } from '~/composables/useDmSse';

const userStore = useUserStore();

// Helper to sync query data to store
function syncUser(dataValue: ApiSuccessResponse<User> | undefined, err: unknown, isErr: boolean) {
  if (!dataValue) return;

  if (dataValue.success) {
    userStore.setUser(dataValue.data);
    userStore.error = null;
  } else if (isErr && err) {
    userStore.error = (err as Error).message;
  }
}

// define query key — unique and stable
const queryKey = ['layout-data'];

// Define the query
const { data, error, isError, suspense } = useQuery({
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
    syncUser(newVal, error.value, isError.value);
  },
  { immediate: true },
);

onServerPrefetch(async () => {
  await suspense();
  syncUser(data.value, error.value, isError.value);
});

const { connect: connectDmSse, unseenCount: unseenDmCount } = useDmSse();
onMounted(() => {
  connectDmSse();
});
</script>

<template>
  <div>
    <div class="bg-background">
      <div class="flex min-h-screen justify-center">
        <div class="flex w-full max-w-7xl sm:justify-center">
          <!-- Left sidebar -->
          <div class="w-16 flex-shrink-0 sm:w-16 md:w-24 xl:w-[306px]">
            <div class="sticky top-0">
              <SideBarLeft :dm-unseen-count="unseenDmCount" />
            </div>
          </div>

          <!-- Main content -->
          <main class="border-border flex-1 border-x sm:w-[560px] sm:flex-none md:w-[600px]">
            <slot />
          </main>

          <!-- Right sidebar -->
          <div class="hidden w-[320px] flex-shrink-0 lg:block xl:w-[350px]">
            <SideBarRight />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
