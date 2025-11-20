import { http, HttpResponse } from 'msw';
import rawUsers from '../data/mock-users.json' assert { type: 'json' };
import type { User } from '#shared/types/user';
import jwt from 'jsonwebtoken';
import { faker } from '@faker-js/faker';
import type {
  ApiErrorResponse,
  ApiSuccessResponse,
  ApiValidationErrorResponse,
} from '#shared/types/api';
import * as cookie from 'cookie';

const mockUsers = rawUsers as User[];

const API_URL = process.env.BACKEND_URL;

const generateAuthToken = (username: string) => {
  const payload = {
    username,
  };
  return jwt.sign(payload, 'secret', { expiresIn: '1m' });
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
  http.get(`${API_URL}/auth/check-email`, ({ request }) => {
    const url = new URL(request.url);
    const email = url.searchParams.get('email');

    if (email == 'test@example.com') {
      return HttpResponse.json(
        { success: true, message: 'User found', data: { exists: true } },
        { status: 200 },
      );
    }

    const user = mockUsers.find((u) => u.email === email);

    return HttpResponse.json(
      { success: true, message: user ? 'User found' : 'User not found', data: { exists: !!user } },
      { status: 200 },
    );
  }),

  http.post(`${API_URL}/auth/register/start`, async ({ request }) => {
    const body = (await request.json()) as
      | {
          name: string;
          email: string;
          birthDate: `${number}-${number}-${number}`;
          recaptchaToken: string;
        }
      | undefined;

    if (!body || !body.name || !body.email || !body.birthDate || !body.recaptchaToken) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            message: 'Validation error',
            code: 'VALIDATION_ERROR',
            errors: [
              { field: 'name', message: 'Name is required' },
              { field: 'email', message: 'Email is required' },
              { field: 'birthDate', message: 'Birth date is required' },
              { field: 'recaptchaToken', message: 'Recaptcha token is required' },
            ],
          },
        } as ApiValidationErrorResponse,
        { status: 400 },
      );
    }
    const { email, name, birthDate } = body;

    if (new Date(birthDate) > new Date()) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            message: 'Invalid birth date',
            code: 'INVALID_BIRTHDATE',
          },
        } as ApiErrorResponse,
        { status: 400 },
      );
    }

    const creationToken = jwt.sign({ email, name, birthDate }, 'creation_secret', {
      expiresIn: '5m',
    });

    return HttpResponse.json(
      {
        success: true,
        message: 'Registration started',
        data: { creationToken },
      } as ApiSuccessResponse<{ creationToken: string }>,
      { status: 200 },
    );
  }),

  http.post(`${API_URL}/auth/register/verify`, async ({ request }) => {
    const { creationToken, otp } = (await request.json()) as {
      creationToken: string;
      otp: string;
    };

    if (otp !== '123456') {
      return HttpResponse.json(
        { success: false, error: { message: 'Invalid OTP', code: 'INVALID_OTP' } },
        { status: 400 },
      );
    }

    try {
      const decoded = jwt.verify(creationToken, 'creation_secret') as {
        email: string;
        name: string;
        birthDate: string;
      };
      const tempUser = mockUsers.find((u) => u.email === decoded.email);
      if (tempUser) {
        return HttpResponse.json(
          { success: false, error: { message: 'User already exists', code: 'USER_EXISTS' } },
          { status: 409 },
        );
      }

      return HttpResponse.json(
        {
          success: true,
          message: 'Registration verified successfully.',
        },
        { status: 200 },
      );
    } catch {
      return HttpResponse.json(
        { success: false, error: { message: 'Invalid creation token', code: 'INVALID_TOKEN' } },
        { status: 400 },
      );
    }
  }),

  http.post(`${API_URL}/auth/register/resend-otp`, async ({ request }) => {
    const { creationToken } = (await request.json()) as {
      creationToken: string;
    };
    if (!creationToken) {
      return HttpResponse.json(
        {
          success: false,
          error: { message: 'No creation token provided' },
        },
        {
          status: 400,
        },
      );
    }

    return HttpResponse.json(
      { success: true, message: 'OTP resent successfully' },
      { status: 200 },
    );
  }),

  http.post(`${API_URL}/auth/register/complete`, async ({ request }) => {
    const { creationToken } = (await request.json()) as {
      creationToken: string;
      password: string;
    };
    try {
      const decoded = jwt.verify(creationToken, 'creation_secret') as {
        email: string;
        name: string;
        birthDate: string;
      };
      const existingUser = mockUsers.find((u) => u.email === decoded.email);
      if (existingUser) {
        return HttpResponse.json(
          { success: false, error: { message: 'User already exists', code: 'USER_EXISTS' } },
          { status: 409 },
        );
      }

      const newUser: User = {
        username: decoded.name.toLowerCase().replace(/\s+/g, '') + Math.floor(Math.random() * 1000),
        displayName: decoded.name,
        bio: null,
        bioEntities: { mentions: [], hashtags: [] },
        avatarUrl: faker.image.avatar(),
        bannerUrl: faker.image.urlPicsumPhotos({ width: 128 }),
        location: '',
        websiteUrl: '',
        birthDate: new Date().toISOString(),
        joinedAt: new Date().toISOString(),
        email: decoded.email,
        phone: '',
        languageCode: 'en',
      };
      mockUsers.push(newUser);

      const refreshToken = generateRefreshToken(newUser.username);
      const authToken = generateAuthToken(newUser.username);
      const refreshTokenCookie = generateRefreshCookie(refreshToken);
      return new HttpResponse(
        JSON.stringify({
          success: true,
          message: 'Authenticated',
          data: { accessToken: authToken },
        }),
        {
          headers: {
            'set-cookie': refreshTokenCookie,
            'Content-Type': 'application/json',
          },
        },
      );
    } catch {
      return HttpResponse.json(
        { success: false, error: { message: 'Invalid creation token', code: 'INVALID_TOKEN' } },
        { status: 400 },
      );
    }
  }),
];
