export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const baseUrl = config.public.dmSseUrl;

  if (!baseUrl) {
    console.error('[dm/stream] NUXT_PUBLIC_DM_SSE_URL is not configured');
    throw createError({
      statusCode: 500,
      statusMessage: 'DM SSE upstream URL is not configured',
    });
  }

  // Validate URL has protocol
  if (!/^https?:\/\//i.test(baseUrl)) {
    console.error('[dm/stream] Invalid dmSseUrl - missing protocol:', baseUrl);
    throw createError({
      statusCode: 500,
      statusMessage: 'DM SSE upstream URL must include protocol (http:// or https://)',
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
  if (!token) {
    console.error('[dm/stream] No access token found - user not authenticated');
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required for DM stream',
    });
  }
  headers.set('Authorization', `Bearer ${token}`);

  // Optional: forward client IP if available
  const ip = getRequestIP(event, { xForwardedFor: true });
  if (ip) headers.set('X-Client-IP', ip);

  console.warn('[dm/stream] Connecting to upstream:', url);

  let upstream: Response;
  try {
    upstream = await fetch(url, { method: 'GET', headers });
  } catch (err) {
    console.error('[dm/stream] Fetch failed:', err);
    throw createError({
      statusCode: 502,
      statusMessage: 'Failed to connect to DM SSE upstream - network error',
    });
  }

  if (!upstream.ok) {
    console.error('[dm/stream] Upstream returned error:', upstream.status, upstream.statusText);
    throw createError({
      statusCode: upstream.status || 502,
      statusMessage: upstream.statusText || 'DM SSE upstream rejected connection',
    });
  }

  if (!upstream.body) {
    console.error('[dm/stream] Upstream response has no body');
    throw createError({
      statusCode: 502,
      statusMessage: 'DM SSE upstream returned empty response',
    });
  }

  // Prepare SSE response headers for the client
  setHeader(event, 'Content-Type', 'text/event-stream');
  setHeader(event, 'Cache-Control', 'no-cache, no-transform');
  setHeader(event, 'Connection', 'keep-alive');
  setHeader(event, 'X-Accel-Buffering', 'no'); // Disable nginx buffering if behind nginx

  console.warn('[dm/stream] SSE stream established successfully');

  return sendStream(event, upstream.body as ReadableStream<Uint8Array>);
});
