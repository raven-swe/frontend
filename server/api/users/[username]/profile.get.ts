import { defineWrappedResponseHandler } from '~~/server/utils/handler';
import usernameParamsSchema from '~~/server/schemas/username';

export default defineWrappedResponseHandler(async (event) => {
  const { username } = await getValidatedRouterParams(event, (data) =>
    usernameParamsSchema.validate(data),
  );
  const fetcher = serverApiFetch(event);

  const response = await fetcher<ApiSuccessResponse<User>>(`/users/${username}/profile`, {
    method: 'GET',
  });

  // note that the backend will update the format to fix this, this is temporary
  const modifiedResponse: ApiSuccessResponse<User> = {
    ...response,
    data: {
      ...response.data,
      mutualUsers: ((response.data as User & { mutualNames?: string[] })?.mutualNames || [])
        .map((name) => ({
          displayName: name,
          avatarUrl: 'https://cdn.raven.cmp27.space/default_avatar.png', // Placeholder, as we don't have avatar URLs in mutualNames
        }))
        .concat(response.data.mutualUsers || []),
    },
  };
  return modifiedResponse;
});
