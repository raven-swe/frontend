export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === '/profile' || to.path === '/profile/') {
    const userStore = useUserStore();
    // Get username from store
    await userStore.fetchUserProfile();
    const username = userStore.user?.username;

    if (username) {
      return navigateTo(`/profile/${username}`);
    } else {
      console.error('Username not found in user store', userStore.user);
      // will never reach here for any authenticated user, but just in case
      return navigateTo('/');
    }
  }
});
