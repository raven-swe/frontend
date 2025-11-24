import { apiFetch } from '~/api';

export const uploadMediaService = () => {
  // Upload image
  const uploadImage = async (file: File, folder = 'tweets') => {
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('folder', folder);

      const response = await apiFetch('/api/media/upload/image', {
        method: 'POST',
        body: form,
      });

      return response.data.id;
    } catch (error) {
      console.error('Failed to upload image:', error);
      throw error;
    }
  };

  // Upload video
  const uploadVideo = async (file: File, folder = 'tweets') => {
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('folder', folder);

      const response = await apiFetch('/api/media/upload/video', {
        method: 'POST',
        body: form,
      });

      return response.data.id;
    } catch (error) {
      console.error('Failed to upload video:', error);
      throw error;
    }
  };

  return {
    uploadImage,
    uploadVideo,
  };
};
