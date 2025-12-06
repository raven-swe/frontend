import type { CompactUser } from '~~/shared/types/user';
import { defineWrappedResponseHandler } from '~~/server/utils/handler';

export default defineWrappedResponseHandler(async (event) => {
  const fetcher = serverApiFetch(event);
  const query = getQuery(event);

  return await fetcher<ApiSuccessResponse<CompactUser[]>>('/search/users', {
    method: 'GET',
    query: {
      query: query.query,
      limit: query.limit,
      cursor: query.cursor ?? undefined,
      peopleFilter: query.peopleFilter,
      excludeMutedAndBlocked: query.excludeMutedAndBlocked,
    },
  });
});
