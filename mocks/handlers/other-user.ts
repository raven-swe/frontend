import { http, HttpResponse } from 'msw';

import { mockUserInfos } from './mockUserDB';

const API_URL = process.env.BACKEND_URL;

export const handlers = [
  http.get(`${API_URL}/users/:username/profile`, async ({ params }) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const username = params.username as string;
    const user = mockUserInfos[username];
    if (user) {
      return HttpResponse.json(
        {
          success: true,
          message: 'User profile fetched successfully',
          data: user,
        },
        { status: 200 },
      );
    } else {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'The requested user does not exist',
          },
        },
        { status: 404 },
      );
    }
  }),
];
