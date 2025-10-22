import { apiFetch } from '~/api';
import { isAuthenticated, parseSetCookie } from '~/services/auth/authService';

// Public routes that don’t require auth
const publicRoutes = ['/', '/forget-password', '/playground/dummy-login'];

export default defineNuxtRouteMiddleware(async (to) => {
  let isAuth = isAuthenticated();

  // If already authenticated, redirect to /home
  if (to.path === '/' && isAuth) {
    return navigateTo('/home');
  }
  // Allow if it's a public route
  if (publicRoutes.includes(to.path)) return;

  if (!isAuth) {
    // try to authenticate using refresh token
    try {
      if (import.meta.server) {
        const response = await $fetch.raw('/api/auth/refresh-token', {
          method: 'POST',
          credentials: 'include',
        });
        const setCookies = response.headers.getSetCookie?.();
        for (const rawCookie of setCookies) {
          const { name, value, options } = parseSetCookie(rawCookie);
          if (name === 'access_token' || name === 'refresh_token') {
            const cookie = useCookie(name, options);
            cookie.value = value;
          }
        }
      } else if (import.meta.client) {
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
