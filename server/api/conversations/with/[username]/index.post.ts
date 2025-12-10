import type { DmConversation } from '~~/shared/types/dm';

export default defineWrappedResponseHandler(async (event) => {
  const params = event.context.params;
  const fetcher = serverApiFetch(event);
  const username = params?.username as string;
  const response = await fetcher<ApiSuccessResponse<DmConversation>>(
    `/conversations/with/${username}`,
    {
      method: 'POST',
    },
  );
  return response;
});
