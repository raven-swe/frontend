import { clearAccessToken, getAccessToken } from '~/services/auth/authService';
import type { NitroFetchRequest, $Fetch } from 'nitropack';

export const apiFetch: $Fetch<unknown, NitroFetchRequest> = $fetch.create({
  retry: 3,
  retryStatusCodes: [401],
  onRequest({ options }) {
    const token = getAccessToken();
    if (token) {
      options.headers.set('Authorization', `Bearer ${token}`);
    }
  },
  async onResponseError({ request, response, options }) {
    if (request.toString().includes('/api/auth/refresh-token')) {
      return;
    }

    if (response.status === 401) {
      try {
        await apiFetch('/api/auth/refresh-token', {
          method: 'POST',
          credentials: 'include',
        });
      } catch {
        options.retry = 0; // prevent further retries
        clearAccessToken();
        navigateTo('/');
        console.error('[fetch] Token refresh failed, redirecting to login');
      }
    }
  },
});
