export default defineWrappedResponseHandler(async (event) => {
  const authHeader = getHeader(event, 'Authorization') || '';
  return await serverApiFetch<ApiSuccessResponse<{ suggestions: User[] }>>(
    '/onboarding/follow-suggestions',
    {
      method: 'GET',
      headers: {
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
    },
  );
});
