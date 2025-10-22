export default defineEventHandler(async (_event) => {
  // This is a dummy protected resource that requires authentication
  const response = await serverApiFetch<ApiSuccessResponse<{ data: string }>>(
    '/auth/dummy-protected-resource',
    {
      method: 'GET',
      credentials: 'include',
      headers: {
        Authorization: `${_event.node.req.headers.authorization}`,
      },
    },
  );
  return response;
});
