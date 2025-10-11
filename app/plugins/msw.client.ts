export default defineNuxtPlugin(async () => {
  if (import.meta.dev) {
    const { worker } = await import('../../mocks/browser');
    await worker.start({
      onUnhandledRequest: 'bypass',
    });
    console.warn('Mock Service Worker (client) started');
  }
});
