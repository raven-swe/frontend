export default defineWrappedResponseHandler(async (event) => {
  const params = event.context.params;
  const username = params?.username as string;
  console.log('\n\nFetching profile for username:', username);
  const response = await serverApiFetch<ApiSuccessResponse<User>>(`/users/${username}/profile`);
  return response;
});
