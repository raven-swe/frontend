import rawUsers from '../data/mock-users.json' assert { type: 'json' };
import type { User } from '#shared/types/user';

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
  relationship: {
    following: false,
    follower: false,
    blockedBy: false,
    blocking: false,
    muted: false,
  },
};
export const users: User[] = [...(rawUsers as User[]), exampleUser];
// Create a mapping of username to user info for easy lookup
export const mockUserInfos: Record<string, User> = Object.fromEntries(
  users.map((user) => [user.username, user]),
);
