import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import ProfileLayout from '@/layouts/profile.vue';
import type { User } from '~~/shared/types/user';
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import { createI18n } from 'vue-i18n';
import messages from '@@/i18n/locales/en.json';
import { ref } from 'vue';
import { flushPromises } from '@vue/test-utils';
import type { FetchError } from 'ofetch';
const i18n = createI18n({ locale: 'en', messages: { en: messages } });

const mockUser: User = {
  username: 'testuser',
  displayName: 'Test User',
  bio: 'This is a test user bio.',
  email: '',
  phone: '',
  languageCode: 'en',
  bioEntities: { mentions: [], hashtags: [] },
  avatarUrl: 'https://example.com/avatar.jpg',
  bannerUrl: 'https://example.com/banner.jpg',
  location: 'Cairo, Egypt',
  websiteUrl: 'https://example.com',
  birthDate: '1999-01-01',
  joinedAt: '2020-07-01T00:00:00.000Z',
  followingCount: 150,
  followersCount: 200,
  mutualsCount: 5,
  relationship: {
    blocking: false,
    muted: false,
    following: true,
    follower: false,
    blockedBy: false,
  },
};

// Create a shared mock route object
const mockRouter = {
  currentRoute: ref({
    path: '/profile/testuser',
    params: { username: 'testuser' as string | undefined },
  }),
  push: vi.fn(),
  replace: vi.fn(),
};

mockNuxtImport('useRouter', () => {
  return () => ({
    currentRoute: mockRouter.currentRoute,
    push: mockRouter.push,
    replace: mockRouter.replace,
    resolve: vi.fn((to) => ({ href: to })), // basic mock for resolve
  });
});

vi.mock('@tanstack/vue-query', async (importActual) => {
  const actual = await importActual<typeof import('@tanstack/vue-query')>();
  return {
    ...actual,
    useQuery: vi.fn(() => ({
      data: ref(mockUser),
      isLoading: ref(false),
      isError: ref(false),
      error: ref(null),
      suspense: vi.fn(() => Promise.resolve()),
      refetch: vi.fn(),
    })),
    useQueryClient: vi.fn(() => ({
      invalidateQueries: vi.fn(),
    })),
  };
});

describe('ProfileLayout.vue', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    setActivePinia(createPinia());
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    vi.clearAllMocks();
  });

  const createWrapper = async () => {
    return await mountSuspended(ProfileLayout, {
      global: {
        plugins: [[VueQueryPlugin, { queryClient }], i18n],
        mocks: {
          $t: (msg: string) => msg,
          $router: mockRouter,
        },
        stubs: {
          NuxtLayout: { template: '<div><slot /></div>' },
          Tab: { template: '<div class="tab"></div>' },
          ProfileDetailsSkeleton: { template: '<div class="skeleton"></div>' },
          ProfileDetails: { template: '<div class="details"></div>' },
        },
      },
    });
  };

  it('shows profile details and tabs when user data is loaded', async () => {
    const { useQuery } = await import('@tanstack/vue-query');
    const wrapper = await createWrapper();
    await flushPromises();
    expect(wrapper.findAll('.tab').length).toBe(4);
    expect(wrapper.find('.details').exists()).toBe(true);

    const mockCall = vi.mocked(useQuery).mock.calls[0]?.[0] as {
      enabled: { value: boolean };
      // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
      queryFn: Function;
    };
    expect(mockCall?.enabled?.value).toBe(true);
    expect(mockCall?.queryFn).toBeInstanceOf(Function);
  });

  it('renders loading skeleton when data is loading', async () => {
    const { useQuery } = await import('@tanstack/vue-query');

    vi.mocked(useQuery).mockReturnValueOnce({
      data: ref(null),
      isLoading: ref(true),
      isError: ref(false),
      error: ref(null),
      suspense: vi.fn(),
    } as unknown as ReturnType<typeof useQuery>);

    const wrapper = await createWrapper();
    await flushPromises();
    expect(wrapper.find('.skeleton').exists()).toBe(true);
  });

  it('shows not found message when user does not exist', async () => {
    const { useQuery } = await import('@tanstack/vue-query');

    vi.mocked(useQuery).mockReturnValueOnce({
      data: ref(null),
      isLoading: ref(false),
      isError: ref(true),
      error: ref({ statusCode: 404 } as FetchError),
      suspense: vi.fn(),
    } as unknown as ReturnType<typeof useQuery>);

    const wrapper = await createWrapper();
    await flushPromises();
    expect(wrapper.text()).toContain('errors.ACCOUNT_NOT_FOUND');
  });

  it('show blocked message when user is blocked', async () => {
    const { useQuery } = await import('@tanstack/vue-query');

    const blockedUser = {
      ...mockUser,
      relationship: { ...mockUser.relationship, blocking: true },
    };

    vi.mocked(useQuery).mockReturnValueOnce({
      data: ref(blockedUser),
      isLoading: ref(false),
      isError: ref(false),
      error: ref(null),
      suspense: vi.fn(),
    } as unknown as ReturnType<typeof useQuery>);

    const wrapper = await createWrapper();
    await flushPromises();
    expect(wrapper.text()).toContain('profile.messages.blocked');
  });

  it('userQuery not enabled when username param is missing', async () => {
    const { useQuery } = await import('@tanstack/vue-query');

    // Set route params to not have username
    mockRouter.currentRoute.value = { path: '/profile/', params: { username: undefined } };
    await createWrapper();
    await flushPromises();
    const mockCall = vi.mocked(useQuery).mock.calls[0]?.[0] as {
      enabled: { value: boolean };
    };
    expect(mockCall?.enabled?.value).toBe(false);

    // Restore route params
    mockRouter.currentRoute.value = { path: '/profile/testuser', params: { username: 'testuser' } };
  });
});
