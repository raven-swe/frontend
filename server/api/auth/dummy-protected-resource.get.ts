export default defineEventHandler(async (event) => {
  // This is a dummy protected resource that requires authentication
  const headers = getHeaders(event);
  const response = await serverApiFetch<ApiSuccessResponse<{ data: string }>>(
    '/auth/dummy-protected-resource',
    {
      method: 'GET',
      credentials: 'include',
      headers: {
        Authorization: headers['authorization'] || '',
      },
    },
  );
  return response;
});
