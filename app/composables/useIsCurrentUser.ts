import { computed } from 'vue';
import { useRoute } from '#imports';
import { useUserStore } from '@/stores/user';

export function useIsCurrentUser() {
  const route = useRoute();
  const userStore = useUserStore();

  const username = computed(() => route.params.username?.toString().toLowerCase());

  const isCurrentUser = computed(() => {
    return userStore.user?.username.toLowerCase() === username.value;
  });

  return { isCurrentUser };
}
