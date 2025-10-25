export default defineEventHandler(async (event) => {
  const query = getQuery<{ identifier: string }>(event);
  const response = await serverApiFetch<
    ApiSuccessResponse<{ exists: boolean; type: string | null }>
  >('/auth/check-identifier', {
    method: 'GET',
    query: {
      identifier: query.identifier,
    },
  });
  return response;
});
