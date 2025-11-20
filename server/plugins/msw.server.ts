export default defineNitroPlugin(async (nitroApp) => {
  const config = useRuntimeConfig();

  if (!import.meta.dev || !config.public.useMocks) return;

  const { server } = await import('../../mocks/node');
  server.listen({ onUnhandledRequest: 'bypass' });
  console.warn('Mock Service Worker (server) started');

  nitroApp.hooks.hook('close', () => {
    server.close();
  });
});
