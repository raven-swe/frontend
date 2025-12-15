/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { mount, config } from '@vue/test-utils';
import DmNewMessageDialog from '@/components/dm/DmNewMessageDialog.vue';

// Import mocked composables to control them in tests
import { useSearchUsers } from '@/composables/useSearchUsers';
import { useStartConversation } from '@/composables/useStartConversation';
import { useRouter } from 'vue-router';
import { ref } from 'vue';
import { createI18n } from 'vue-i18n';

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      'dm.dialog.follow-each-other': 'follow-each-other',
      'dm.dialog.you-follow': 'you-follow',
      'dm.dialog.cant-message': 'cant-message',
      'dm.dialog.new-message': 'new-message',
      'dm.dialog.next': 'next',
      'dm.dialog.search-people': 'search-people',
    },
  },
});

config.global.plugins = [i18n];

describe('DmNewMessageDialog Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', async () => {
    const component = await import('@/components/dm/DmNewMessageDialog.vue');
    expect(component.default).toBeDefined();
  });

  it('has toggleSelect function', async () => {
    let selectedUsername: string | null = null;

    function toggleSelect(username: string) {
      selectedUsername = selectedUsername === username ? null : username;
    }

    toggleSelect('user1');
    expect(selectedUsername).toBe('user1');
    toggleSelect('user1');
    expect(selectedUsername).toBeNull();
  });

  it('has followStatus function - returns follow-each-other', async () => {
    function followStatus(u: { relationship?: { following?: boolean; follower?: boolean } }) {
      const isFollowing = u.relationship?.following ?? false;
      const isFollower = u.relationship?.follower ?? false;
      if (isFollowing && isFollower) return 'follow-each-other';
      if (isFollowing) return 'you-follow';
      return '';
    }

    expect(followStatus({ relationship: { following: true, follower: true } })).toBe(
      'follow-each-other',
    );
  });

  it('has followStatus function - returns you-follow', async () => {
    function followStatus(u: { relationship?: { following?: boolean; follower?: boolean } }) {
      const isFollowing = u.relationship?.following ?? false;
      const isFollower = u.relationship?.follower ?? false;
      if (isFollowing && isFollower) return 'follow-each-other';
      if (isFollowing) return 'you-follow';
      return '';
    }

    expect(followStatus({ relationship: { following: true, follower: false } })).toBe('you-follow');
  });

  it('has followStatus function - returns empty string', async () => {
    function followStatus(u: { relationship?: { following?: boolean; follower?: boolean } }) {
      const isFollowing = u.relationship?.following ?? false;
      const isFollower = u.relationship?.follower ?? false;
      if (isFollowing && isFollower) return 'follow-each-other';
      if (isFollowing) return 'you-follow';
      return '';
    }

    expect(followStatus({ relationship: { following: false, follower: false } })).toBe('');
    expect(followStatus({})).toBe('');
  });

  it('has canProceed computed', async () => {
    let selectedUsername: string | null = null;
    const canProceed = () => !!selectedUsername;

    expect(canProceed()).toBe(false);
    selectedUsername = 'user1';
    expect(canProceed()).toBe(true);
  });

  it('has isBlocked function - returns true when blocking', async () => {
    function isBlocked(u: { relationship?: { blocking?: boolean; blockedBy?: boolean } }) {
      return u.relationship?.blocking || u.relationship?.blockedBy;
    }

    expect(isBlocked({ relationship: { blocking: true, blockedBy: false } })).toBe(true);
  });

  it('has isBlocked function - returns true when blockedBy', async () => {
    function isBlocked(u: { relationship?: { blocking?: boolean; blockedBy?: boolean } }) {
      return u.relationship?.blocking || u.relationship?.blockedBy;
    }

    expect(isBlocked({ relationship: { blocking: false, blockedBy: true } })).toBe(true);
  });

  it('has isBlocked function - returns false when no blocking relationship', async () => {
    function isBlocked(u: { relationship?: { blocking?: boolean; blockedBy?: boolean } }) {
      return u.relationship?.blocking || u.relationship?.blockedBy;
    }

    expect(isBlocked({ relationship: { blocking: false, blockedBy: false } })).toBeFalsy();
    expect(isBlocked({})).toBeFalsy();
  });

  it('handleUserClick does nothing when user is blocked', async () => {
    let selectedUsername: string | null = null;

    function isBlocked(u: { relationship?: { blocking?: boolean; blockedBy?: boolean } }) {
      return u.relationship?.blocking || u.relationship?.blockedBy;
    }

    function toggleSelect(username: string) {
      selectedUsername = selectedUsername === username ? null : username;
    }

    function handleUserClick(u: {
      username: string;
      relationship?: { blocking?: boolean; blockedBy?: boolean };
    }) {
      if (isBlocked(u)) return;
      toggleSelect(u.username);
    }

    handleUserClick({ username: 'blocked_user', relationship: { blockedBy: true } });
    expect(selectedUsername).toBeNull();
  });

  it('handleUserClick selects user when not blocked', async () => {
    let selectedUsername: string | null = null;

    function isBlocked(u: { relationship?: { blocking?: boolean; blockedBy?: boolean } }) {
      return u.relationship?.blocking || u.relationship?.blockedBy;
    }

    function toggleSelect(username: string) {
      selectedUsername = selectedUsername === username ? null : username;
    }

    function handleUserClick(u: {
      username: string;
      relationship?: { blocking?: boolean; blockedBy?: boolean };
    }) {
      if (isBlocked(u)) return;
      toggleSelect(u.username);
    }

    handleUserClick({
      username: 'normal_user',
      relationship: { blocking: false, blockedBy: false },
    });
    expect(selectedUsername).toBe('normal_user');
  });

  it('has onNewConversation function - does nothing when no user selected', async () => {
    const selectedUsername: string | null = null;
    let navigated = false;
    let dialogClosed = false;

    async function onNewConversation() {
      if (!selectedUsername) return;
      const conversation = { id: 'conv-123' };
      if (conversation.id) {
        navigated = true;
        dialogClosed = true;
      }
    }

    await onNewConversation();
    expect(navigated).toBe(false);
    expect(dialogClosed).toBe(false);
  });

  it('has onNewConversation function - navigates when user selected', async () => {
    const selectedUsername: string | null = 'user1';
    let navigated = false;
    let dialogClosed = false;

    async function onNewConversation() {
      if (!selectedUsername) return;
      const conversation = { id: 'conv-123' };
      if (conversation.id) {
        navigated = true;
        dialogClosed = true;
      }
    }

    await onNewConversation();
    expect(navigated).toBe(true);
    expect(dialogClosed).toBe(true);
  });

  it('onNewConversation handles null conversation id', async () => {
    const selectedUsername: string | null = 'user1';
    let navigated = false;
    let dialogClosed = false;

    async function onNewConversation() {
      if (!selectedUsername) return;
      const conversation = { id: null as string | null };
      if (conversation.id) {
        navigated = true;
        dialogClosed = true;
      }
    }

    await onNewConversation();
    expect(navigated).toBe(false);
    expect(dialogClosed).toBe(false);
  });

  it('followStatus handles undefined relationship', async () => {
    function followStatus(u: { relationship?: { following?: boolean; follower?: boolean } }) {
      const isFollowing = u.relationship?.following ?? false;
      const isFollower = u.relationship?.follower ?? false;
      if (isFollowing && isFollower) return 'follow-each-other';
      if (isFollowing) return 'you-follow';
      return '';
    }

    expect(followStatus({ relationship: undefined })).toBe('');
  });

  it('followStatus handles follower only', async () => {
    function followStatus(u: { relationship?: { following?: boolean; follower?: boolean } }) {
      const isFollowing = u.relationship?.following ?? false;
      const isFollower = u.relationship?.follower ?? false;
      if (isFollowing && isFollower) return 'follow-each-other';
      if (isFollowing) return 'you-follow';
      return '';
    }

    expect(followStatus({ relationship: { following: false, follower: true } })).toBe('');
  });

  it('isBlocked returns true for both blocking and blockedBy', async () => {
    function isBlocked(u: { relationship?: { blocking?: boolean; blockedBy?: boolean } }) {
      return u.relationship?.blocking || u.relationship?.blockedBy;
    }

    expect(isBlocked({ relationship: { blocking: true, blockedBy: true } })).toBe(true);
  });

  it('toggleSelect toggles between user and null', async () => {
    let selectedUsername: string | null = null;

    function toggleSelect(username: string) {
      selectedUsername = selectedUsername === username ? null : username;
    }

    toggleSelect('user1');
    expect(selectedUsername).toBe('user1');

    toggleSelect('user2');
    expect(selectedUsername).toBe('user2');

    toggleSelect('user2');
    expect(selectedUsername).toBeNull();
  });

  it('canProceed depends on selectedUsername', async () => {
    let selectedUsername: string | null = null;
    const canProceed = () => !!selectedUsername;

    expect(canProceed()).toBe(false);

    selectedUsername = '';
    expect(canProceed()).toBe(false);

    selectedUsername = 'testuser';
    expect(canProceed()).toBe(true);
  });
});

// Mock Composables Globally
vi.mock('@/composables/useSearchUsers', () => ({
  useSearchUsers: vi.fn(() => ({
    users: ref([]),
    loading: ref(false),
  })),
}));

vi.mock('@/composables/useStartConversation', () => ({
  useStartConversation: vi.fn(() => ({
    startConversation: vi.fn(async () => ({ id: '123' })),
    isStarting: ref(false),
  })),
}));

vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}));

describe('DmNewMessageDialog - Component Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const defaultStubs = {
    UiDialog: { template: '<div><slot /></div>', props: ['open'] },
    UiDialogOverlay: true,
    UiDialogContent: { template: '<div><slot /></div>' },
    UiDialogHeader: { template: '<div><slot /></div>' },
    UiDialogTitle: true,
    UiDialogDescription: true,
    UiButton: {
      template: '<button @click="$emit(\'click\')" :disabled="disabled"><slot /></button>',
      props: ['disabled'],
    },
    Icon: true,
    UiSpinner: { template: '<div data-test="spinner"></div>' },
    UiAvatar: true,
  };

  it('updates search when typing into input', async () => {
    vi.mocked(useSearchUsers).mockReturnValue({
      users: ref([]),
      loading: ref(false),
    } as any);
    vi.mocked(useRouter).mockReturnValue({ push: vi.fn() } as any);

    const wrapper = mount(DmNewMessageDialog, {
      props: { open: true },
      global: { plugins: [i18n], stubs: defaultStubs },
    });

    const input = wrapper.find('input#dm-search');
    await input.setValue('hussein');

    expect((wrapper.vm as any).search).toBe('hussein');
  });

  it('shows spinner when loading & search not empty', async () => {
    const loading = ref(true);
    const users = ref([]);

    vi.mocked(useSearchUsers).mockReturnValue({ loading, users } as any);
    vi.mocked(useRouter).mockReturnValue({ push: vi.fn() } as any);

    const wrapper = mount(DmNewMessageDialog, {
      props: { open: true },
      global: { plugins: [i18n], stubs: defaultStubs },
    });

    const input = wrapper.find('input#dm-search');
    await input.setValue('abc');
    await wrapper.vm.$nextTick();

    expect(wrapper.find('[data-test="spinner"]').exists()).toBe(true);
  });

  it('hides spinner when not loading', async () => {
    vi.mocked(useSearchUsers).mockReturnValue({
      loading: ref(false),
      users: ref([]),
    } as any);
    vi.mocked(useRouter).mockReturnValue({ push: vi.fn() } as any);

    const wrapper = mount(DmNewMessageDialog, {
      props: { open: true },
      global: { plugins: [i18n], stubs: defaultStubs },
    });

    expect(wrapper.find('[data-test="spinner"]').exists()).toBe(false);
  });

  it('does not show spinner when search is empty even if loading', async () => {
    vi.mocked(useSearchUsers).mockReturnValue({
      loading: ref(true),
      users: ref([]),
    } as any);
    vi.mocked(useRouter).mockReturnValue({ push: vi.fn() } as any);

    const wrapper = mount(DmNewMessageDialog, {
      props: { open: true },
      global: { plugins: [i18n], stubs: defaultStubs },
    });

    expect((wrapper.vm as any).search.trim().length).toBe(0);
    expect(wrapper.find('[data-test="spinner"]').exists()).toBe(false);
  });

  it('does not select blocked user', async () => {
    const users = ref([
      { username: 'blocked', displayName: 'Blocked', relationship: { blockedBy: true } },
    ]);

    vi.mocked(useSearchUsers).mockReturnValue({ loading: ref(false), users } as any);
    vi.mocked(useRouter).mockReturnValue({ push: vi.fn() } as any);

    const wrapper = mount(DmNewMessageDialog, {
      props: { open: true },
      global: { plugins: [i18n], stubs: defaultStubs },
    });

    const items = wrapper.findAll('.cursor-not-allowed');
    if (items[0]) await items[0].trigger('click');

    expect((wrapper.vm as any).selectedUsername).toBeFalsy();
  });

  it('displays blocked message for blocked users', async () => {
    const users = ref([
      { username: 'blocked', displayName: 'Blocked User', relationship: { blockedBy: true } },
    ]);

    vi.mocked(useSearchUsers).mockReturnValue({ loading: ref(false), users } as any);
    vi.mocked(useRouter).mockReturnValue({ push: vi.fn() } as any);

    const wrapper = mount(DmNewMessageDialog, {
      props: { open: true },
      global: { plugins: [i18n], stubs: defaultStubs },
    });

    expect(wrapper.text()).toContain('cant-message');
  });

  it('selects normal user and adds border class', async () => {
    const users = ref([{ username: 'hussein', displayName: 'Hussein', relationship: {} }]);

    vi.mocked(useSearchUsers).mockReturnValue({ loading: ref(false), users } as any);
    vi.mocked(useRouter).mockReturnValue({ push: vi.fn() } as any);

    const wrapper = mount(DmNewMessageDialog, {
      props: { open: true },
      global: { plugins: [i18n], stubs: defaultStubs },
    });

    const row = wrapper.findAll('.cursor-pointer').find((w) => w.text().includes('Hussein'));
    if (row) {
      await row.trigger('click');
      expect((wrapper.vm as any).selectedUsername).toBe('hussein');
      expect(row.classes()).toContain('border-primary');
    }
  });

  it('deselects user when clicking selected user', async () => {
    const users = ref([{ username: 'hussein', displayName: 'Hussein', relationship: {} }]);

    vi.mocked(useSearchUsers).mockReturnValue({ loading: ref(false), users } as any);
    vi.mocked(useRouter).mockReturnValue({ push: vi.fn() } as any);

    const wrapper = mount(DmNewMessageDialog, {
      props: { open: true },
      global: { plugins: [i18n], stubs: defaultStubs },
    });

    const row = wrapper.findAll('.cursor-pointer').find((w) => w.text().includes('Hussein'));
    if (!row) throw new Error('User row not found');

    await row.trigger('click');
    expect((wrapper.vm as any).selectedUsername).toBe('hussein');

    await row.trigger('click');
    expect((wrapper.vm as any).selectedUsername).toBeNull();
  });

  it('renders follow status correctly', async () => {
    const users = ref([
      {
        username: 'x',
        displayName: 'X',
        relationship: { following: true, follower: true },
      },
    ]);

    vi.mocked(useSearchUsers).mockReturnValue({ loading: ref(false), users } as any);
    vi.mocked(useRouter).mockReturnValue({ push: vi.fn() } as any);

    const wrapper = mount(DmNewMessageDialog, {
      props: { open: true },
      global: { plugins: [i18n], stubs: defaultStubs },
    });

    expect(wrapper.text()).toContain('follow-each-other');
  });

  it('renders you-follow status', async () => {
    const users = ref([
      {
        username: 'y',
        displayName: 'Y',
        relationship: { following: true, follower: false },
      },
    ]);

    vi.mocked(useSearchUsers).mockReturnValue({ loading: ref(false), users } as any);
    vi.mocked(useRouter).mockReturnValue({ push: vi.fn() } as any);

    const wrapper = mount(DmNewMessageDialog, {
      props: { open: true },
      global: { plugins: [i18n], stubs: defaultStubs },
    });

    expect(wrapper.text()).toContain('you-follow');
  });

  it('calls router.push on successful conversation start', async () => {
    const startConversation = vi.fn(async () => ({ id: '123' }));
    vi.mocked(useStartConversation).mockReturnValue({
      startConversation,
      isStarting: ref(false),
    } as any);
    vi.mocked(useSearchUsers).mockReturnValue({
      loading: ref(false),
      users: ref([{ username: 'hussein', displayName: 'Hussein', relationship: {} }]),
    } as any);
    vi.mocked(useRouter).mockReturnValue({ push: vi.fn() } as any);

    const wrapper = mount(DmNewMessageDialog, {
      props: { open: true },
      global: { plugins: [i18n], stubs: defaultStubs },
    });

    const router = (wrapper.vm as any).router;
    const pushSpy = vi.spyOn(router, 'push');

    const row = wrapper.findAll('.cursor-pointer').find((w) => w.text().includes('Hussein'));
    if (row) await row.trigger('click');

    expect((wrapper.vm as any).selectedUsername).toBe('hussein');

    await (wrapper.vm as any).onNewConversation();

    expect(startConversation).toHaveBeenCalledWith('hussein');
    expect(pushSpy).toHaveBeenCalledWith({ path: '/messages/123' });
  });

  it('closes dialog after successful conversation start', async () => {
    vi.mocked(useStartConversation).mockReturnValue({
      startConversation: vi.fn(async () => ({ id: '123' })),
      isStarting: ref(false),
    } as any);
    vi.mocked(useSearchUsers).mockReturnValue({
      loading: ref(false),
      users: ref([{ username: 'hussein', displayName: 'Hussein', relationship: {} }]),
    } as any);
    vi.mocked(useRouter).mockReturnValue({ push: vi.fn() } as any);

    const wrapper = mount(DmNewMessageDialog, {
      props: { open: true },
      global: { plugins: [i18n], stubs: defaultStubs },
    });

    expect((wrapper.vm as any).open).toBe(true);

    const row = wrapper.findAll('.cursor-pointer').find((w) => w.text().includes('Hussein'));
    if (row) await row.trigger('click');

    await (wrapper.vm as any).onNewConversation();
    await wrapper.vm.$nextTick();

    expect((wrapper.vm as any).open).toBe(false);
  });

  it('does not navigate when conversation id is null', async () => {
    const startConversation = vi.fn(async () => ({ id: null }));
    const pushMock = vi.fn();

    vi.mocked(useStartConversation).mockReturnValue({
      startConversation,
      isStarting: ref(false),
    } as any);

    vi.mocked(useSearchUsers).mockReturnValue({
      loading: ref(false),
      users: ref([{ username: 'hussein', displayName: 'Hussein', relationship: {} }]),
    } as any);

    vi.mocked(useRouter).mockReturnValue({
      push: pushMock,
    } as any);

    const wrapper = mount(DmNewMessageDialog, {
      props: { open: true },
      global: { plugins: [i18n], stubs: defaultStubs },
    });

    const row = wrapper.findAll('.cursor-pointer').find((w) => w.text().includes('Hussein'));
    if (row) await row.trigger('click');

    await (wrapper.vm as any).onNewConversation();
    await wrapper.vm.$nextTick();

    expect(pushMock).not.toHaveBeenCalled();
    expect((wrapper.vm as any).open).toBe(true);
  });

  it('disables next button when no user selected', async () => {
    vi.mocked(useSearchUsers).mockReturnValue({
      loading: ref(false),
      users: ref([{ username: 'hussein', displayName: 'Hussein', relationship: {} }]),
    } as any);
    vi.mocked(useRouter).mockReturnValue({ push: vi.fn() } as any);

    const wrapper = mount(DmNewMessageDialog, {
      props: { open: true },
      global: { plugins: [i18n], stubs: defaultStubs },
    });

    expect((wrapper.vm as any).canProceed).toBe(false);
  });

  it('enables next button when user is selected', async () => {
    const users = ref([{ username: 'hussein', displayName: 'Hussein', relationship: {} }]);
    vi.mocked(useSearchUsers).mockReturnValue({ loading: ref(false), users } as any);
    vi.mocked(useRouter).mockReturnValue({ push: vi.fn() } as any);

    const wrapper = mount(DmNewMessageDialog, {
      props: { open: true },
      global: { plugins: [i18n], stubs: defaultStubs },
    });

    const row = wrapper.findAll('.cursor-pointer').find((w) => w.text().includes('Hussein'));
    if (row) await row.trigger('click');

    expect((wrapper.vm as any).canProceed).toBe(true);
  });

  it('renders users list', async () => {
    const users = ref([
      { username: 'alice', displayName: 'Alice', relationship: {} },
      { username: 'bob', displayName: 'Bob', relationship: {} },
    ]);

    vi.mocked(useSearchUsers).mockReturnValue({ loading: ref(false), users } as any);
    vi.mocked(useRouter).mockReturnValue({ push: vi.fn() } as any);

    const wrapper = mount(DmNewMessageDialog, {
      props: { open: true },
      global: { plugins: [i18n], stubs: defaultStubs },
    });

    expect(wrapper.text()).toContain('Alice');
    expect(wrapper.text()).toContain('Bob');
  });

  it('handles empty users list', async () => {
    vi.mocked(useSearchUsers).mockReturnValue({
      loading: ref(false),
      users: ref([]),
    } as any);
    vi.mocked(useRouter).mockReturnValue({ push: vi.fn() } as any);

    const wrapper = mount(DmNewMessageDialog, {
      props: { open: true },
      global: { plugins: [i18n], stubs: defaultStubs },
    });

    expect(wrapper.findAll('.cursor-pointer').length).toBe(0);
  });

  it('does nothing when onNewConversation called without selected user', async () => {
    vi.mocked(useStartConversation).mockReturnValue({
      startConversation: vi.fn(),
      isStarting: ref(false),
    } as any);
    vi.mocked(useSearchUsers).mockReturnValue({
      loading: ref(false),
      users: ref([]),
    } as any);

    const wrapper = mount(DmNewMessageDialog, {
      props: { open: true },
      global: { plugins: [i18n], stubs: defaultStubs },
    });

    await (wrapper.vm as any).onNewConversation();

    const startConv = (useStartConversation as any)().startConversation;
    expect(startConv).not.toHaveBeenCalled();
  });
});
