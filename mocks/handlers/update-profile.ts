import { http, HttpResponse } from 'msw';
import type { UpdateProfileRequest, UserData } from '~~/shared/types/shared';
import type { ApiSuccessResponse } from '~~/shared/types/api';

const API_URL = process.env.BACKEND_URL;

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

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

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

  http.post(`${API_URL}/me/username`, async () => {
    mockUserData.username = '';

    return HttpResponse.json(
      {
        success: true,
        message: 'Username updated successfully',
      },
      { status: 200 },
    );
  }),

  http.put(`${API_URL}/me/password`, async ({ request }) => {
    try {
      // eslint-disable-next-line no-console
      console.log('Password change request received');
      const body = await request.json();
      // eslint-disable-next-line no-console
      console.log('Request body:', body);

      const { currentPassword, newPassword } = body as ChangePasswordRequest;

      if (!currentPassword || !newPassword) {
        // eslint-disable-next-line no-console
        console.log('Validation error: missing fields');
        return HttpResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Current password and new password are required',
            },
          },
          { status: 400 },
        );
      }

      if (currentPassword !== '123456789') {
        // eslint-disable-next-line no-console
        console.log('Invalid credentials: wrong password');
        return HttpResponse.json(
          {
            success: false,
            error: {
              code: 'INVALID_CREDENTIALS',
              message: 'Current password is incorrect',
            },
          },
          { status: 422 },
        );
      }

      // eslint-disable-next-line no-console
      console.log('Password changed successfully');
      return HttpResponse.json(
        {
          success: true,
          message: 'Password changed successfully',
        },
        { status: 200 },
      );
    } catch (error) {
      console.error('Error in password change handler:', error);
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to change password',
          },
        },
        { status: 500 },
      );
    }
  }),
];
