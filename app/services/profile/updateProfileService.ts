import type { UpdateProfileRequest, UserData } from '~~/types/shared';
import type { ApiSuccessResponse } from '~~/types/api';

export const updateProfileService = () => {
  const updateProfile = async (profileData: UpdateProfileRequest): Promise<UserData> => {
    try {
      const response = await $fetch<ApiSuccessResponse<UserData>>('/api/me', {
        method: 'PATCH',
        body: profileData,
      });

      return response.data;
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  };

  const updateProfilePicture = async (
    file: File,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);

      const response = await $fetch<{ success: boolean; message: string }>(
        '/api/me/profile-picture',
        {
          method: 'POST',
          body: formData,
        },
      );

      return response;
    } catch (error) {
      console.error('Failed to update profile picture:', error);
      throw error;
    }
  };

  const updateHeaderImage = async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('bannerImage', file);

      const response = await $fetch<{ imageUrl: string }>('/api/me/banner', {
        method: 'POST',
        body: formData,
      });

      return response.imageUrl;
    } catch (error) {
      console.error('Failed to update header image:', error);
      throw error;
    }
  };

  return {
    updateProfile,
    updateProfilePicture,
    updateHeaderImage,
  };
};
