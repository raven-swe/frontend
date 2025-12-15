import { defineWrappedResponseHandler } from '~~/server/utils/handler';
import type { CompactUser } from '~~/shared/types/user';

export default defineWrappedResponseHandler(async (event) => {
  const fetcher = serverApiFetch(event);
  const query = getQuery(event);

  const response = await fetcher<ApiSuccessResponse<CompactUser[]>>(`/me/settings/blocks`, {
    method: 'GET',
    query,
  });

  return response;
});
