import { apiFetch } from '~/api';
import { isAuthenticated } from '~/services/auth/authService';
import { isPublicRoute } from '~/utils/public-routes';

export default defineNuxtRouteMiddleware(async (to) => {
  let isAuth = isAuthenticated();

  // If already authenticated, redirect to /home
  if (to.path === '/' && isAuth) {
    return navigateTo('/home');
  }
  // Allow if it's a public route
  const isPublic = isPublicRoute(to.path);
  if (isPublic) return;

  if (!isAuth) {
    // try to authenticate using refresh token
    try {
      if (import.meta.client) {
        await apiFetch('/api/auth/refresh-token', {
          method: 'POST',
          credentials: 'include',
        });
      }
      isAuth = isAuthenticated();
    } catch {
      return navigateTo('/');
    }
  }

  if (to.path === '/' && isAuth) {
    return navigateTo('/home');
  }

  // Protect all other routes
  if (!isAuth) {
    return navigateTo('/');
  }
});
