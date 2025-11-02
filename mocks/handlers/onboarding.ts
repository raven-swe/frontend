import { http, HttpResponse } from 'msw';

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
  http.post(`${API_URL}/onboarding/interests/update`, async () => {
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
          suggestions: [
            {
              username: 'user1',
              displayName: 'User One',
              avatarUrl: 'https://example.com/avatar1.png',
            },
            {
              username: 'user2',
              displayName: 'User Two',
              avatarUrl: 'https://example.com/avatar2.png',
            },
            {
              username: 'user3',
              displayName: 'User Three',
              avatarUrl: 'https://example.com/avatar3.png',
            },
          ],
        },
      },
      { status: 200 },
    );
  }),
];
