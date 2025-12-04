import { defineWrappedResponseHandler } from '~~/server/utils/handler';
export default defineWrappedResponseHandler(async (event) => {
  const body = getQuery<{
    baseUsername: string;
  }>(event);
  const fetcher = serverApiFetch(event);
  const response = await fetcher<ApiSuccessResponse<{ suggestions: string[] }>>(
    `/onboarding/username-suggestions`,
    {
      method: 'GET',
      query: {
        typed: body.baseUsername,
      },
    },
  );
  return response;
});
