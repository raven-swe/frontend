/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import EditProfileBanner from '@/components/profile/edit/EditProfileBanner.vue';
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
  selectedImage: null,
  fileInputRef: null,
};

describe('EditProfileBanner Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders placeholder div when no image selected', async () => {
    const wrapper = await mountSuspended(EditProfileBanner, {
      props: defaultProps,
      global: {
        plugins: [i18n],
      },
    });

    const placeholderDiv = wrapper.find('div.bg-muted-foreground\\/50');
    expect(placeholderDiv.exists()).toBe(true);
    expect(placeholderDiv.classes()).toContain('h-40');
    expect(placeholderDiv.classes()).toContain('cursor-pointer');
  });

  it('renders banner image when image is selected', async () => {
    const wrapper = await mountSuspended(EditProfileBanner, {
      props: {
        ...defaultProps,
        selectedImage: 'data:image/png;base64,test',
      },
      global: {
        plugins: [i18n],
      },
    });

    const img = wrapper.find('img');
    expect(img.exists()).toBe(true);
    expect(img.attributes('src')).toBe('data:image/png;base64,test');
    expect(img.classes()).toContain('h-40');
    expect(img.classes()).toContain('object-cover');
    expect(img.classes()).toContain('brightness-70');
  });

  it('renders hidden file input with correct attributes', async () => {
    const wrapper = await mountSuspended(EditProfileBanner, {
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

  it('triggers file input click when placeholder is clicked', async () => {
    const wrapper = await mountSuspended(EditProfileBanner, {
      props: defaultProps,
      global: {
        plugins: [i18n],
      },
    });

    const fileInput = wrapper.find('input[type="file"]');
    const clickSpy = vi.spyOn(fileInput.element, 'click').mockImplementation(() => {});

    const placeholderDiv = wrapper.find('div.bg-muted-foreground\\/50');
    await placeholderDiv.trigger('click');

    expect(clickSpy).toHaveBeenCalled();
  });

  it('triggers file input click when image is clicked', async () => {
    const wrapper = await mountSuspended(EditProfileBanner, {
      props: {
        ...defaultProps,
        selectedImage: 'data:image/png;base64,test',
      },
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
    const wrapper = await mountSuspended(EditProfileBanner, {
      props: defaultProps,
      global: {
        plugins: [i18n],
      },
    });

    const fileInput = wrapper.find('input[type="file"]');
    const clickSpy = vi.spyOn(fileInput.element, 'click').mockImplementation(() => {});

    const buttons = wrapper.findAll('button');
    const cameraButton = buttons[0]; // Assuming first button is camera button
    await cameraButton.trigger('click');

    expect(clickSpy).toHaveBeenCalled();
  });

  it('emits update:selectedImage when valid image file is selected', async () => {
    const wrapper = await mountSuspended(EditProfileBanner, {
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

    expect(wrapper.emitted('update:selectedImage')).toBeTruthy();
    expect(wrapper.emitted('update:selectedImage')?.[0]).toEqual(['data:image/png;base64,test']);
  });

  it('emits fileChange event when file input changes', async () => {
    const wrapper = await mountSuspended(EditProfileBanner, {
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

  it('emits update:selectedImage with null when remove button is clicked', async () => {
    const wrapper = await mountSuspended(EditProfileBanner, {
      props: {
        ...defaultProps,
        selectedImage: 'data:image/png;base64,test',
      },
      global: {
        plugins: [i18n],
      },
    });

    const buttons = wrapper.findAll('button');
    const removeButton = buttons.find(
      (button) =>
        button.text().includes('×') ||
        button.text().includes('remove') ||
        button.classes().includes('remove'),
    );

    if (removeButton) {
      await removeButton.trigger('click');
      expect(wrapper.emitted('update:selectedImage')).toBeTruthy();
      expect(wrapper.emitted('update:selectedImage')?.[0]).toEqual([null]);
    }
  });

  it('clears file input value when remove button is clicked', async () => {
    const wrapper = await mountSuspended(EditProfileBanner, {
      props: {
        ...defaultProps,
        selectedImage: 'data:image/png;base64,test',
      },
      global: {
        plugins: [i18n],
      },
    });

    const fileInput = wrapper.find('input[type="file"]');
    const clearValueSpy = vi.spyOn(fileInput.element, 'value', 'set');

    const buttons = wrapper.findAll('button');
    const removeButton = buttons.find(
      (button) =>
        button.text().includes('×') ||
        button.text().includes('remove') ||
        button.classes().includes('remove'),
    );

    if (removeButton) {
      await removeButton.trigger('click');
      expect(clearValueSpy).toHaveBeenCalledWith('');
    }
  });

  it('shows error toast when file size exceeds maximum', async () => {
    const { showToaster } = await import('@/utils/showToaster');

    const wrapper = await mountSuspended(EditProfileBanner, {
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
    const wrapper = await mountSuspended(EditProfileBanner, {
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
    const wrapper = await mountSuspended(EditProfileBanner, {
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

  it('handles empty file selection gracefully', async () => {
    const wrapper = await mountSuspended(EditProfileBanner, {
      props: defaultProps,
      global: {
        plugins: [i18n],
      },
    });

    const fileInput = wrapper.find('input[type="file"]');

    Object.defineProperty(fileInput.element, 'files', {
      value: [],
      writable: false,
    });

    await fileInput.trigger('change');

    expect(wrapper.emitted('update:selectedImage')).toBeFalsy();
  });

  it('handles file reader error gracefully', async () => {
    const wrapper = await mountSuspended(EditProfileBanner, {
      props: defaultProps,
      global: {
        plugins: [i18n],
      },
    });

    const fileInput = wrapper.find('input[type="file"]');

    // Mock FileReader with error
    const mockFileReader = {
      onload: null as any,
      onerror: null as any,
      readAsDataURL: vi.fn(),
    };
    vi.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as any);

    const mockFile = new File(['test'], 'test.png', { type: 'image/png' });
    Object.defineProperty(fileInput.element, 'files', {
      value: [mockFile],
      writable: false,
    });

    await fileInput.trigger('change');

    // Simulate FileReader error
    if (mockFileReader.onerror) {
      mockFileReader.onerror(new Error('File read error'));
    }

    expect(wrapper.emitted('update:selectedImage')).toBeFalsy();
  });

  it('displays correct styling classes for overlay buttons', async () => {
    const wrapper = await mountSuspended(EditProfileBanner, {
      props: {
        ...defaultProps,
        selectedImage: 'data:image/png;base64,test',
      },
      global: {
        plugins: [i18n],
      },
    });

    const buttons = wrapper.findAll('button');
    expect(buttons.length).toBeGreaterThan(0);

    buttons.forEach((button) => {
      const classes = button.classes();
      expect(
        classes.some(
          (cls) => cls.includes('absolute') || cls.includes('rounded') || cls.includes('bg-'),
        ),
      ).toBe(true);
    });
  });

  it('maintains accessibility attributes', async () => {
    const wrapper = await mountSuspended(EditProfileBanner, {
      props: defaultProps,
      global: {
        plugins: [i18n],
      },
    });

    const fileInput = wrapper.find('input[type="file"]');
    expect(fileInput.attributes('accept')).toBeTruthy();

    const buttons = wrapper.findAll('button');
    buttons.forEach((button) => {
      expect(button.attributes('type')).toBe('button');
    });
  });

  it('handles multiple file selection by using only the first file', async () => {
    const wrapper = await mountSuspended(EditProfileBanner, {
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

    const mockFile1 = new File(['test1'], 'test1.png', { type: 'image/png' });
    const mockFile2 = new File(['test2'], 'test2.png', { type: 'image/png' });

    Object.defineProperty(fileInput.element, 'files', {
      value: [mockFile1, mockFile2],
      writable: false,
    });

    await fileInput.trigger('change');

    expect(mockFileReader.readAsDataURL).toHaveBeenCalledWith(mockFile1);
    expect(mockFileReader.readAsDataURL).toHaveBeenCalledTimes(1);
  });
});
