import { http, HttpResponse } from 'msw';

const API_URL = process.env.BACKEND_URL;

export const handlers = [
  http.post(`${API_URL}/oauth/:provider/callback`, async () => {
    // http.post(`${API_URL}/oauth/:provider/callback`, async ({ request }) => {
    // const body = await request.json();
    // console.log('Received body for /oauth/:provider/callback:', body);

    return HttpResponse.json(
      {
        success: true,
        message: 'OAuth callback handled successfully (mock)',
        data: {
          creationToken: 'mocked-creation-token-12345',
        },
      },
      { status: 200 },
    );
  }),
  http.post(`${API_URL}/oauth/complete`, async () => {
    // http.post(`${API_URL}/oauth/complete`, async ({ request }) => {
    // const body = await request.json();
    // console.log('Received body for /oauth/complete:', body);

    return HttpResponse.json(
      {
        success: true,
        message: 'Token exchange successful (mock)',
        data: {
          accessToken: 'mocked-access-token-abc',
          refreshToken: 'mocked-refresh-token-xyz',
        },
      },
      { status: 200 },
    );
  }),
];
