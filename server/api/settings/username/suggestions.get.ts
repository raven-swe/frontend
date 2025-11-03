import { defineWrappedResponseHandler } from '~~/server/utils/handler';
export default defineWrappedResponseHandler(async (event) => {
  const authHeader = getHeader(event, 'Authorization');
  const response = await serverApiFetch<ApiSuccessResponse<{ suggestions: string[] }>>(
    '/onboarding/username-suggestions',
    {
      method: 'GET',
      headers: {
        ...(authHeader ? { Authorization: authHeader } : {}), // Forward authorization header
      },
    },
  );
  return response;
});
