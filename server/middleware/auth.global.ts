import { isPublicRoute } from '../../app/utils/public-routes';
import { setAuthCookies } from '../utils/auth/setAuthCookies';

export default defineEventHandler(async (event) => {
  const refreshToken = getCookie(event, 'refreshToken');
  const accessToken = getCookie(event, 'access_token');
  const authHeader = getHeader(event, 'Authorization');
  if (!refreshToken || authHeader || accessToken) return;

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
    setAuthCookies(event, response);
    if (event.node.req.url === '/') sendRedirect(event, '/home', 302);
  } catch {
    deleteCookie(event, 'refreshToken');
    deleteCookie(event, 'access_token');
    if (!isPublicRoute(event.node.req.url || '')) sendRedirect(event, '/', 401);
  }
});
