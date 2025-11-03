import { http, HttpResponse } from 'msw';
import jwt from 'jsonwebtoken';
import * as cookie from 'cookie';
import type { ApiErrorResponse } from '~~/shared/types/api';
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
  http.post(`${API_URL}/auth/dummy-login`, () => {
    // set refresh token cookie
    const username = 'johndoe';
    const refreshToken = generateRefreshToken(username);
    const authToken = generateAuthToken(username);
    const refreshTokenCookie = generateRefreshCookie(refreshToken);
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

  http.post(`${API_URL}/auth/refresh-token`, (req) => {
    const refreshToken = req.cookies['refreshToken'];
    if (!refreshToken) {
      return new HttpResponse(
        JSON.stringify({ error: { message: 'No refresh token provided' } } as ApiErrorResponse),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    try {
      const decoded = jwt.verify(refreshToken, 'refresh_secret') as { username: string };
      const newAuthToken = generateAuthToken(decoded.username);
      const newRefreshToken = generateRefreshToken(decoded.username);
      // set new refresh token cookie
      const refreshTokenCookie = generateRefreshCookie(newRefreshToken);
      return new HttpResponse(
        JSON.stringify({ success: true, data: { accessToken: newAuthToken } }),
        { headers: { 'Content-Type': 'application/json', 'set-cookie': refreshTokenCookie } },
      );
    } catch {
      return new HttpResponse(
        JSON.stringify({ error: { message: 'Invalid refresh token' } } as ApiErrorResponse),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }
  }),

  http.get(`${API_URL}/auth/dummy-protected-resource`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    if (!authHeader || !token || !authHeader.startsWith('Bearer ')) {
      return new HttpResponse(
        JSON.stringify({ error: { message: 'No token provided' } } as ApiErrorResponse),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    try {
      jwt.verify(token, 'secret');
      return new HttpResponse(
        JSON.stringify({ success: true, data: { info: 'This is protected data.' } }),
        { headers: { 'Content-Type': 'application/json' } },
      );
    } catch {
      return new HttpResponse(
        JSON.stringify({ error: { message: 'Invalid token' } } as ApiErrorResponse),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }
  }),
];
