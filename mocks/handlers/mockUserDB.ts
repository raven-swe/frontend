import rawUsers from '../data/mock-users.json' assert { type: 'json' };
import type { User } from '#shared/types/user';
import type { Interest } from '#shared/types/interests';

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

export const interests: Interest[] = [
  {
    name: 'News',
    code: 'NEWS',
    isSelected: false,
  },
  {
    name: 'Sports',
    code: 'SPORTS',
    isSelected: false,
  },
  {
    name: 'Entertainment',
    code: 'ENTERTAINMENT',
    isSelected: false,
  },
  {
    name: 'Technology',
    code: 'TECHNOLOGY',
    isSelected: false,
  },
  {
    name: 'Music',
    code: 'MUSIC',
    isSelected: false,
  },
  {
    name: 'Art',
    code: 'ART',
    isSelected: false,
  },
  {
    name: 'Travel',
    code: 'TRAVEL',
    isSelected: false,
  },
  {
    name: 'Food',
    code: 'FOOD',
    isSelected: false,
  },
  {
    name: 'Fashion',
    code: 'FASHION',
    isSelected: false,
  },
  {
    name: 'Health',
    code: 'HEALTH',
    isSelected: false,
  },
  {
    name: 'Science',
    code: 'SCIENCE',
    isSelected: false,
  },
  {
    name: 'Gaming',
    code: 'GAMING',
    isSelected: false,
  },
  {
    name: 'Movies',
    code: 'MOVIES',
    isSelected: false,
  },
  {
    name: 'Books',
    code: 'BOOKS',
    isSelected: false,
  },
  {
    name: 'Photography',
    code: 'PHOTOGRAPHY',
    isSelected: false,
  },
  {
    name: 'Business',
    code: 'BUSINESS',
    isSelected: false,
  },
  {
    name: 'Education',
    code: 'EDUCATION',
    isSelected: false,
  },
  {
    name: 'Nature',
    code: 'NATURE',
    isSelected: false,
  },
  {
    name: 'History',
    code: 'HISTORY',
    isSelected: false,
  },
  {
    name: 'Politics',
    code: 'POLITICS',
    isSelected: false,
  },
  {
    name: 'Comedy',
    code: 'COMEDY',
    isSelected: false,
  },
];

export const users: User[] = [...(rawUsers as User[]), exampleUser];
// Create a mapping of username to user info for easy lookup
export const mockUserInfos: Record<string, User> = Object.fromEntries(
  users.map((user) => [user.username.toLowerCase(), user]),
);
