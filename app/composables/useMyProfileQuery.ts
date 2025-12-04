import { useQuery } from '@tanstack/vue-query';
import { meService } from '~/services/me/meService';

export default function useMyProfileQuery() {
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

  // Define the query
  const { data, error, isError, suspense, isLoading } = useQuery({
    queryKey: ['layout-data'],
    queryFn: async () => await meService.fetchProfile(),
    // Disable re-fetch after hydration
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

  return {
    data,
    error,
    isError,
    isLoading,
  };
}
