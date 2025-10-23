import { http, HttpResponse } from 'msw';
import mockUsers from '../data/mock-users.json' assert { type: 'json' };

const API_URL = process.env.BACKEND_URL;

export const handlers = [
  http.get(`${API_URL}/user/:username`, ({ params }) => {
    const { username } = params;

    const user = mockUsers.find((u) => u.username === username);
    if (!user) {
      return HttpResponse.json({ message: `User "${username}" not found` }, { status: 404 });
    }

    return HttpResponse.json(
      {
        success: true,
        message: 'User fetched successfully.',
        data: user,
      },
      { status: 200 },
    );
  }),
];
