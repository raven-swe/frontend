export default defineEventHandler(async (event) => {
  // This is a dummy protected resource that requires authentication
  const authHeader = getHeader(event, 'authorization');
  return await serverApiFetch<ApiSuccessResponse<{ data: string }>>(
    '/auth/dummy-protected-resource',
    {
      method: 'GET',
      headers: {
        Authorization: authHeader || '',
      },
    },
  );
});
