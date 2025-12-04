import { http, HttpResponse } from 'msw';

import rawUsers from '../data/mock-users.json' assert { type: 'json' };
import type { CompactUser, User } from '../../shared/types/user';
import type { ApiSuccessResponse } from '../../shared/types/api';
import type { Interest } from '../../shared/types/interests';
const mockUsers = rawUsers as User[];

const mockCompactUsers: CompactUser[] = mockUsers.map((user) => ({
  username: user.username,
  displayName: user.displayName,
  avatarUrl: user.avatarUrl,
  bio: user.bio,
  bioEntities: user.bioEntities,
  relationship: user.relationship,
}));

const mockSuggestions = ['Abdallahfahewr', 'Abdallahfawe', 'Abdallahfaklh'];

const API_URL = process.env.BACKEND_URL;

export const handlers = [
  http.get(`${API_URL}/onboarding/username-suggestions`, () => {
    return HttpResponse.json(
      {
        success: true,
        message: 'Suggestions fetched successfully.',
        data: {
          suggestions: mockSuggestions,
        },
      },
      { status: 200 },
    );
  }),

  http.put(`${API_URL}/me/settings/interests`, async ({ request }) => {
    const body = (await request.json()) as { interests: string[] };
    const selectedInterests: string[] = body?.interests;
    if (!Array.isArray(selectedInterests)) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Invalid interests format.',
        },
        { status: 400 },
      );
    }
    return HttpResponse.json(
      {
        success: true,
        message: 'Interests updated successfully.',
      },
      { status: 200 },
    );
  }),

  http.get(`${API_URL}/me/settings/interests`, async () => {
    return HttpResponse.json<ApiSuccessResponse<Interest[]>>({
      success: true,
      message: 'Interests fetched successfully',
      data: [
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
      ],
    });
  }),

  http.get(`${API_URL}/onboarding/follow-suggestions`, ({ request }) => {
    const url = new URL(request.url);
    const cursor = url.searchParams.get('cursor') || null;
    const limit = Number(url.searchParams.get('limit') || '20');
    const startIndex = cursor ? Math.max(0, Number(cursor)) : 0;
    const paginatedFollowers: CompactUser[] = mockCompactUsers.slice(
      startIndex,
      startIndex + limit,
    );
    const nextIndex = startIndex + paginatedFollowers.length;
    const nextCursor = nextIndex < mockCompactUsers.length ? String(nextIndex) : null;
    return HttpResponse.json<ApiSuccessResponse<CompactUser[]>>(
      {
        success: true,
        message: 'Follow suggestions fetched successfully.',
        data: paginatedFollowers,
        pagination: {
          cursor: String(startIndex),
          nextCursor,
          hasNextPage: !!nextCursor,
        },
      },
      { status: 200 },
    );
  }),
];
