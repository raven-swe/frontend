import { apiFetch } from '~/api';
import { loginService, type LoginSchema } from '~/services/auth/loginService';
import { registerationService } from '~/services/auth/registerationService';
import { jwtDecode } from 'jwt-decode';

const REFRESH_BUFFER_MS = 60000; // Refresh 1 minute before expiry

export const useAuth = () => {
  const accessToken = useState<string | null>('accessToken', () => null);
  const isRefreshing = useState<boolean>('isRefreshing', () => false);
  const refreshTimer = useState<NodeJS.Timeout | null>('refreshTimer', () => null);

  // Decode token and get expiry time
  const getTokenExpiry = (token: string): number | null => {
    try {
      const decoded = jwtDecode(token);
      return decoded.exp ? decoded.exp * 1000 : null; // Convert to milliseconds
    } catch {
      return null;
    }
  };

  const scheduleTokenRefresh = (token: string) => {
    // Clear existing timer
    if (refreshTimer.value) {
      clearTimeout(refreshTimer.value);
      refreshTimer.value = null;
    }

    const expiryTime = getTokenExpiry(token);
    if (!expiryTime) {
      return;
    }

    const now = Date.now();
    const timeUntilExpiry = expiryTime - now;

    // Check if token is already expired or about to expire
    if (timeUntilExpiry <= 0) {
      refreshTokens();
      return;
    }

    // Refresh before expiry with buffer time
    const refreshTime = Math.max(0, timeUntilExpiry - REFRESH_BUFFER_MS);

    refreshTimer.value = setTimeout(async () => {
      await refreshTokens();
    }, refreshTime);
  };

  const login = async (loginData: LoginSchema) => {
    const response = await loginService.login(loginData);
    if (response) accessToken.value = response?.data.accessToken;
  };

  const signup = async (password: string, creationToken: string | null) => {
    const response = await registerationService.complete(password, creationToken);
    if (response) accessToken.value = response?.data.accessToken;
  };

  const logout = async () => {
    await loginService.logout();
    useUserStore().logout();
    navigateTo('/');
    accessToken.value = null;
  };

  const refreshTokens = async () => {
    if (isRefreshing.value) {
      return;
    }
    try {
      isRefreshing.value = true;
      const response = await apiFetch('/api/auth/refresh-token', {
        method: 'POST',
        credentials: 'include',
      });
      if (response) accessToken.value = response?.data.accessToken;
    } catch {
      clearAccessToken();
      navigateTo('/');
    } finally {
      isRefreshing.value = false;
    }
  };

  const getAccessToken = () => {
    return accessToken.value;
  };

  const clearAccessToken = () => {
    accessToken.value = null;
  };

  const setAccessToken = (token: string) => {
    accessToken.value = token;
  };

  if (import.meta.client) {
    watch(
      accessToken,
      (newToken, oldToken) => {
        // Clear timer when token is removed
        if (!newToken && refreshTimer.value) {
          clearTimeout(refreshTimer.value);
          refreshTimer.value = null;
          return;
        }

        // Schedule refresh when token is added or changed
        if (newToken && newToken !== oldToken) {
          scheduleTokenRefresh(newToken);
        }
      },
      { immediate: true },
    );

    // Cleanup on unmount
    onUnmounted(() => {
      if (refreshTimer.value) {
        clearTimeout(refreshTimer.value);
        refreshTimer.value = null;
      }
    });
  }

  return {
    accessToken,
    login,
    logout,
    refreshTokens,
    clearAccessToken,
    getAccessToken,
    setAccessToken,
    isRefreshing,
    signup,
    isAuthenticated: readonly(computed(() => !!accessToken.value)),
  };
};
