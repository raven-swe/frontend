// images
export const MAX_IMAGE_SIZE_MB = 5;
export const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'];
export const ALLOWED_IMAGE_TYPES_FOR_HTML = ALLOWED_IMAGE_TYPES.join(',');

// videos
export const MAX_VIDEO_SIZE_MB = 10;
export const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024;
export const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/x-matroska', // mkv
  'video/webm',
  'video/quicktime', // mov
];
export const ALLOWED_VIDEO_TYPES_FOR_HTML = ALLOWED_VIDEO_TYPES.join(',');
