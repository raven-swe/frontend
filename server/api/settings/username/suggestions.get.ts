import { defineWrappedResponseHandler } from '~~/server/utils/handler';
export default defineWrappedResponseHandler(async (event) => {
  const fetcher = serverApiFetch(event);
  const response = await fetcher<ApiSuccessResponse<{ suggestions: string[] }>>(
    '/onboarding/username-suggestions',
    {
      method: 'GET',
    },
  );
  return response;
});
