import type { CompactUser } from '~~/shared/types/user';
import { defineWrappedResponseHandler } from '~~/server/utils/handler';

export default defineWrappedResponseHandler(async (event) => {
  const fetcher = serverApiFetch(event);
  const query = getQuery(event);

  const response = await fetcher<ApiSuccessResponse<{ users: CompactUser[] }>>('/search/users', {
    method: 'GET',
    query: {
      query: query.query,
      limit: query.limit,
      cursor: query.cursor ?? undefined,
      peopleFilter: query.peopleFilter,
      excludeMutedAndBlocked: query.excludeMutedAndBlocked,
    },
  });

  return {
    ...response,
    data: response.data.users,
  };
});
