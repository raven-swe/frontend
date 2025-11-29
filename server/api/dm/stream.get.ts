export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const baseUrl = config.public.dmSseUrl;

  if (!baseUrl) {
    throw createError({
      statusCode: 500,
      statusMessage: 'DM SSE upstream URL is not configured',
    });
  }

  const query = getQuery(event);
  const topicsParam = Array.isArray(query.topics)
    ? query.topics.join(',')
    : (query.topics as string) || 'dm';

  const url = `${baseUrl}/stream?${new URLSearchParams({ topics: topicsParam }).toString()}`;

  const headers = new Headers();
  headers.set('Accept', 'text/event-stream');
  headers.set('X-Client-Type', 'web');

  const token = getCookie(event, 'access_token');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  // Optional: forward client IP if available
  const ip = getRequestIP(event, { xForwardedFor: true });
  if (ip) headers.set('X-Client-IP', ip);

  const upstream = await fetch(url, { method: 'GET', headers });

  if (!upstream.ok || !upstream.body) {
    throw createError({
      statusCode: upstream.status || 502,
      statusMessage: upstream.statusText || 'Failed to connect to DM SSE upstream',
    });
  }

  // Prepare SSE response headers for the client
  setHeader(event, 'Content-Type', 'text/event-stream');
  setHeader(event, 'Cache-Control', 'no-cache, no-transform');
  setHeader(event, 'Connection', 'keep-alive');

  return sendStream(event, upstream.body as ReadableStream<Uint8Array>);
});
