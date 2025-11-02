export default defineWrappedResponseHandler(async (event) => {
  const params = event.context.params;
  const authHeader = getHeader(event, 'Authorization');
  const username = params?.username as string;
  const response = await serverApiFetch<ApiSuccessResponse<User>>(`/users/${username}/profile`, {
    method: 'GET',
    headers: {
      Authorization: authHeader || '',
    },
  });
  return response;
});
