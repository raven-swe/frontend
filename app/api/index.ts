import { ofetch } from 'ofetch';
import { clearAccessToken, getAccessToken, setAccessToken } from '~/services/auth/authService';

export const apiFetch = ofetch.create({
  retry: 3,
  retryStatusCodes: [401],
  onRequest({ options }) {
    if (typeof window !== 'undefined') {
      const token = getAccessToken();
      if (token) {
        options.headers.set('Authorization', `Bearer ${token}`);
      }
    }
  },
  async onResponseError({ response, options }) {
    // we aleady set retry for 401 status codes
    // so this will run then on the second try the fetch succeeds or fails again
    if (response.status === 401) {
      try {
        const response = await apiFetch('/api/auth/refresh-token', {
          method: 'POST',
          credentials: 'include',
        });
        const newAccessToken = response.data.accessToken;
        setAccessToken(newAccessToken);
      } catch {
        options.retry = 0; // prevent further retries
        clearAccessToken();
        navigateTo('/');
        console.error('[fetch] Token refresh failed, redirecting to login');
      }
    }
  },
});
