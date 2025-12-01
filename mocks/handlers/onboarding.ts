import { http, HttpResponse } from 'msw';

import rawUsers from '../data/mock-users.json' assert { type: 'json' };
import type { CompactUser, User } from '../../shared/types/user';
import type { ApiSuccessResponse } from '../../shared/types/api';
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
  http.post(`${API_URL}/onboarding/interests`, async () => {
    return HttpResponse.json(
      {
        success: true,
        message: 'Interests updated successfully.',
      },
      { status: 200 },
    );
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
