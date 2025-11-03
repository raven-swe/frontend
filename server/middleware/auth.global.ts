export default defineEventHandler(async (event) => {
  const refreshToken = getCookie(event, 'refreshToken');
  const authHeader = getHeader(event, 'Authorization');
  if (!refreshToken || authHeader) return;

  const clientCookie = getHeader(event, 'cookie');

  const fetcher = serverApiFetch(event);
  try {
    const response = await fetcher.raw<ApiSuccessResponse<{ accessToken: string }>>(
      '/auth/refresh-token',
      {
        method: 'POST',
        headers: {
          ...(clientCookie ? { cookie: clientCookie } : {}), // Forward client cookies
        },
      },
    );
    const cookies = response.headers.getSetCookie();
    cookies?.forEach((cookie) => {
      appendHeader(event, 'set-cookie', cookie);
    });
    const jwt = response._data?.data.accessToken;
    event.context.auth = { accessToken: jwt };
  } catch {
    event.context.auth = { accessToken: null };
    deleteCookie(event, 'refreshToken');
    sendRedirect(event, '/', 401);
  }
});
