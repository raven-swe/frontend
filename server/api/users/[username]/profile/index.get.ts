import { defineWrappedResponseHandler } from '~~/server/utils/handler';

import * as yup from 'yup';

const paramsSchema = yup.object({ username: yup.string().required().min(3) });

export default defineWrappedResponseHandler(async (event) => {
  const { username } = await getValidatedRouterParams(event, (data) => paramsSchema.validate(data));
  const fetcher = serverApiFetch(event);

  const response = await fetcher<ApiSuccessResponse<User>>(`/users/${username}/profile`, {
    method: 'GET',
  });
  return response;
});
