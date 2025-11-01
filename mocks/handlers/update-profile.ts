import { http, HttpResponse } from 'msw';
import type { UpdateProfileRequest, UserData } from '~~/shared/types/shared';
import type { ApiSuccessResponse, ApiErrorResponse } from '~~/shared/types/api';
import rawUsers from '../data/mock-users.json' assert { type: 'json' };
import type { User } from '#shared/types/user';
import jwt from 'jsonwebtoken';

const API_URL = process.env.BACKEND_URL;
const mockUsers = rawUsers as User[];
// Create a mapping of username to user info for easy lookup
const mockUserInfos: Record<string, User> = {};
mockUsers.forEach((user) => {
  mockUserInfos[user.username] = user;
});

// Mock user data that will be updated
const mockUserData: UserData = {
  username: 'johndoe',
  displayName: 'John Doe',
  bio: 'Software developer passionate about open source',
  avatarUrl: 'https://i.ibb.co/qMcSYBfk/image.jpg',
  bannerUrl: 'https://i.ibb.co/Z1Yx04kS/dfghj.webp',
  location: 'San Francisco, CA',
  websiteUrl: 'https://johndoe.dev',
  birthDate: '1990-01-15',
  joinedAt: '2020-03-15T10:30:00Z',
  email: 'https://github.com/',
  phone: '+1234567890',
  languageCode: 'en',
};

export const handlers = [
  // Update profile PATCH request
  http.patch(`${API_URL}/me`, async ({ request }) => {
    try {
      const body = (await request.json()) as UpdateProfileRequest;

      // Update the mock user data with new values
      if (body.displayName !== undefined) {
        mockUserData.displayName = body.displayName;
      }
      if (body.bio !== undefined) {
        mockUserData.bio = body.bio;
      }
      if (body.location !== undefined) {
        mockUserData.location = body.location;
      }
      if (body.websiteUrl !== undefined) {
        mockUserData.websiteUrl = body.websiteUrl;
      }
      if (body.birthDate !== undefined) {
        mockUserData.birthDate = body.birthDate;
      }

      const response: ApiSuccessResponse<UserData> = {
        success: true,
        message: 'Profile updated successfully',
        data: { ...mockUserData },
      };

      return HttpResponse.json(response, { status: 200 });
    } catch {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to update profile',
          },
        },
        { status: 500 },
      );
    }
  }),

  // Update profile picture POST request
  http.post(`${API_URL}/me/profile-picture`, async ({ request }) => {
    try {
      const formData = await request.formData();
      const file = formData.get('profilePicture') as File;

      if (!file) {
        return HttpResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Profile picture file is required',
            },
          },
          { status: 400 },
        );
      }

      // Simulate file upload and return mock URL
      const mockImageUrl = `https://ibb.co/rGzj2kS4`; // always return the same mock image URL
      mockUserData.avatarUrl = mockImageUrl; // Update the user in the store with this?

      return HttpResponse.json(
        {
          success: true,
          message: 'Profile picture updated successfully',
          imageUrl: mockImageUrl,
        },
        { status: 200 },
      );
    } catch {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to update profile picture',
          },
        },
        { status: 500 },
      );
    }
  }),

  // Update banner/header image POST request
  http.post(`${API_URL}/me/banner`, async ({ request }) => {
    try {
      const formData = await request.formData();
      const file = formData.get('bannerImage') as File;

      if (!file) {
        return HttpResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Banner image file is required',
            },
          },
          { status: 400 },
        );
      }

      // Simulate file upload and return mock URL
      const mockBannerUrl = `https://ibb.co/bR2Xkw8F`;
      mockUserData.bannerUrl = mockBannerUrl;

      return HttpResponse.json(
        {
          imageUrl: mockBannerUrl,
        },
        { status: 200 },
      );
    } catch {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to update banner image',
          },
        },
        { status: 500 },
      );
    }
  }),

  // Delete banner image DELETE request
  http.delete(`${API_URL}/me/banner`, () => {
    mockUserData.bannerUrl = '';

    return HttpResponse.json(
      {
        success: true,
        message: 'Banner image deleted successfully',
      },
      { status: 200 },
    );
  }),

  // Get current user profile
  http.get(`${API_URL}/me`, () => {
    const response: ApiSuccessResponse<UserData> = {
      success: true,
      data: { ...mockUserData },
    };

    return HttpResponse.json(response, { status: 200 });
  }),

  http.get(`${API_URL}/me`, (req) => {
    const accessToken = req.cookies['access_token'];

    if (!accessToken) {
      return new HttpResponse(
        JSON.stringify({ error: { message: 'No access token provided' } } as ApiErrorResponse),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }
    try {
      const decoded = jwt.verify(accessToken, 'refresh_secret') as { username: string };
      // search for user by username in mockUsers
      const user = mockUserInfos[decoded.username];
      if (!user) throw new Error('User not found');

      const response: ApiSuccessResponse<User> = {
        success: true,
        data: user,
      };

      return HttpResponse.json(response, { status: 200 });
    } catch {
      return new HttpResponse(
        JSON.stringify({ error: { message: 'Invalid access token' } } as ApiErrorResponse),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }
  }),
];
