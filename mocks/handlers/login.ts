import { http, HttpResponse } from 'msw';
import jwt from 'jsonwebtoken';
import rawUsers from '../data/mock-users.json' assert { type: 'json' };
import type { User } from '#shared/types/user';
import type {
  ApiSuccessResponse,
  ApiErrorResponse,
  ApiValidationErrorResponse,
} from '#shared/types/api';

const mockUsers = rawUsers as User[];

const API_URL = process.env.BACKEND_URL;

const generateAuthToken = (user: User) => {
  const payload = {
    username: user.username,
  };
  return jwt.sign(payload, 'secret', { expiresIn: '5m' });
};

export const handlers = [
  // GET /auth/check-identifier?identifier=<identifier>
  http.get(`${API_URL}/auth/check-identifier`, ({ request }) => {
    const url = new URL(request.url);
    const identifier = url.searchParams.get('identifier');

    if (!identifier) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Identifier is required',
            errors: [{ field: 'identifier', code: 'REQUIRED', message: 'Identifier is required' }],
          },
        } as ApiValidationErrorResponse,
        { status: 422 },
      );
    }

    const user = mockUsers.find((u) => u.email === identifier || u.username === identifier);

    if (!user) {
      return HttpResponse.json(
        {
          success: true,
          message: 'User not found',
          data: { exists: false, type: '' },
        } as ApiSuccessResponse<{ exists: boolean; type: string }>,
        { status: 200 },
      );
    }

    return HttpResponse.json(
      {
        success: true,
        message: user ? 'User found' : 'User not found',
        data: {
          exists: !!user,
          type: user ? (user.email === identifier ? 'email' : 'username') : '',
        },
      } as ApiSuccessResponse<{ exists: boolean; type: string }>,
      { status: 200 },
    );
  }),

  // POST /auth/login
  http.post(`${API_URL}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as {
      identifier?: string;
      password?: string;
    };

    if (!body?.identifier || !body?.password) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Missing required fields',
            errors: [
              ...(body?.identifier
                ? []
                : [{ field: 'identifier', code: 'REQUIRED', message: 'Identifier is required' }]),
              ...(body?.password
                ? []
                : [{ field: 'password', code: 'REQUIRED', message: 'Password is required' }]),
            ],
          },
        } as ApiValidationErrorResponse,
        { status: 422 },
      );
    }

    const { identifier, password } = body;

    const user = mockUsers.find((u) => u.email === identifier || u.username === identifier);

    if (!user) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'Invalid credentials',
          },
        } as ApiErrorResponse,
        { status: 401 },
      );
    }

    if (password !== 'Password@123') {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_PASSWORD',
            message: 'Incorrect password',
          },
        } as ApiErrorResponse,
        { status: 401 },
      );
    }

    return HttpResponse.json(
      {
        success: true,
        message: 'Login successful',
        data: {
          accessToken: generateAuthToken(user),
          // refreshToken: generateRefreshToken(user),
        },
      } as ApiSuccessResponse<{ accessToken: string }>,
      { status: 200 },
    );
  }),
];
