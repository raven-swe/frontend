import type { FollowSuggestion } from '~~/shared/types/user';

export default defineWrappedResponseHandler(async (event) => {
  const authHeader = getHeader(event, 'Authorization') || '';
  return await serverApiFetch<ApiSuccessResponse<{ suggestions: FollowSuggestion[] }>>(
    '/onboarding/follow-suggestions',
    {
      method: 'GET',
      headers: {
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
    },
  );
});
