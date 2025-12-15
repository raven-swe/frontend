import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import TweetLikesPage from '~/pages/profile/[username]/status/[tweetid]/likes.vue';
import { createI18n } from 'vue-i18n';
import messages from '@@/i18n/locales/en.json';
import UserList from '~/components/user/UserList.vue';

const i18n = createI18n({ locale: 'en', messages: { en: messages } });

const tweetsServiceMock = vi.hoisted(() => ({
  likes: vi.fn(() => {
    return [];
  }),
}));

vi.mock('~/services/tweet/tweetsService', () => ({
  tweetsService: tweetsServiceMock,
}));

const usernameParam = vi.hoisted(() => ({
  username: 'testuser' as string | null,
  tweetid: '12345' as string | null,
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

describe('tweet likes page', () => {
  beforeEach(() => {
    usernameParam.username = 'testuser';
    usernameParam.tweetid = '12345';
  });

  it('renders tweet likes page content', async () => {
    const wrapper = await mountSuspended(TweetLikesPage, {
      global: {
        plugins: [i18n],
      },
    });
    const userList = wrapper.findComponent(UserList);
    expect(userList.exists()).toBe(true);
    expect(tweetsServiceMock.likes).toHaveBeenCalledWith(
      expect.objectContaining({ tweetid: '12345' }),
    );
  });

  it('username null if params not found', async () => {
    usernameParam.username = null;
    usernameParam.tweetid = null;
    const wrapper = await mountSuspended(TweetLikesPage, {
      global: {
        plugins: [i18n],
      },
    });

    expect((wrapper.vm as unknown as { username: string | null }).username).toBeNull();
    expect((wrapper.vm as unknown as { tweetid: string | null }).tweetid).toBeNull();
  });

  it('calls UserList with correect query key suffix array', async () => {
    const wrapper = await mountSuspended(TweetLikesPage, {
      global: {
        plugins: [i18n],
      },
    });
    const userList = wrapper.findComponent(UserList);
    expect(userList.exists()).toBe(true);
    expect(userList.props('queryKeySuffixArray')).toEqual(['tweet', '12345']);
  });

  it('calls UserList with null tweetid query key suffix array when tweetid is null', async () => {
    usernameParam.tweetid = null;
    const wrapper = await mountSuspended(TweetLikesPage, {
      global: {
        plugins: [i18n],
      },
    });
    const userList = wrapper.findComponent(UserList);
    expect(userList.exists()).toBe(true);
    expect(userList.props('queryKeySuffixArray')).toEqual(['tweet', '']);
  });
});
