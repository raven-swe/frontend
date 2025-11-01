import { http, HttpResponse } from 'msw';
import rawUsers from '../data/mock-users.json' assert { type: 'json' };
import type { User } from '#shared/types/user';

const mockUsers = rawUsers as User[];

const exampleUser: User = {
  username: 'ravencmp123',
  displayName: 'Madelyn6',
  bio: 'Quo solio verecundia cetera testimonium ater apto vaco.',
  bioEntities: {
    mentions: [],
    hashtags: [],
  },
  avatarUrl: 'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/33.jpg',
  bannerUrl: 'https://picsum.photos/seed/n5kxRgi/128/866?blur=2',
  location: 'Lake Grady',
  websiteUrl: 'https://overcooked-travel.info/',
  birthDate: '2000-12-03T15:36:35.414Z',
  joinedAt: '2024-02-18T04:51:04.728Z',
  email: 'Tyreek20@hotmail.com',
  phone: '1-423-608-5792 x0859',
  followersCount: 3091,
  followingCount: 8869,
  languageCode: 'en',
};
mockUsers.push(exampleUser);

// Create a mapping of username to user info for easy lookup
const mockUserInfos: Record<string, User> = {};
mockUsers.forEach((user) => {
  mockUserInfos[user.username] = user;
});

const API_URL = process.env.BACKEND_URL;

export const handlers = [
  http.get(`${API_URL}/users/:username/profile`, ({ params }) => {
    const username = params.username as string;
    console.log('\n\nMock handler accessed for username:', username);
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
