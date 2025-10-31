import { http, HttpResponse } from 'msw';
import rawUsers from '../data/mock-users.json' assert { type: 'json' };
import type { User } from '#shared/types/user';

const mockUsers = rawUsers as User[];

// Create a mapping of username to user info for easy lookup
const mockUserInfos: Record<string, User> = {};
mockUsers.forEach((user) => {
  mockUserInfos[user.username] = user;
});

const API_URL = process.env.BACKEND_URL;

export const userProfileHandlers = [
  http.get(`${API_URL}/users/:username/profile`, ({ params }) => {
    const { username } = params;
    const userInfo = mockUserInfos[username as keyof typeof mockUserInfos];

    if (!userInfo) {
      return HttpResponse.json(
        { message: `User profile for "${username}" not found` },
        { status: 404 },
      );
    }

    return HttpResponse.json(userInfo, { status: 200 });
  }),
];
