import { apiFetch } from '~/api';
import { isAuthenticated } from '~/services/auth/authService';
import * as cookieUtil from 'cookie';
import type { CookieOptions } from '#app';

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
        const event = useRequestEvent();
        if (!event) throw new Error('No event in route middleware');
        const response = await $fetch.raw('/api/auth/refresh-token', {
          method: 'POST',
          credentials: 'include',
        });
        const cookies = response.headers.getSetCookie?.();
        cookies?.forEach((cookie) => {
          const parsed = cookieUtil.parse(cookie, {
            decode: (val) => val,
          });
          if (parsed.access_token) {
            const access_token = useCookie('access_token', {
              ...(parsed['Max-Age'] ? { maxAge: parseInt(parsed['Max-Age'], 10) } : {}),
              ...(parsed.Expires ? { expires: new Date(parsed.Expires) } : {}),
              ...(parsed.Path ? { path: parsed.Path } : {}),
              ...(parsed.SameSite
                ? { sameSite: parsed.SameSite as CookieOptions['sameSite'] }
                : {}),
            });
            access_token.value = parsed.access_token;
          }
        });
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
