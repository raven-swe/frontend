import { http, HttpResponse } from 'msw';
import jwt from 'jsonwebtoken';
import rawUsers from '../data/mock-users.json' assert { type: 'json' };
import type { User } from '#shared/types/user';
import type {
  ApiErrorResponse,
  ApiSuccessResponse,
  ApiResponseBase,
  ApiValidationErrorResponse,
} from '#shared/types/api';
import type {
  CheckUserSchema,
  VerifyUserSchema,
  ResetPasswordSchema,
} from '@/services/auth/passwordService';

import * as cookie from 'cookie';

const mockUsers = rawUsers as User[];

const API_URL = process.env.BACKEND_URL;

const generateAuthToken = (user: User) => {
  const payload = {
    username: user.username,
  };
  return jwt.sign(payload, 'secret', { expiresIn: '5m' });
};

const generateRefreshToken = (user: User) => {
  const payload = {
    username: user.username,
  };
  return jwt.sign(payload, 'refresh_secret', { expiresIn: '7d' });
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
  // POST /auth/password/forgot - Check if user exists and send OTP
  http.post(`${API_URL}/auth/password/forgot`, async ({ request }) => {
    const body = (await request.json()) as CheckUserSchema;

    if (!body.identifier) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation error',
            errors: [{ field: 'identifier', code: 'REQUIRED', message: 'Identifier is required' }],
          },
        } as ApiValidationErrorResponse,
        { status: 422 },
      );
    }

    const user = mockUsers.find(
      (u) => u.email === body.identifier || u.username === body.identifier,
    );

    if (!user) {
      return HttpResponse.json(
        {
          success: false,
          error: { message: 'User not found', code: 'USER_NOT_FOUND' },
        } as ApiErrorResponse,
        { status: 400 },
      );
    }

    // Generate confirmation token
    const confirmationToken = jwt.sign(
      { identifier: body.identifier, username: user.username },
      'confirmation_secret',
      { expiresIn: '5m' },
    );

    return HttpResponse.json(
      {
        success: true,
        message: 'OTP sent successfully.',
        data: { confirmationToken },
      } as ApiSuccessResponse<{ confirmationToken: string }>,
      { status: 200 },
    );
  }),

  // POST /auth/password/forgot/verify - Verify OTP
  http.post(`${API_URL}/auth/password/forgot/verify`, async ({ request }) => {
    const body = (await request.json()) as VerifyUserSchema;

    if (!body.confirmationToken || !body.otp) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation error',
            errors: [
              ...(!body.confirmationToken
                ? [{ field: 'confirmationToken', code: 'REQUIRED', message: 'Token is required' }]
                : []),
              ...(!body.otp
                ? [{ field: 'otp', code: 'REQUIRED', message: 'OTP is required' }]
                : []),
            ],
          },
        } as ApiValidationErrorResponse,
        { status: 422 },
      );
    }

    // Validate OTP (in mock, we accept '123456')
    if (body.otp !== '123456') {
      return HttpResponse.json(
        {
          success: false,
          error: { message: 'Invalid OTP', code: 'INVALID_OTP' },
        } as ApiErrorResponse,
        { status: 400 },
      );
    }

    try {
      // Verify the confirmation token
      jwt.verify(body.confirmationToken, 'confirmation_secret');

      return HttpResponse.json(
        {
          success: true,
          message: 'Password reset verified successfully.',
        } as ApiResponseBase,
        { status: 200 },
      );
    } catch {
      return HttpResponse.json(
        {
          success: false,
          error: { message: 'Invalid or expired token', code: 'INVALID_TOKEN' },
        } as ApiErrorResponse,
        { status: 400 },
      );
    }
  }),

  // POST /auth/password/resend-otp - Resend OTP
  http.post(`${API_URL}/auth/password/resend-otp`, async ({ request }) => {
    const body = (await request.json()) as { confirmationToken?: string };

    if (!body.confirmationToken) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation error',
            errors: [
              { field: 'confirmationToken', code: 'REQUIRED', message: 'Token is required' },
            ],
          },
        } as ApiValidationErrorResponse,
        { status: 422 },
      );
    }

    try {
      // Verify the confirmation token
      jwt.verify(body.confirmationToken, 'confirmation_secret');

      return HttpResponse.json(
        {
          success: true,
          message: 'otp resent successfully.',
        } as ApiResponseBase,
        { status: 200 },
      );
    } catch {
      return HttpResponse.json(
        {
          success: false,
          error: { message: 'Invalid or expired token', code: 'INVALID_TOKEN' },
        } as ApiErrorResponse,
        { status: 400 },
      );
    }
  }),

  // POST /auth/password/reset - Reset password
  http.post(`${API_URL}/auth/password/reset`, async ({ request }) => {
    const body = (await request.json()) as ResetPasswordSchema;

    if (!body.confirmationToken || !body.newPassword) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation error',
            errors: [
              ...(!body.confirmationToken
                ? [{ field: 'confirmationToken', code: 'REQUIRED', message: 'Token is required' }]
                : []),
              ...(!body.newPassword
                ? [{ field: 'newPassword', code: 'REQUIRED', message: 'New password is required' }]
                : []),
            ],
          },
        } as ApiValidationErrorResponse,
        { status: 422 },
      );
    }

    // Validate password length
    if (body.newPassword.length < 8) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation error',
            errors: [
              {
                field: 'newPassword',
                code: 'PASSWORD_TOO_SHORT',
                message: 'Password must be at least 8 characters',
              },
            ],
          },
        } as ApiValidationErrorResponse,
        { status: 422 },
      );
    }

    try {
      // Verify the confirmation token and get user
      const decoded = jwt.verify(body.confirmationToken, 'confirmation_secret') as {
        identifier: string;
        username: string;
      };

      const user = mockUsers.find((u) => u.username === decoded.username);

      if (!user) {
        return HttpResponse.json(
          {
            success: false,
            error: { message: 'User not found', code: 'USER_NOT_FOUND' },
          } as ApiErrorResponse,
          { status: 400 },
        );
      }

      // Generate new access and refresh tokens
      const accessToken = generateAuthToken(user);
      const refreshToken = generateRefreshToken(user);
      const refreshTokenCookie = generateRefreshCookie(refreshToken);

      return new HttpResponse(
        JSON.stringify({
          success: true,
          message: 'Password reset successfully.',
          data: { accessToken: accessToken },
        }),
        { headers: { 'Content-Type': 'application/json', 'set-cookie': refreshTokenCookie } },
      );
    } catch {
      return HttpResponse.json(
        {
          success: false,
          error: { message: 'Invalid or expired token', code: 'INVALID_TOKEN' },
        } as ApiErrorResponse,
        { status: 400 },
      );
    }
  }),
];
