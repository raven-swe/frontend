export default defineWrappedResponseHandler(async (event) => {
  const params = event.context.params;
  const username = params?.username as string;
  const response = await serverApiFetch<ApiSuccessResponse<User>>(`/api/users/${username}/profile`);
  return response;
});
