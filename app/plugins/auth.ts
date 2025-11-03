export default defineNuxtPlugin(() => {
  if (import.meta.server) {
    const event = useRequestEvent();
    if (event?.context.auth) {
      const auth = useAuth();
      auth.accessToken.value = event.context.auth.accessToken;
    }
  }
});
