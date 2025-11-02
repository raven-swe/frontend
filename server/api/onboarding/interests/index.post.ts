export default defineWrappedResponseHandler(async (event) => {
  const body = await readBody<{ interests: string[] }>(event);
  return await serverApiFetch('/onboarding/interests', {
    method: 'POST',
    body,
  });
});
