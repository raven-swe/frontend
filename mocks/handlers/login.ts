import { http, HttpResponse } from 'msw';
import jwt from 'jsonwebtoken';
import rawUsers from '../data/mock-users.json' assert { type: 'json' };
import type { User } from '#shared/types/user';
import type {
  ApiSuccessResponse,
  ApiErrorResponse,
  ApiValidationErrorResponse,
} from '#shared/types/api';
import * as cookie from 'cookie';

const mockUsers = rawUsers as User[];

const API_URL = process.env.BACKEND_URL;

const generateAuthToken = (username: string) => {
  const payload = {
    username,
  };
  return jwt.sign(payload, 'secret', { expiresIn: '2m' });
};

const generateRefreshToken = (username: string) => {
  const payload = {
    username,
  };
  return jwt.sign(payload, 'refresh_secret', { expiresIn: '10m' });
};

const generateRefreshCookie = (token: string) => {
  return cookie.serialize('refreshToken', token, {
    httpOnly: true,
    path: '/',
    maxAge: 10 * 60, // make it 10 min for testing
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
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

    // Find user by email or username
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

    // Simulate server error for specific identifier
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

    const authToken = generateAuthToken(user.username);
    const refreshToken = generateRefreshToken(user.username);
    const refreshTokenCookie = generateRefreshCookie(refreshToken);
    // Success
    return new HttpResponse(
      JSON.stringify({ success: true, message: 'Authenticated', data: { accessToken: authToken } }),
      {
        headers: {
          'set-cookie': refreshTokenCookie,
          'Content-Type': 'application/json',
        },
      },
    );
  }),

  // POST /auth/logout
  http.post(`${API_URL}/auth/logout`, ({ request }) => {
    const cookies = cookie.parse(request.headers.get('cookie') || '');
    if (!cookies['refreshToken']) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_AUTHENTICATED',
            message: 'No refresh token provided',
          },
        } as ApiErrorResponse,
        { status: 401 },
      );
    }

    // Clear the refresh token cookie
    const clearCookie = cookie.serialize('refreshToken', '', {
      httpOnly: true,
      path: '/',
      expires: new Date(0),
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return new HttpResponse(JSON.stringify({ success: true, message: 'Logged out successfully' }), {
      headers: {
        'set-cookie': clearCookie,
        'Content-Type': 'application/json',
      },
    });
  }),
];
