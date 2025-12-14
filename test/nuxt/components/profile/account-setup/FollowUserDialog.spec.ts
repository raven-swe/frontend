import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import FollowUserDialog from '~/components/profile/account-setup/FollowUserDialog.vue';
import en from '~~/i18n/locales/en.json';
import { createI18n } from 'vue-i18n';
import { flushPromises } from '@vue/test-utils';
import { nextTick } from 'vue';
import type { CompactUser } from '~~/shared/types/user';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';

const i18n = createI18n({
  locale: 'en',
  messages: { en },
});

const data: CompactUser[] = [
  {
    username: 'user1',
    displayName: 'User One',
    bio: '',
    bioEntities: null,
    avatarUrl: '',
    relationship: {
      follower: false,
      following: false,
      muted: false,
      blockedBy: false,
      blocking: false,
    },
  },
  {
    username: 'user2',
    displayName: 'User Two',
    bio: '',
    bioEntities: null,
    avatarUrl: '',
    relationship: {
      follower: false,
      following: false,
      muted: false,
      blockedBy: false,
      blocking: false,
    },
  },
  {
    username: 'user3',
    displayName: 'User Three',
    bio: '',
    bioEntities: null,
    avatarUrl: '',
    relationship: {
      follower: false,
      following: false,
      muted: false,
      blockedBy: false,
      blocking: false,
    },
  },
];

const settingServiceMock = vi.hoisted(() => ({
  getFollowSuggestions: vi.fn(() => ({ data })),
}));

const useVirtualizerMock = vi.hoisted(() =>
  vi.fn(() => ({
    value: {
      getVirtualItems: vi.fn(() => [
        { index: 0, key: 0, start: 0, end: 96 },
        { index: 1, key: 1, start: 96, end: 192 },
        { index: 2, key: 2, start: 192, end: 288 },
      ]),
      getTotalSize: () => 288,
      measureElement: vi.fn(),
      scrollToIndex: vi.fn(),
    },
  })),
);

const followMutateMock = vi.hoisted(() => vi.fn());
const blockMutateMock = vi.hoisted(() => vi.fn());
const muteMutateMock = vi.hoisted(() => vi.fn());

vi.mock('~/composables/useProfileMutation', () => ({
  useFollowMutation: () => ({ mutate: followMutateMock }),
  useBlockMutation: () => ({ mutate: blockMutateMock }),
  useMuteMutation: () => ({ mutate: muteMutateMock }),
}));

vi.mock('~/services/settingsService', () => ({
  settingsService: settingServiceMock,
}));

vi.mock('@tanstack/vue-virtual', async () => {
  return {
    useVirtualizer: useVirtualizerMock,
  };
});

describe('FollowUserDialog', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.clearAllMocks();
  });

  it('renders correctly', async () => {
    const wrapper = await mountSuspended(FollowUserDialog, {
      props: { open: true },
      global: {
        plugins: [i18n],
        stubs: {
          UiDialogContent: {
            template: "<div><slot /> <slot name='header' /></div>",
          },
          LogoRaven: {
            template: '<div data-test="logo-raven">LogoRaven</div>',
          },
        },
      },
    });
    await flushPromises();
    await nextTick();

    expect(wrapper.text()).toContain("Don't miss out");
    expect(wrapper.text()).toContain(
      "When you follow someone, you'll see their posts in your Timeline. you'll also get more relevant recommendations.",
    );
    expect(wrapper.find('[data-test="logo-raven"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('User One');
    expect(wrapper.text()).toContain('User Two');
    expect(wrapper.text()).toContain('User Three');
  });

  it('calls mutations on UserRow events', async () => {
    const wrapper = await mountSuspended(FollowUserDialog, {
      props: { open: true },
      global: {
        plugins: [i18n],
        stubs: {
          UiDialogContent: {
            template: "<div><slot /> <slot name='header' /></div>",
          },
          LogoRaven: {
            template: '<div data-test="logo-raven">LogoRaven</div>',
          },
        },
      },
    });

    // pick one rendered row and trigger events
    const firstRow = wrapper.findComponent({ name: 'UserRow' });

    await firstRow.vm.$emit('follow');
    expect(followMutateMock).toHaveBeenCalledWith({
      username: 'user1',
      action: 'follow',
    });

    await firstRow.vm.$emit('unfollow');
    expect(followMutateMock).toHaveBeenCalledWith({
      username: 'user1',
      action: 'unfollow',
    });

    await firstRow.vm.$emit('block');
    expect(blockMutateMock).toHaveBeenCalledWith({
      username: 'user1',
      action: 'block',
    });

    await firstRow.vm.$emit('unblock');
    expect(blockMutateMock).toHaveBeenCalledWith({
      username: 'user1',
      action: 'unblock',
    });

    await firstRow.vm.$emit('mute');
    expect(muteMutateMock).toHaveBeenCalledWith({
      username: 'user1',
      action: 'mute',
    });

    await firstRow.vm.$emit('unmute');
    expect(muteMutateMock).toHaveBeenCalledWith({
      username: 'user1',
      action: 'unmute',
    });
  });

  it('enable submit button after following at least one user', async () => {
    settingServiceMock.getFollowSuggestions.mockImplementation(() => {
      return {
        data: [
          ...data,
          {
            username: 'user4',
            displayName: 'User Four',
            bio: '',
            bioEntities: null,
            avatarUrl: '',
            relationship: {
              follower: false,
              following: true,
              muted: false,
              blockedBy: false,
              blocking: false,
            },
          },
        ],
      };
    });

    const wrapper = await mountSuspended(FollowUserDialog, {
      props: { open: true },
      global: {
        plugins: [i18n, [VueQueryPlugin, { queryClient: new QueryClient() }]],
        stubs: {
          UiDialogContent: {
            template: "<div><slot /> <slot name='header' /></div>",
          },
          LogoRaven: {
            template: '<div data-test="logo-raven">LogoRaven</div>',
          },
        },
      },
    });

    const submitButton = wrapper.find('button[data-test="submit-follow-users"]');
    expect(submitButton.attributes('disabled')).toBeUndefined();
  });
});
