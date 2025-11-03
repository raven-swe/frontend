import { defineWrappedResponseHandler } from '~~/server/utils/handler';
import * as yup from 'yup';

const paramsSchema = yup.object({ id: yup.string().required().min(1) });

export default defineWrappedResponseHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, (data) => paramsSchema.validate(data));
  const fetcher = serverApiFetch(event);

  return await fetcher<ApiResponseBase>(`/tweets/${id}/retweet`, {
    method: 'POST',
  });
});
