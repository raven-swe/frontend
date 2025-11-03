// Public routes that don’t require auth
const publicRoutePatterns: RegExp[] = [
  /^\/$/, // root "/"
  /^\/password-reset(?:\/.*)?$/, // "/reset-password" and subpaths
  /^\/auth(?:\/.*)?$/, // "/auth/*"
  /^\/profile(?:\/.*)?$/, // "/profile/*"
];

export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuth();
  const isPublic = publicRoutePatterns.some((regex) => regex.test(to.path));

  // Try to authenticate if not already authenticated
  if (!auth.isAuthenticated.value && import.meta.client) {
    await auth.refreshTokens();
  }

  // Redirect authenticated users away from root to /home
  if (to.path === '/' && auth.isAuthenticated.value) {
    return navigateTo('/home');
  }

  // Allow public routes
  if (isPublic) return;

  // Protect non-public routes - redirect if not authenticated
  if (!auth.isAuthenticated.value) {
    return navigateTo('/');
  }
});
