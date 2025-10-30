import { http, HttpResponse } from 'msw';

const mockUserInfos = {
  hussein: {
    username: 'hussein',
    displayName: 'Hussein Mohamed',
    bio: 'football lover, software engineer, coffee addict.',
    bioEntities: {
      mentions: [],
      hashtags: [],
    },
    avatarUrl: 'https://i.ibb.co/vv6B8ML0/profile.jpg',
    bannerUrl: 'https://i.ibb.co/bj3fhPfq/cover.jpg',
    location: 'Cairo, Egypt',
    websiteUrl: 'https://www.instagram.com/hussein_mohamed__1',
    birthDate: '1999-01-01',
    joinedAt: '2020-07-01T00:00:00.000Z',
    followingCount: 150,
    followersCount: 200,
    mutualsCount: 5,
    mutualNames: [],
  },
};

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
