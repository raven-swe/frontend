import { useQuery } from '@tanstack/vue-query';
import { meService } from '~/services/me/meService';

export default function useMyProfileQuery() {
  const userStore = useUserStore();

  const query = useQuery({
    queryKey: ['layout-data'],
    queryFn: async () => {
      const response = await meService.fetchProfile();

      if (response.success) userStore.setUser(response.data);

      return response;
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 10,
  });

  onServerPrefetch(async () => {
    await query.suspense();
  });
  return query;
}
