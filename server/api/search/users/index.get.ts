import type { CompactUser } from '~~/shared/types/user';

export default defineWrappedResponseHandler(async (event) => {
  const query = getQuery<{ query: string }>(event);
  const fetcher = serverApiFetch(event);

  const response = await fetcher<ApiSuccessResponse<{ users: CompactUser[] }>>('/search/users', {
    method: 'GET',
    query: {
      query: query.query,
    },
  });
  return response;
});
