import { defineWrappedResponseHandler } from '~~/server/utils/handler';
import * as yup from 'yup';

const paramsSchema = yup.object({ id: yup.string().required().min(1) });

export default defineWrappedResponseHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, (data) => paramsSchema.validate(data));
  const fetcher = serverApiFetch(event);
  const query = getQuery(event);

  const response = await fetcher<ApiSuccessResponse<CompactUser[]>>(`/tweets/${id}/likes`, {
    method: 'GET',
    query,
  });
  return response;
});
