import type { DmConversation } from '~~/shared/types/dm';

export default defineWrappedResponseHandler(async (event) => {
  const query = getQuery<{ cursor?: string; limit?: number }>(event);
  const fetcher = serverApiFetch(event);
  const response = await fetcher<ApiSuccessResponse<DmConversation[]>>('/conversations', {
    method: 'GET',
    query: {
      cursor: query.cursor,
      limit: query.limit || 20,
    },
  });

  return response;
});
