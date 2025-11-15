// import { FetchError } from 'ofetch';
import type { UpdateProfileRequest } from '~~/shared/types/shared';
import type { ApiSuccessResponse } from '../../../shared/types/api';

const API_URL = process.env.BACKEND_URL;

export default defineWrappedResponseHandler(async (event) => {
  const body = await readBody<UpdateProfileRequest>(event);

  const authHeader = getHeader(event, 'authorization');
  const response = await serverApiFetch<ApiSuccessResponse<User>>(`${API_URL}/me`, {
    method: 'PATCH',
    headers: {
      authorization: authHeader || '',
    },
    body,
  });

  return response;
});
