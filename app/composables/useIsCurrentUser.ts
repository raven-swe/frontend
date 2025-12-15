import { computed } from 'vue';
import { useUserStore } from '@/stores/user';

export function useIsCurrentUser() {
  const router = useRouter();
  const userStore = useUserStore();

  const username = computed(() =>
    router.currentRoute.value.params.username?.toString().toLowerCase(),
  );

  const isCurrentUser = computed(() => {
    return userStore.user?.username.toLowerCase() === username.value;
  });

  return { isCurrentUser };
}
