// Configure Undici (Node's native fetch) to support long-lived SSE connections
// Without this, you'll get HeadersTimeoutError after 300s (default)
import { setGlobalDispatcher, Agent } from 'undici';

export default defineNitroPlugin(() => {
  setGlobalDispatcher(
    new Agent({
      // Disable timeouts for SSE streams that stay open indefinitely
      headersTimeout: 0, // No timeout waiting for initial headers
      bodyTimeout: 0, // No timeout for streaming body
      keepAliveTimeout: 60_000, // Keep TCP connections alive for 60s
      keepAliveMaxTimeout: 600_000, // Max keep-alive time: 10 minutes
    }),
  );
});
