import { it, expect, describe, beforeEach, vi } from 'vitest';
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import type { ComponentMountingOptions } from '@vue/test-utils';
import UserCard from '@/components/search/UserCard.vue';
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
      props?: Partial<ComponentMountingOptions<typeof UserCard>['props']>;
      options?: Partial<ComponentMountingOptions<typeof UserCard>>;
    }
  | undefined = {}) => {
  return mountSuspended(UserCard, {
    props: { user: mockCompactUser, ...props },
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

describe('UserCard.vue', () => {
  beforeEach(() => {
    vi.resetModules();
    userStoreMock.user = {
      username: 'janedoe',
    };
    routerMock.push.mockClear();
    routerMock.replace.mockClear();
  });

  it('renders user information correctly', async () => {
    const wrapper = await createWrapper();
    expect(wrapper.text()).toContain(mockCompactUser.username);
    expect(wrapper.text()).toContain(mockCompactUser.displayName);
  });

  it('renders follows you ', async () => {
    const mockUser = structuredClone(mockCompactUser);
    mockUser.relationship.follower = true;
    mockUser.relationship.following = false;
    const wrapper = await createWrapper({
      props: {
        user: mockUser,
      },
    });
    expect(wrapper.text()).toContain('Follows you');
  });
  it('renders following ', async () => {
    const mockUser = structuredClone(mockCompactUser);
    mockUser.relationship.follower = false;
    mockUser.relationship.following = true;
    const wrapper = await createWrapper({
      props: {
        user: mockUser,
      },
    });
    expect(wrapper.text()).toContain('Following');
  });

  it('renders you follow each other ', async () => {
    const mockUser = structuredClone(mockCompactUser);
    mockUser.relationship.follower = true;
    mockUser.relationship.following = true;
    const wrapper = await createWrapper({
      props: {
        user: mockUser,
      },
    });
    expect(wrapper.text()).toContain('You follow each other');
  });

  it('does not render any thing from relations', async () => {
    const mockUser = structuredClone(mockCompactUser);
    mockUser.relationship.follower = false;
    mockUser.relationship.following = false;
    const wrapper = await createWrapper({
      props: {
        user: mockUser,
      },
    });
    expect(wrapper.text()).toEqual('John Doe@johndoe');
  });
});
