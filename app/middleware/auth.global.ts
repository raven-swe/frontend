import { isAuthenticated } from '~/services/auth/authService';

// Public routes that don’t require auth
const publicRoutes = ['/', '/forget-password', '/playground/dummy-login'];

export default defineNuxtRouteMiddleware((to) => {
  const isAuth = isAuthenticated();
  // If already authenticated, redirect to /home
  if (to.path === '/' && isAuth) {
    return navigateTo('/home');
  }

  // Allow if it's a public route
  if (publicRoutes.includes(to.path)) return;

  // Protect all other routes
  if (!isAuth) {
    return navigateTo('/');
  }
});
