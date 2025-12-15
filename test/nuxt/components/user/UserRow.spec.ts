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

const userStoreMock = vi.hoisted(() => {
  return {
    user: {
      username: 'janedoe',
    },
  };
});

mockNuxtImport('useUserStore', () => {
  return () => userStoreMock;
});

mockNuxtImport('useRouter', () => {
  return () => routerMock;
});

const useProfileMutationMock = vi.hoisted(() => ({
  followMutation: {
    mutate: vi.fn(),
  },
  muteMutation: {
    mutate: vi.fn(),
  },
  blockMutation: {
    mutate: vi.fn(),
  },
}));

vi.mock('~/composables/useProfileMutation', () => {
  return {
    useFollowMutation: () => useProfileMutationMock.followMutation,
    useMuteMutation: () => useProfileMutationMock.muteMutation,
    useBlockMutation: () => useProfileMutationMock.blockMutation,
  };
});

describe('UserRow.vue', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    userStoreMock.user = {
      username: 'janedoe',
    };
  });

  it('renders user information correctly', async () => {
    const wrapper = await createWrapper();
    expect(wrapper.text()).toContain(mockCompactUser.username);
    expect(wrapper.text()).toContain(mockCompactUser.displayName);
    expect(wrapper.text()).toContain(mockCompactUser.bio);
  });

  it('renders follow button by default and follow user on click', async () => {
    const wrapper = await createWrapper();
    const button = wrapper.find('button');
    expect(button.text()).toContain('Follow');
    await button.trigger('click');
    expect(useProfileMutationMock.followMutation.mutate).toHaveBeenCalledWith({
      username: mockCompactUser.username,
      action: 'follow',
    });
  });

  it('renders unfollow button when user is followed and unfollow user on click', async () => {
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
    expect(useProfileMutationMock.followMutation.mutate).toHaveBeenCalledWith({
      username: mockCompactUser.username,
      action: 'unfollow',
    });
  });

  it('renders mute button when user is not muted and mute user on click', async () => {
    const wrapper = await createWrapper({
      props: {
        primaryAction: 'mute',
      },
    });
    const button = wrapper.find('button[data-test="mute-button"]');
    await button.trigger('click');
    expect(useProfileMutationMock.muteMutation.mutate).toHaveBeenCalledWith({
      username: mockCompactUser.username,
      action: 'mute',
    });
  });

  it('renders unmute button when user is muted and unmute user on click', async () => {
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
    expect(useProfileMutationMock.muteMutation.mutate).toHaveBeenCalledWith({
      username: mockCompactUser.username,
      action: 'unmute',
    });
  });

  it('renders block button when user is not blocked and block user on click', async () => {
    const wrapper = await createWrapper({
      props: {
        primaryAction: 'block',
      },
    });
    const button = wrapper.find('button');
    expect(button.text()).toContain('Block');
    await button.trigger('click');
    expect(useProfileMutationMock.blockMutation.mutate).toHaveBeenCalledWith({
      username: mockCompactUser.username,
      action: 'block',
    });
  });

  it('renders unblock button when user is blocked and unblock user on click', async () => {
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
    expect(useProfileMutationMock.blockMutation.mutate).toHaveBeenCalledWith({
      username: mockCompactUser.username,
      action: 'unblock',
    });
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

  it('navigates to user profile on click', async () => {
    const wrapper = await createWrapper();
    await wrapper.trigger('click');
    expect(routerMock.push).toHaveBeenCalledWith(`/profile/${mockCompactUser.username}`);
  });

  it('does not render any actions when the user is the current user', async () => {
    userStoreMock.user.username = 'johndoe';

    const wrapper = await createWrapper();
    const button = wrapper.find('button');
    expect(button.exists()).toBe(false);
  });

  it('calls UiContent with empty string bio when bio is null', async () => {
    const mockUser = structuredClone(mockCompactUser);
    mockUser.bio = null;
    const wrapper = await createWrapper({
      props: {
        user: mockUser,
      },
      options: {
        global: {
          stubs: {
            UiContentEntitiesRenderer: {
              template: '<div class="content-entities-renderer">{{ content }}</div>',
              props: ['content'],
            },
          },
        },
      },
    });
    const contentRenderer = wrapper.find('.content-entities-renderer');
    expect(contentRenderer.text()).toBe('');
  });

  it('does not render any action button if primaryAction is not set', async () => {
    const wrapper = await createWrapper({
      props: {
        primaryAction: null as unknown as 'follow',
      },
    });
    const button = wrapper.find('button:not([data-test="dropdown-trigger"])');
    expect(button.exists()).toBe(false);
  });
});
