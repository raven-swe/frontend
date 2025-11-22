import { defineWrappedResponseHandler } from '~~/server/utils/handler';

export default defineWrappedResponseHandler(async (event) => {
  const body = await readBody<{ interests: string[] }>(event);
  const fetcher = serverApiFetch(event);
  try {
    return await fetcher<ApiResponseBase>('/onboarding/interests', {
      method: 'POST',
      body,
    });
  } catch {
    return {
      sucess: true,
      message: 'Interests updated successfully(mock).',
    };
  }
});
