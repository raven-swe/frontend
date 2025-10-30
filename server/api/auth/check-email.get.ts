export default defineEventHandler(async (event) => {
  const query = getQuery<{ email: string }>(event);
  return await serverApiFetch<ApiSuccessResponse<{ exists: boolean }>>('/auth/check-email', {
    method: 'GET',
    query: {
      email: query.email,
    },
  });
});
