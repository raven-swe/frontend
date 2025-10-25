export default defineEventHandler(async (event) => {
  // This is a dummy protected resource that requires authentication
  const headers = getHeaders(event);
  return await serverApiFetch<ApiSuccessResponse<{ data: string }>>(
    '/auth/dummy-protected-resource',
    {
      method: 'GET',
      headers: {
        Authorization: headers['authorization'] || '',
      },
    },
  );
});
