export default defineNitroPlugin(async (nitroApp) => {
  if (import.meta.dev) {
    const { server } = await import('../../mocks/node');
    server.listen({ onUnhandledRequest: 'bypass' });
    console.warn('Mock Service Worker (server) started');

    nitroApp.hooks.hook('close', () => {
      server.close();
    });
  }
});
