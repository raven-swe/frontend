import { http, HttpResponse } from 'msw';

import rawUsers from '../data/mock-users.json' assert { type: 'json' };
import type { User } from '../../shared/types/user';

const mockUsers = rawUsers as User[];

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

  http.get(`${API_URL}/onboarding/follow-suggestions`, () => {
    return HttpResponse.json(
      {
        success: true,
        message: 'Follow suggestions fetched successfully.',
        data: {
          suggestions: mockUsers,
        },
      },
      { status: 200 },
    );
  }),
];
