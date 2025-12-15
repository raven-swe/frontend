import { http, HttpResponse } from 'msw';

import rawUsers from '../data/mock-users.json' assert { type: 'json' };
import type { CompactUser, User } from '../../shared/types/user';
import type { ApiSuccessResponse, ApiValidationErrorResponse } from '../../shared/types/api';
import type { Interest } from '../../shared/types/interests';
import { interests } from './mockUserDB';
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
    if (!Array.isArray(selectedInterests) || selectedInterests.length === 0) {
      return HttpResponse.json<ApiValidationErrorResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation error',
            errors: [
              {
                field: 'interests',
                code: 'REQUIRED',
              },
            ],
          },
        },
        { status: 422 },
      );
    }

    // Update the mock interests data
    Array.from({ length: interests.length }, (_, i) => {
      if (interests[i]) interests[i].isSelected = false;
    });
    selectedInterests.forEach((interestCode) => {
      const interestIndex = interests.findIndex((i) => i.code === interestCode);
      if (interestIndex !== -1 && interests[interestIndex]) {
        interests[interestIndex].isSelected = true;
      }
    });

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
      data: interests,
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
