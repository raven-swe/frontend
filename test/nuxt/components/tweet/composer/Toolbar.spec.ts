import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import TweetToolbar from '~/components/tweet/composer/Toolbar.vue';

describe('TweetToolbar', () => {
  const mockProps = {
    disabled: false,
    characterCount: 0,
    maxLength: 280,
    isOverLimit: false,
    hasMedia: false,
    canAddMedia: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with default props', async () => {
    const wrapper = await mountSuspended(TweetToolbar);

    expect(wrapper.find('.toolbar').exists()).toBe(true);
  });

  it('emits post event when post button is clicked', async () => {
    const wrapper = await mountSuspended(TweetToolbar, {
      props: mockProps,
    });

    const postButton = wrapper.find('.post-button');
    await postButton.trigger('click');

    expect(wrapper.emitted('post')).toBeTruthy();
    expect(wrapper.emitted('post')).toHaveLength(1);
  });

  it('disables post button when disabled prop is true', async () => {
    const wrapper = await mountSuspended(TweetToolbar, {
      props: { ...mockProps, disabled: true },
    });

    const postButton = wrapper.find('.post-button');
    expect(postButton.attributes('disabled')).toBeDefined();
  });

  it('disables post button when over character limit', async () => {
    const wrapper = await mountSuspended(TweetToolbar, {
      props: { ...mockProps, isOverLimit: true },
    });

    const postButton = wrapper.find('.post-button');
    expect(postButton.attributes('disabled')).toBeDefined();
  });

  it('shows character counter when close to limit', async () => {
    const wrapper = await mountSuspended(TweetToolbar, {
      props: { ...mockProps, characterCount: 240 },
    });

    const counterElement = wrapper.find('.text-sm.font-medium');
    expect(counterElement.exists()).toBe(true);
    expect(counterElement.text()).toBe('40');
  });

  it('shows progress circle when character count > 0', async () => {
    const wrapper = await mountSuspended(TweetToolbar, {
      props: { ...mockProps, characterCount: 100 },
    });

    const progressCircle = wrapper.find('svg circle:last-child');
    expect(progressCircle.exists()).toBe(true);
  });

  it('applies correct color when over limit', async () => {
    const wrapper = await mountSuspended(TweetToolbar, {
      props: { ...mockProps, characterCount: 300, isOverLimit: true },
    });

    const counterElement = wrapper.find('.text-destructive');
    expect(counterElement.exists()).toBe(true);
  });

  it('triggers file input when media button is clicked', async () => {
    const wrapper = await mountSuspended(TweetToolbar, {
      props: mockProps,
    });

    const fileInput = wrapper.find('input[type="file"]');
    const clickSpy = vi.spyOn(fileInput.element, 'click');

    const mediaButton = wrapper.find('.media-btn');
    await mediaButton.trigger('click');

    expect(clickSpy).toHaveBeenCalled();
  });

  it('disables media button when canAddMedia is false', async () => {
    const wrapper = await mountSuspended(TweetToolbar, {
      props: { ...mockProps, canAddMedia: false },
    });

    const mediaButton = wrapper.find('.media-btn');
    expect(mediaButton.attributes('disabled')).toBeDefined();
  });

  it('emits add-media event when files are selected', async () => {
    const wrapper = await mountSuspended(TweetToolbar, {
      props: mockProps,
    });

    const fileInput = wrapper.find('input[type="file"]');
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    Object.defineProperty(fileInput.element, 'files', {
      value: [mockFile],
      writable: false,
    });

    await fileInput.trigger('change');

    expect(wrapper.emitted('add-media')).toBeTruthy();
    expect(wrapper.emitted('add-media')?.[0]?.[0]).toEqual([mockFile]);
  });

  it('resets file input after file selection', async () => {
    const wrapper = await mountSuspended(TweetToolbar, {
      props: mockProps,
    });

    const fileInput = wrapper.find('input[type="file"]');
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    Object.defineProperty(fileInput.element, 'files', {
      value: [mockFile],
      writable: false,
    });

    await fileInput.trigger('change');

    expect((fileInput.element as HTMLInputElement).value).toBe('');
  });

  it('calculates progress correctly', async () => {
    const wrapper = await mountSuspended(TweetToolbar, {
      props: { ...mockProps, characterCount: 140 },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const component = wrapper.vm as any;
    expect(component.progress).toBe(0.5);
  });

  it('shows separator when counter is visible', async () => {
    const wrapper = await mountSuspended(TweetToolbar, {
      props: { ...mockProps, characterCount: 240 },
    });

    const separator = wrapper.find('.separator');
    expect(separator.exists()).toBe(true);
  });
});
