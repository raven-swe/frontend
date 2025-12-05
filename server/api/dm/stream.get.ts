import { defineWrappedResponseHandler } from '~~/server/utils/handler';
export default defineWrappedResponseHandler(async (event) => {
  const query = getQuery(event);
  const fetcher = serverApiFetch(event);
  const upstream = await fetcher('/stream', {
    method: 'GET',
    query,
    headers: {
      Accept: 'text/event-stream',
    },
    responseType: 'stream',
  });

  // Prepare SSE response headers for the client
  setHeader(event, 'Content-Type', 'text/event-stream');
  setHeader(event, 'Cache-Control', 'no-cache, no-transform');
  setHeader(event, 'Connection', 'keep-alive');
  setHeader(event, 'X-Accel-Buffering', 'no');

  return sendStream(event, upstream);
});
