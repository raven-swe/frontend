import { defineWrappedResponseHandler } from '~~/server/utils/handler';
import * as yup from 'yup';
const paramsSchema = yup.object({ id: yup.string().required().min(1) });
export default defineWrappedResponseHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, (data) => paramsSchema.validate(data));
  const query = getQuery<{
    locale: string;
  }>(event);
  const fetcher = serverApiFetch(event);
  const response = await fetcher<ApiSuccessResponse<{ id: string; summary: string }>>(
    `/tweets/${id}/summary`,
    {
      method: 'GET',
      query: {
        locale: query.locale,
      },
    },
  );
  return response;
});
