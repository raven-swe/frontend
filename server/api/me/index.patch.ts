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

// export default defineEventHandler(async (event) => {
//   try {
//     const body = await readBody<UpdateProfileRequest>(event);

//     const response = await $fetch<ApiSuccessResponse<UserData>>(`${API_URL}/me`, {
//       method: 'PATCH',
//       body,
//     });

//     return response;
//   } catch (e) {
//     if (e instanceof FetchError) {
//       const errData = e.data as ApiErrorResponse | ApiValidationErrorResponse;
//       throw createError({
//         message: errData?.error?.message || 'Request failed',
//         statusCode: e.statusCode || 500,
//       });
//     }

//     // Re-throw createError instances
//     if (e && typeof e === 'object' && 'statusCode' in e) {
//       throw e;
//     }

//     // Generic error fallback
//     throw createError({
//       message: 'An unexpected error occurred',
//       statusCode: 500,
//     });
//   }
// });
