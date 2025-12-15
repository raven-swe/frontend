import { describe, it, expect, vi } from 'vitest';
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import FollowersYouFollowPage from '~/pages/profile/[username]/followers-you-follow.vue';
import { createI18n } from 'vue-i18n';
import messages from '@@/i18n/locales/en.json';
import UserList from '~/components/user/UserList.vue';

const i18n = createI18n({ locale: 'en', messages: { en: messages } });

const profileTabsServiceMock = vi.hoisted(() => ({
  getMutualFollowersPaginated: vi.fn(() => {
    return [];
  }),
}));

vi.mock('~/services/profile/profileTabsService', () => ({
  profileTabsService: profileTabsServiceMock,
}));

const usernameParam = vi.hoisted(() => ({
  username: 'testuser' as string | null,
}));

mockNuxtImport('useRouter', () => {
  return () => ({
    currentRoute: {
      value: {
        params: usernameParam,
      },
    },
    replace: vi.fn(),
  });
});

describe('followers-you-follow page', () => {
  it('renders followers you follow page content', async () => {
    const wrapper = await mountSuspended(FollowersYouFollowPage, {
      global: {
        plugins: [i18n],
      },
    });
    const userList = wrapper.findComponent(UserList);
    expect(userList.exists()).toBe(true);
    expect(profileTabsServiceMock.getMutualFollowersPaginated).toHaveBeenCalledWith(
      expect.objectContaining({ username: 'testuser' }),
    );
  });

  it('username null if params not string', async () => {
    usernameParam.username = null;
    const wrapper = await mountSuspended(FollowersYouFollowPage, {
      global: {
        plugins: [i18n],
      },
    });

    expect((wrapper.vm as unknown as { username: string | null }).username).toBeNull();
  });
});
