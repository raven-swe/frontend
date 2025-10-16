import { http, HttpResponse } from 'msw';
import rawUsers from '../data/mock-users.json' assert { type: 'json' };
import type { User } from '#shared/types/user';

const mockUsers = rawUsers as User[];

const API_URL = process.env.BACKEND_URL;

export const handlers = [
  http.get(`${API_URL}/auth/check-email`, ({ request }) => {
    const url = new URL(request.url);
    const email = url.searchParams.get('email');

    const user = mockUsers.find((user) => user.email === email);

    return HttpResponse.json(
      { success: true, message: user ? 'User found' : 'User not found', data: { exists: !!user } },
      { status: 200 },
    );
  }),
];
