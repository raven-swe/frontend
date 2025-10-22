import { http, HttpResponse } from 'msw';

const mockUserInfos = {
  hussein: {
    coverImg: '/cover.jpg',
    profileImg: '/profile.jpg',
    name: 'Hussein Mohamed',
    username: 'hussein',
    bio: 'football lover, software engineer, coffee addict.',
    joinAt: 'july 2020',
    following: 150,
    followers: 50,
  },
  johndoe: {
    coverImg: '/cover.jpg',
    profileImg: '/profile.jpg',
    name: 'John Doe',
    username: 'johndoe',
    bio: 'Software engineer and coffee enthusiast. Love building things.',
    joinAt: 'March 2021',
    following: 245,
    followers: 189,
  },
};

const API_URL = process.env.BACKEND_URL;

export const userProfileHandlers = [
  http.get(`${API_URL}/profile/:username`, ({ params }) => {
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
