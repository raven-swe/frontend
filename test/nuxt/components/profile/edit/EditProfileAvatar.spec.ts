/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import EditProfileAvatar from '@/components/profile/edit/EditProfileAvatar.vue';
import { createI18n } from 'vue-i18n';
import messages from '~~/i18n/locales/en.json';

// Mock the showToaster utility
vi.mock('@/utils/showToaster', () => ({
  showToaster: vi.fn(),
}));

// Mock the constants
vi.mock('~/constants/files', () => ({
  MAX_IMAGE_SIZE_BYTES: 5 * 1024 * 1024, // 5MB
  MAX_IMAGE_SIZE_MB: 5,
  ALLOWED_IMAGE_TYPES_FOR_HTML: 'image/png,image/jpg,image/jpeg',
}));

const i18n = createI18n({
  locale: 'en',
  messages: { en: messages },
});

const defaultProps = {
  selectedProfileImage: null,
};

describe('EditProfileAvatar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders profile image with default avatar when no image selected', async () => {
    const wrapper = await mountSuspended(EditProfileAvatar, {
      props: defaultProps,
      global: {
        plugins: [i18n],
      },
    });

    const img = wrapper.find('img');
    expect(img.exists()).toBe(true);
    expect(img.attributes('src')).toBe('https://cdn.raven.cmp27.space/default_avatar.png');
  });

  it('renders profile image with selected image when provided', async () => {
    const wrapper = await mountSuspended(EditProfileAvatar, {
      props: {
        selectedProfileImage: 'data:image/png;base64,test',
      },
      global: {
        plugins: [i18n],
      },
    });

    const img = wrapper.find('img');
    expect(img.attributes('src')).toBe('data:image/png;base64,test');
  });

  it('renders hidden file input with correct attributes', async () => {
    const wrapper = await mountSuspended(EditProfileAvatar, {
      props: defaultProps,
      global: {
        plugins: [i18n],
      },
    });

    const fileInput = wrapper.find('input[type="file"]');
    expect(fileInput.exists()).toBe(true);
    expect(fileInput.attributes('accept')).toBe('image/png,image/jpg,image/jpeg');
    expect(fileInput.classes()).toContain('hidden');
  });

  it('triggers file input click when image is clicked', async () => {
    const wrapper = await mountSuspended(EditProfileAvatar, {
      props: defaultProps,
      global: {
        plugins: [i18n],
      },
    });

    const fileInput = wrapper.find('input[type="file"]');
    const clickSpy = vi.spyOn(fileInput.element, 'click').mockImplementation(() => {});

    const img = wrapper.find('img');
    await img.trigger('click');

    expect(clickSpy).toHaveBeenCalled();
  });

  it('triggers file input click when camera button is clicked', async () => {
    const wrapper = await mountSuspended(EditProfileAvatar, {
      props: defaultProps,
      global: {
        plugins: [i18n],
      },
    });

    const fileInput = wrapper.find('input[type="file"]');
    const clickSpy = vi.spyOn(fileInput.element, 'click').mockImplementation(() => {});

    const cameraButton = wrapper.find('button');
    await cameraButton.trigger('click');

    expect(clickSpy).toHaveBeenCalled();
  });

  it('emits update:selectedProfileImage when valid image file is selected', async () => {
    const wrapper = await mountSuspended(EditProfileAvatar, {
      props: defaultProps,
      global: {
        plugins: [i18n],
      },
    });

    const fileInput = wrapper.find('input[type="file"]');

    // Mock FileReader
    const mockFileReader = {
      onload: null as any,
      readAsDataURL: vi.fn(),
    };
    vi.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as any);

    const mockFile = new File(['test'], 'test.png', { type: 'image/png' });
    Object.defineProperty(fileInput.element, 'files', {
      value: [mockFile],
      writable: false,
    });

    await fileInput.trigger('change');

    // Simulate FileReader onload
    mockFileReader.onload({ target: { result: 'data:image/png;base64,test' } });

    expect(wrapper.emitted('update:selectedProfileImage')).toBeTruthy();
    expect(wrapper.emitted('update:selectedProfileImage')?.[0]).toEqual([
      'data:image/png;base64,test',
    ]);
  });

  it('emits fileChange event when file input changes', async () => {
    const wrapper = await mountSuspended(EditProfileAvatar, {
      props: defaultProps,
      global: {
        plugins: [i18n],
      },
    });

    const fileInput = wrapper.find('input[type="file"]');
    const mockFile = new File(['test'], 'test.png', { type: 'image/png' });

    Object.defineProperty(fileInput.element, 'files', {
      value: [mockFile],
      writable: false,
    });

    await fileInput.trigger('change');

    expect(wrapper.emitted('fileChange')).toBeTruthy();
  });

  it('shows error toast when file size exceeds maximum', async () => {
    const { showToaster } = await import('@/utils/showToaster');

    const wrapper = await mountSuspended(EditProfileAvatar, {
      props: defaultProps,
      global: {
        plugins: [i18n],
      },
    });

    const fileInput = wrapper.find('input[type="file"]');

    // Create a large file (10MB)
    const largeFile = new File(['x'.repeat(10 * 1024 * 1024)], 'large.png', { type: 'image/png' });
    Object.defineProperty(fileInput.element, 'files', {
      value: [largeFile],
      writable: false,
    });

    await fileInput.trigger('change');

    expect(showToaster).toHaveBeenCalledWith('error', expect.any(String));
  });

  it('clears input value when file size exceeds maximum', async () => {
    const wrapper = await mountSuspended(EditProfileAvatar, {
      props: defaultProps,
      global: {
        plugins: [i18n],
      },
    });

    const fileInput = wrapper.find('input[type="file"]');

    // Create a large file (10MB)
    const largeFile = new File(['x'.repeat(10 * 1024 * 1024)], 'large.png', { type: 'image/png' });
    Object.defineProperty(fileInput.element, 'files', {
      value: [largeFile],
      writable: false,
    });

    const clearValueSpy = vi.spyOn(fileInput.element, 'value', 'set');

    await fileInput.trigger('change');

    expect(clearValueSpy).toHaveBeenCalledWith('');
  });

  it('only processes image files', async () => {
    const wrapper = await mountSuspended(EditProfileAvatar, {
      props: defaultProps,
      global: {
        plugins: [i18n],
      },
    });

    const fileInput = wrapper.find('input[type="file"]');

    // Mock FileReader
    const mockFileReader = {
      onload: null as any,
      readAsDataURL: vi.fn(),
    };
    vi.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as any);

    // Test with non-image file
    const textFile = new File(['test'], 'test.txt', { type: 'text/plain' });
    Object.defineProperty(fileInput.element, 'files', {
      value: [textFile],
      writable: false,
    });

    await fileInput.trigger('change');

    expect(mockFileReader.readAsDataURL).not.toHaveBeenCalled();
    expect(wrapper.emitted('fileChange')).toBeTruthy();
  });
});
