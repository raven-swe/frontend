import { it, expect, describe, beforeEach, vi } from 'vitest';
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import type { ComponentMountingOptions } from '@vue/test-utils';
import UserRow from '@/components/user/UserRow.vue';
import type { CompactUser } from '#shared/types/user';
import messages from '@@/i18n/locales/en.json';
import { createI18n } from 'vue-i18n';

const mockCompactUser: CompactUser = {
  username: 'johndoe',
  displayName: 'John Doe',
  bio: 'Just a test user',
  bioEntities: null,
  avatarUrl: 'https://example.com/avatar.jpg',
  relationship: {
    following: false,
    follower: false,
    muted: false,
    blocking: false,
    blockedBy: false,
  },
};

const i18n = createI18n({ locale: 'en', messages: { en: messages } });

const createWrapper = ({
  props,
  options,
}:
  | {
      props?: Partial<ComponentMountingOptions<typeof UserRow>['props']>;
      options?: Partial<ComponentMountingOptions<typeof UserRow>>;
    }
  | undefined = {}) => {
  return mountSuspended(UserRow, {
    props: { user: mockCompactUser, showDropdown: true, ...props },
    global: {
      plugins: [i18n],
    },
    ...options,
  });
};

const routerMock = vi.hoisted(() => {
  return {
    push: vi.fn(),
    replace: vi.fn(),
  };
});

mockNuxtImport('useRouter', () => {
  return () => routerMock;
});

describe('UserRow.vue', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('renders user information correctly', async () => {
    const wrapper = await createWrapper();
    expect(wrapper.text()).toContain(mockCompactUser.username);
    expect(wrapper.text()).toContain(mockCompactUser.displayName);
    expect(wrapper.text()).toContain(mockCompactUser.bio);
  });

  it('renders follow button by default and emit follow on click', async () => {
    const wrapper = await createWrapper();
    const button = wrapper.find('button');
    expect(button.text()).toContain('Follow');
    await button.trigger('click');
    expect(wrapper.emitted('follow')).toBeTruthy();
    expect(wrapper.emitted('follow')![0]).toEqual([mockCompactUser.username]);
  });

  it('renders unfollow button when user is followed and emit unfollow on click', async () => {
    const mockUser = structuredClone(mockCompactUser);
    mockUser.relationship.following = true;

    const wrapper = await createWrapper({
      props: {
        user: mockUser,
      },
    });
    const button = wrapper.find('button');
    expect(button.text()).toContain('Unfollow');
    await button.trigger('click');
    expect(wrapper.emitted('unfollow')).toBeTruthy();
    expect(wrapper.emitted('unfollow')![0]).toEqual([mockCompactUser.username]);
  });

  it('renders mute button when user is not muted and emit mute on click', async () => {
    const wrapper = await createWrapper({
      props: {
        primaryAction: 'mute',
      },
    });
    const button = wrapper.find('button[data-test="mute-button"]');
    await button.trigger('click');
    expect(wrapper.emitted('mute')).toBeTruthy();
    expect(wrapper.emitted('mute')![0]).toEqual([mockCompactUser.username]);
  });

  it('renders unmute button when user is muted and emit unmute on click', async () => {
    const mockUser = structuredClone(mockCompactUser);
    mockUser.relationship.muted = true;
    const wrapper = await createWrapper({
      props: {
        user: mockUser,
        primaryAction: 'mute',
      },
    });
    const button = wrapper.find('button[data-test="unmute-button"]');
    await button.trigger('click');
    expect(wrapper.emitted('unmute')).toBeTruthy();
    expect(wrapper.emitted('unmute')![0]).toEqual([mockCompactUser.username]);
  });

  it('renders block button when user is not blocked and emit block on click', async () => {
    const wrapper = await createWrapper({
      props: {
        primaryAction: 'block',
      },
    });
    const button = wrapper.find('button');
    expect(button.text()).toContain('Block');
    await button.trigger('click');
    expect(wrapper.emitted('block')).toBeTruthy();
    expect(wrapper.emitted('block')![0]).toEqual([mockCompactUser.username]);
  });

  it('renders unblock button when user is blocked and emit unblock on click', async () => {
    const mockUser = structuredClone(mockCompactUser);
    mockUser.relationship.blocking = true;
    const wrapper = await createWrapper({
      props: {
        user: mockUser,
        primaryAction: 'block',
      },
    });
    const button = wrapper.find('button');
    expect(button.text()).toContain('Unblock');
    await button.trigger('click');
    expect(wrapper.emitted('unblock')).toBeTruthy();
    expect(wrapper.emitted('unblock')![0]).toEqual([mockCompactUser.username]);
  });

  it('renders dropdown menu when showDropdown is true', async () => {
    const wrapper = await createWrapper();
    const button = wrapper.find('button[data-test="dropdown-trigger"]');
    expect(button.exists()).toBe(true);
  });

  it('does not render dropdown menu when showDropdown is false', async () => {
    const wrapper = await createWrapper({ props: { showDropdown: false } });
    const button = wrapper.find('button[data-test="dropdown-trigger"]');
    expect(button.exists()).toBe(false);
  });

  it('renders follows you badge when user is a follower', async () => {
    const mockUser = structuredClone(mockCompactUser);
    mockUser.relationship.follower = true;
    const wrapper = await createWrapper({
      props: {
        user: mockUser,
      },
    });
    expect(wrapper.text()).toContain('Follows you');
  });

  it('emit event from UserHoverCard component', async () => {
    const UserHoverCardStub = {
      template: `<div class="hover-card-stub"><slot /></div>`,
      props: ['username'],
      emits: ['follow', 'unfollow', 'unblock'],
    };
    const wrapper = await createWrapper({
      props: { showDropdown: false },
      options: {
        global: {
          stubs: {
            UserHoverCard: UserHoverCardStub,
          },
        },
      },
    });

    const hoverCard = wrapper.findComponent(UserHoverCardStub);
    await hoverCard.vm.$emit('follow');
    expect(wrapper.emitted('follow')).toBeTruthy();
    expect(wrapper.emitted('follow')![0]).toEqual([mockCompactUser.username]);

    await hoverCard.vm.$emit('unfollow');
    expect(wrapper.emitted('unfollow')).toBeTruthy();
    expect(wrapper.emitted('unfollow')![0]).toEqual([mockCompactUser.username]);

    await hoverCard.vm.$emit('unblock');
    expect(wrapper.emitted('unblock')).toBeTruthy();
    expect(wrapper.emitted('unblock')![0]).toEqual([mockCompactUser.username]);
  });

  it('emit event from UserActionDropdown component', async () => {
    const UserActionDropdownStub = {
      template: `<div class="action-dropdown-stub"><slot /></div>`,
      emits: ['mute', 'unmute', 'block', 'unblock'],
    };
    const wrapper = await createWrapper({
      options: {
        global: {
          stubs: {
            UserActionDropdown: UserActionDropdownStub,
          },
        },
      },
    });

    const actionDropdown = wrapper.findComponent(UserActionDropdownStub);
    await actionDropdown.vm.$emit('mute');
    expect(wrapper.emitted('mute')).toBeTruthy();
    expect(wrapper.emitted('mute')![0]).toEqual([mockCompactUser.username]);

    await actionDropdown.vm.$emit('unmute');
    expect(wrapper.emitted('unmute')).toBeTruthy();
    expect(wrapper.emitted('unmute')![0]).toEqual([mockCompactUser.username]);

    await actionDropdown.vm.$emit('block');
    expect(wrapper.emitted('block')).toBeTruthy();
    expect(wrapper.emitted('block')![0]).toEqual([mockCompactUser.username]);

    await actionDropdown.vm.$emit('unblock');
    expect(wrapper.emitted('unblock')).toBeTruthy();
    expect(wrapper.emitted('unblock')![0]).toEqual([mockCompactUser.username]);
  });

  it('navigates to user profile on click', async () => {
    const wrapper = await createWrapper();
    await wrapper.trigger('click');
    expect(routerMock.push).toHaveBeenCalledWith(`/profile/${mockCompactUser.username}`);
  });
});
