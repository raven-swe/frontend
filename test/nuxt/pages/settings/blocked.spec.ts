import { mountSuspended } from '@nuxt/test-utils/runtime';
import { describe, it, expect, vi } from 'vitest';
import BlockedPage from '~/pages/settings/blocked.vue';
import UserList from '~/components/common/UserList.vue';
import { createI18n } from 'vue-i18n';
import en from '~~/i18n/locales/en.json';

const i18n = createI18n({
  locale: 'en',
  messages: {
    en,
  },
});

// Mock the settings service
const settingsService = vi.hoisted(() => ({
  getBlockedPaginated: vi.fn().mockResolvedValue({
    data: [],
    cursor: null,
  }),
}));

vi.mock('~/services/settingsService', () => ({
  settingsService,
}));

const routerMock = vi.hoisted(() => ({
  push: vi.fn(),
  back: vi.fn(),
  replace: vi.fn(),
}));

const createWrapper = async () => {
  return await mountSuspended(BlockedPage, {
    global: {
      mocks: {
        $router: routerMock,
      },
      plugins: [i18n],
    },
  });
};

describe('pages/settings/blocked.vue', () => {
  it('render header and description', async () => {
    const wrapper = await createWrapper();
    expect(wrapper.text()).toContain('Blocked accounts');
    expect(wrapper.text()).toContain(
      "When you block someone, that person won't be able to follow or message you, and you won't see notifications from them.",
    );
  });

  it('back button works', async () => {
    const wrapper = await createWrapper();
    const backButton = wrapper.find('header button');
    await backButton.trigger('click');
    expect(routerMock.back).toHaveBeenCalled();
  });

  it('passes correct fetcher function to UserList', async () => {
    const wrapper = await createWrapper();
    const userList = wrapper.findComponent(UserList);

    const fetcherFn = userList.props('fetcherFn');

    const mockCursor = 'test-cursor';
    const mockSignal = new AbortController().signal;
    await fetcherFn(mockCursor, mockSignal);

    expect(settingsService.getBlockedPaginated).toHaveBeenCalledWith({
      cursor: mockCursor,
      signal: mockSignal,
    });
  });

  it('passes correct props to UserList', async () => {
    const wrapper = await createWrapper();
    const userList = wrapper.findComponent(UserList);

    expect(userList.props()).toMatchObject({
      currentUsername: null,
      showDropdown: false,
      primaryAction: 'block',
      queryKeySuffix: 'blocked',
      emptyTitle: expect.any(String),
      emptyDescription: expect.any(String),
    });
  });
});
