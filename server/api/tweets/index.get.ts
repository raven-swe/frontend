import type { Tweet } from '~~/shared/types/tweets';

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization');
  return await serverApiFetch<Tweet[]>('/tweets', {
    method: 'GET',
    headers: {
      Authorization: authHeader || '',
    },
  });
});
