import type { DmConversation } from '~~/shared/types/dm';

export default defineWrappedResponseHandler(async (event) => {
  const fetcher = serverApiFetch(event);
  const response = await fetcher<ApiSuccessResponse<DmConversation[]>>('/conversations');
  return response;
});
