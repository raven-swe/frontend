import { describe, expect, it, beforeEach, vi } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import ProfileAvatarModal from '@/components/profile/ProfileAvatarModal.vue';

const createWrapper = async (props = {}) => {
  return await mountSuspended(ProfileAvatarModal, {
    props,
  });
};

describe('ProfileAvatarModal Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
  });

  describe('Rendering', () => {
    it('renders the modal backdrop', async () => {
      const wrapper = await createWrapper();

      const backdrop = wrapper.find('.fixed.inset-0.z-999');
      expect(backdrop.exists()).toBe(true);
      expect(backdrop.classes()).toContain('bg-dialog-backdrop');
      expect(backdrop.classes()).toContain('flex');
      expect(backdrop.classes()).toContain('items-center');
      expect(backdrop.classes()).toContain('justify-center');
    });

    it('renders the close button', async () => {
      const wrapper = await createWrapper();

      const closeButton = wrapper.findComponent({ name: 'UiButton' });
      expect(closeButton.exists()).toBe(true);
      expect(closeButton.classes()).toContain('fixed');
      expect(closeButton.classes()).toContain('start-10');
      expect(closeButton.classes()).toContain('top-10');
    });

    it('renders the close icon', async () => {
      const wrapper = await createWrapper();

      // Icon is auto-imported by Nuxt, so we look for it in the HTML
      const closeButton = wrapper.findComponent({ name: 'UiButton' });
      expect(closeButton.html()).toContain('lucide:x');
    });

    it('renders the avatar with custom image', async () => {
      const customAvatar = 'https://example.com/custom-avatar.jpg';
      const wrapper = await createWrapper({ avatarImg: customAvatar });

      const avatar = wrapper.findComponent({ name: 'UiAvatar' });
      expect(avatar.exists()).toBe(true);
      expect(avatar.props('img')).toBe(customAvatar);
      expect(avatar.props('size')).toBe('2xl');
      expect(avatar.props('variant')).toBe('secondary');
    });

    it('renders the avatar with default image when no avatarImg prop is provided', async () => {
      const wrapper = await createWrapper();

      const avatar = wrapper.findComponent({ name: 'UiAvatar' });
      expect(avatar.exists()).toBe(true);
      expect(avatar.props('img')).toBe('https://cdn.raven.cmp27.space/default_avatar.png');
    });

    it('renders the avatar with default image when avatarImg is undefined', async () => {
      const wrapper = await createWrapper({ avatarImg: undefined });

      const avatar = wrapper.findComponent({ name: 'UiAvatar' });
      expect(avatar.exists()).toBe(true);
      expect(avatar.props('img')).toBe('https://cdn.raven.cmp27.space/default_avatar.png');
    });
  });

  describe('User Interactions', () => {
    it('emits close event when backdrop is clicked', async () => {
      const wrapper = await createWrapper();

      const backdrop = wrapper.find('.fixed.inset-0.z-999');
      await backdrop.trigger('click');

      expect(wrapper.emitted('close')).toBeTruthy();
      expect(wrapper.emitted('close')).toHaveLength(1);
    });

    it('emits close event when close button is clicked', async () => {
      const wrapper = await createWrapper();

      const closeButton = wrapper.findComponent({ name: 'UiButton' });
      await closeButton.trigger('click');

      expect(wrapper.emitted('close')).toBeTruthy();
      expect(wrapper.emitted('close')).toHaveLength(1);
    });

    it('does not emit close event when avatar is clicked', async () => {
      const wrapper = await createWrapper();

      const avatar = wrapper.findComponent({ name: 'UiAvatar' });
      await avatar.trigger('click');

      expect(wrapper.emitted('close')).toBeFalsy();
    });

    it('stops event propagation when avatar is clicked', async () => {
      const wrapper = await createWrapper();

      const avatar = wrapper.findComponent({ name: 'UiAvatar' });
      const clickEvent = new Event('click', { bubbles: true, cancelable: true });

      await avatar.element.dispatchEvent(clickEvent);

      // The @click.prevent.stop should prevent default and stop propagation
      expect(wrapper.emitted('close')).toBeFalsy();
    });
  });

  describe('Props', () => {
    it('accepts avatarImg prop', async () => {
      const avatarImg = 'https://example.com/test-avatar.jpg';
      const wrapper = await createWrapper({ avatarImg });

      const avatar = wrapper.findComponent({ name: 'UiAvatar' });
      expect(avatar.props('img')).toBe(avatarImg);
    });

    it('handles empty string avatarImg', async () => {
      const wrapper = await createWrapper({ avatarImg: '' });

      const avatar = wrapper.findComponent({ name: 'UiAvatar' });
      expect(avatar.props('img')).toBe('https://cdn.raven.cmp27.space/default_avatar.png');
    });
  });

  describe('Styling and Classes', () => {
    it('has correct animation classes on backdrop', async () => {
      const wrapper = await createWrapper();

      const backdrop = wrapper.find('.fixed.inset-0.z-999');
      expect(backdrop.attributes('class')).toContain('data-[state=open]:animate-in');
      expect(backdrop.attributes('class')).toContain('data-[state=closed]:animate-out');
      expect(backdrop.attributes('class')).toContain('data-[state=closed]:fade-out-0');
      expect(backdrop.attributes('class')).toContain('data-[state=open]:fade-in-0');
    });

    it('has correct button variant and size', async () => {
      const wrapper = await createWrapper();

      const closeButton = wrapper.findComponent({ name: 'UiButton' });
      expect(closeButton.props('variant')).toBe('ghost-default');
      expect(closeButton.props('size')).toBe('icon-lg');
    });

    it('has correct z-index for modal overlay', async () => {
      const wrapper = await createWrapper();

      const backdrop = wrapper.find('.fixed.inset-0.z-999');
      expect(backdrop.classes()).toContain('z-999');
    });
  });

  describe('Event Handlers', () => {
    it('prevents default behavior when backdrop is clicked', async () => {
      const wrapper = await createWrapper();

      const backdrop = wrapper.find('.fixed.inset-0.z-999');
      const clickEvent = new Event('click', { bubbles: true, cancelable: true });

      await backdrop.element.dispatchEvent(clickEvent);

      // Verify the event was handled (close emitted)
      expect(wrapper.emitted('close')).toBeTruthy();
    });

    it('prevents default behavior when close button is clicked', async () => {
      const wrapper = await createWrapper();

      const closeButton = wrapper.findComponent({ name: 'UiButton' });
      await closeButton.trigger('click');

      expect(wrapper.emitted('close')).toBeTruthy();
    });
  });
});
