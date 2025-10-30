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
];
