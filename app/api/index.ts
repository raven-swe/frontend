import type { NitroFetchRequest, $Fetch } from 'nitropack';
import { useAuth } from '~/composables/useAuth';
import { until } from '@vueuse/core';

export const apiFetch: $Fetch<unknown, NitroFetchRequest> = $fetch.create({
  retry: 3,
  retryStatusCodes: [401],
  onRequest({ options }) {
    const token = useAuth().accessToken.value;
    if (token) {
      options.headers.set('Authorization', `Bearer ${token}`);
    }
  },
  async onResponseError({ request, response }) {
    const auth = useAuth();
    if (response.status === 401) {
      if (request.toString().includes('/api/auth/refresh-token')) {
        return;
      }
      if (auth.isRefreshing.value) {
        await until(auth.isRefreshing).toBe(false);
      } else {
        await auth.refreshTokens();
      }
    }
  },
});
