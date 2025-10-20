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

// 🔑 Generate access token (5-minute expiry)
const generateAuthToken = (user: User) => {
  const payload = {
    username: user.username,
    exp: Math.floor(Date.now() / 1000) + 60 * 5,
  };
  return jwt.sign(payload, 'secret');
};

// 🔄 Generate refresh token (7-day expiry)
const generateRefreshToken = (user: User) => {
  const payload = {
    username: user.username,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
  };
  return jwt.sign(payload, 'refresh_secret');
};

export const loginHandlers = [
  /**
   * 📨 Check if identifier exists
   * GET /auth/check-identifier?identifier=<identifier>
   */
  http.get(`${API_URL}/auth/check-identifier`, ({ request }) => {
    const url = new URL(request.url);
    const identifier = url.searchParams.get('identifier');

    console.log('id in mock', identifier);

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

    if (identifier === 'trigger500@example.com') {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Unexpected error occurred while checking identifier.',
          },
        } as ApiErrorResponse,
        { status: 500 },
      );
    }

    //if you want to test without generating mock users
    if (identifier === 'test@example.com') {
      return HttpResponse.json(
        {
          success: true,
          message: 'User found',
          data: { exists: true },
        } as ApiSuccessResponse<{ exists: boolean }>,
        { status: 200 },
      );
    }

    const user = mockUsers.find((u) => u.email === identifier || u.username === identifier);

    if (!user) {
      return HttpResponse.json(
        {
          success: true,
          message: 'User not found',
          data: { exists: false },
        } as ApiSuccessResponse<{ exists: boolean }>,
        { status: 200 },
      );
    }

    return HttpResponse.json(
      {
        success: true,
        message: user ? 'User found' : 'User not found',
        data: { exists: !!user },
      } as ApiSuccessResponse<{ exists: boolean }>,
      { status: 200 },
    );
  }),

  /**
   * 🔐 User login
   * POST /auth/login
   */
  http.post(`${API_URL}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as {
      identifier?: string;
      password?: string;
    };

    // 🧩 Validation
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

    // 🧠 Find user by email or username
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

    // 🧩 (Optional) Simulated password check
    if (password !== 'Password123') {
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

    // 🛑 Simulate server error for specific identifier
    if (body.identifier === 'trigger500@example.com') {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Unexpected server error occurred while logging in.',
          },
        } as ApiErrorResponse,
        { status: 500 },
      );
    }

    // ✅ Success
    return HttpResponse.json(
      {
        success: true,
        message: 'Login successful',
        data: {
          accessToken: generateAuthToken(user),
          refreshToken: generateRefreshToken(user),
        },
      } as ApiSuccessResponse<{ accessToken: string; refreshToken: string }>,
      { status: 200 },
    );
  }),

  http.post(`${API_URL}/auth/refresh-token`, async ({ request }) => {
    const { refreshToken } = (await request.json()) as { refreshToken: string };
    if (!refreshToken) {
      return HttpResponse.json(
        { success: false, error: { message: 'No refresh token provided', code: 'NO_TOKEN' } },
        { status: 400 },
      );
    }

    try {
      const decoded = jwt.verify(refreshToken, 'refresh_secret') as {
        username: string;
        exp: number;
      };
      if (decoded.exp * 1000 < Date.now()) {
        throw new Error('Token expired');
      }
      const user = mockUsers.find((u) => u.username === decoded.username);
      if (!user) {
        return HttpResponse.json(
          { success: false, error: { message: 'User not found', code: 'USER_NOT_FOUND' } },
          { status: 404 },
        );
      }

      return HttpResponse.json(
        {
          success: true,
          message: 'Token refreshed',
          data: { accessToken: generateAuthToken(user) },
        },
        { status: 200 },
      );
    } catch {
      return HttpResponse.json(
        { success: false, error: { message: 'Invalid refresh token', code: 'INVALID_TOKEN' } },
        { status: 401 },
      );
    }
  }),
];
