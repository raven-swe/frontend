import { ref } from 'vue';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import ProfileLayout from '@/layouts/profile.vue';
import type { ApiErrorResponse } from '~~/shared/types/api';
import type { User } from '~~/shared/types/user';
import type { FetchError } from 'ofetch';
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';

// Create a shared mock route object
const mockRoute = {
  path: '/profile/testuser',
  params: { username: 'testuser' },
};

mockNuxtImport('useRoute', () => {
  return () => mockRoute;
});

// Mock Vue Query composables
const mockQueryData = {
  data: ref<User | null>(null),
  isLoading: ref(false),
  isError: ref(false),
  error: ref<FetchError<FetchError<ApiErrorResponse>> | null>(null),
  suspense: ref<(() => null) | null>(() => null),
};

vi.mock('@tanstack/vue-query', async () => {
  const actual = await vi.importActual('@tanstack/vue-query');
  return {
    ...actual,
    useQuery: vi.fn(() => mockQueryData),
  };
});

// Mock API function
vi.mock('~/api', () => ({
  apiFetch: vi.fn(),
}));

// Mock composables
vi.mock('~/composables/useIsCurrentUser', () => ({
  useIsCurrentUser: () => ({ isCurrentUser: ref(false) }),
}));

// Mock Nuxt components
vi.mock('#app/components/nuxt-layout', () => ({
  default: { name: 'NuxtLayout', template: '<div><slot /></div>' },
}));

vi.mock('~/components/profile/ProfileDetails.vue', () => ({
  default: {
    name: 'ProfileDetails',
    props: ['userProfile'],
    template: '<div>Profile Details</div>',
  },
}));

vi.mock('~/components/profile/skeletons/ProfileDetailsSkeleton.vue', () => ({
  default: {
    name: 'ProfileDetailsSkeleton',
    template: '<div>Loading skeleton...</div>',
  },
}));

vi.mock('~/components/ui/Tabs.vue', () => ({
  default: { name: 'Tabs', template: '<div><slot /></div>' },
}));

vi.mock('~/components/ui/Tab.vue', () => ({
  default: {
    name: 'Tab',
    props: ['label', 'route', 'isActive'],
    template: '<div>{{ label }}</div>',
  },
}));

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

    // Reset mock query data
    mockQueryData.data.value = null;
    mockQueryData.isLoading.value = false;
    mockQueryData.isError.value = false;
    mockQueryData.error.value = null;
  });

  const createWrapper = async (username = 'hussein', routePath = '/profile/hussein') => {
    // Update the mock route before mounting
    mockRoute.path = routePath;
    mockRoute.params = { username };

    return await mountSuspended(ProfileLayout, {
      global: {
        plugins: [[VueQueryPlugin, { queryClient }]],
        mocks: {
          $t: (msg: string) => msg,
          $route: mockRoute,
        },
        stubs: {
          NuxtLayout: { template: '<div><slot /></div>' },
        },
      },
    });
  };

  it('mounts successfully', async () => {
    const wrapper = await createWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  it('shows skeleton when loading', async () => {
    mockQueryData.isLoading.value = true;

    const wrapper = await createWrapper();
    await wrapper.vm.$nextTick();

    expect(wrapper.findComponent({ name: 'ProfileDetailsSkeleton' }).exists()).toBe(true);
  });

  it('shows error message when user not found', async () => {
    mockQueryData.isError.value = true;

    mockQueryData.error.value = {
      message: 'User not found',
      name: 'FetchError',
      data: {
        message: 'User not found',
        name: 'FetchError',
        data: {
          success: false,
          error: { code: 'USER_NOT_FOUND', message: 'User not found' },
        },
      },
      statusCode: 404,
    };

    const wrapper = await createWrapper();
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('errors.ACCOUNT_NOT_FOUND');
    expect(wrapper.text()).toContain('errors.TRY_SEARCHING');
  });

  it('shows profile details and tabs when user data is loaded', async () => {
    const mockUser: User = {
      username: 'hussein',
      displayName: 'Hussein Mohamed',
      bio: 'football lover',
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

    mockQueryData.data.value = mockUser;

    const wrapper = await createWrapper();
    await wrapper.vm.$nextTick();

    expect(wrapper.findComponent({ name: 'ProfileDetails' }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'Tabs' }).exists()).toBe(true);
  });

  it('renders correct number of tabs for non-current user', async () => {
    const mockUser: User = {
      username: 'hussein',
      displayName: 'Hussein Mohamed',
      bio: 'test',
      email: '',
      phone: '',
      languageCode: 'en',
      bioEntities: { mentions: [], hashtags: [] },
      avatarUrl: '',
      bannerUrl: '',
      location: '',
      websiteUrl: '',
      birthDate: '1999-01-01',
      joinedAt: '2020-07-01T00:00:00.000Z',
      followingCount: 0,
      followersCount: 0,
      mutualsCount: 0,
      relationship: {
        blocking: false,
        muted: false,
        following: true,
        follower: false,
        blockedBy: false,
      },
    };

    mockQueryData.data.value = mockUser;

    const wrapper = await createWrapper();
    await wrapper.vm.$nextTick();

    const tabs = wrapper.findAllComponents({ name: 'Tab' });
    // Should have 3 tabs for non-current user (posts, replies, media)
    expect(tabs).toHaveLength(4);
    expect(tabs[0]?.props('label')).toBe('profile.tabs.posts');
    expect(tabs[1]?.props('label')).toBe('profile.tabs.replies');
    expect(tabs[2]?.props('label')).toBe('profile.tabs.media');
    expect(tabs[3]?.props('label')).toBe('profile.tabs.likes');
  });
});
