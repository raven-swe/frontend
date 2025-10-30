import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import ProfileLayout from '@/layouts/profile.vue';
import { useUserStore } from '@/stores/user';

// Create a shared mock route object
const mockRoute = {
  path: '/profile/hussein',
  params: { username: 'hussein' },
};

// Mock useRoute composable
vi.mock('#app', () => ({
  useRoute: () => mockRoute,
  useFetch: vi.fn(),
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

vi.mock('~/components/ui/Spinner.vue', () => ({
  default: { name: 'Spinner', template: '<div>Loading...</div>' },
}));

describe('ProfileLayout.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    // Reset mock route to default
    mockRoute.path = '/profile/hussein';
    mockRoute.params = { username: 'hussein' };
  });

  const createWrapper = (username = 'hussein', routePath = '/profile/hussein') => {
    // Update the mock route before mounting
    mockRoute.path = routePath;
    mockRoute.params = { username };

    return mount(ProfileLayout, {
      global: {
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

  it('mounts successfully', () => {
    const wrapper = createWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  it('shows spinner when loading', async () => {
    const wrapper = createWrapper();
    const userStore = useUserStore();

    // Set loading state
    userStore.loading = true;
    userStore.user = null;
    userStore.error = null;

    await wrapper.vm.$nextTick();

    expect(wrapper.find('.flex.justify-center.p-4').exists()).toBe(true);
    expect(wrapper.text()).toContain('Loading...');
  });

  it('shows error message when there is an error', async () => {
    const wrapper = createWrapper();
    const userStore = useUserStore();

    // Set error state
    userStore.loading = false;
    userStore.error = 'User not found';
    userStore.user = null;

    await wrapper.vm.$nextTick();

    expect(wrapper.find('.text-destructive.p-4').exists()).toBe(true);
    expect(wrapper.text()).toContain('User not found');
  });

  it('shows profile details and tabs when user data is loaded', async () => {
    const wrapper = createWrapper();
    const userStore = useUserStore();

    // Set success state with user data
    userStore.loading = false;
    userStore.error = null;
    userStore.user = {
      username: 'hussein',
      displayName: 'Hussein Mohamed',
      bio: 'football lover',
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
      mutualNames: [],
    };

    await wrapper.vm.$nextTick();

    expect(wrapper.findComponent({ name: 'ProfileDetails' }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'Tabs' }).exists()).toBe(true);
  });

  it('renders all tab labels correctly', async () => {
    const wrapper = createWrapper();
    const userStore = useUserStore();

    // Set user data
    userStore.loading = false;
    userStore.user = {
      username: 'hussein',
      displayName: 'Hussein Mohamed',
      bio: 'test',
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
      mutualNames: [],
    };

    await wrapper.vm.$nextTick();

    const tabs = wrapper.findAllComponents({ name: 'Tab' });
    expect(tabs).toHaveLength(4);
    expect(tabs[0]).toBeDefined();
    expect(tabs[1]).toBeDefined();
    expect(tabs[2]).toBeDefined();
    expect(tabs[3]).toBeDefined();
    expect(tabs[0]?.props('label')).toBe('profile.tabs.posts');
    expect(tabs[1]?.props('label')).toBe('profile.tabs.replies');
    expect(tabs[2]?.props('label')).toBe('profile.tabs.media');
    expect(tabs[3]?.props('label')).toBe('profile.tabs.likes');
  });

  it('computes correct profile path', async () => {
    // Update mock route BEFORE mounting
    mockRoute.path = '/profile/testuser';
    mockRoute.params = { username: 'testuser' };

    const wrapper = mount(ProfileLayout, {
      global: {
        mocks: {
          $t: (msg: string) => msg,
          $route: mockRoute,
        },
        stubs: {
          NuxtLayout: { template: '<div><slot /></div>' },
        },
      },
    });

    await wrapper.vm.$nextTick();

    // Access the computed property through the component instance
    expect((wrapper.vm as unknown as { profilePath: string }).profilePath).toBe('/profile/hussein');
  });

  it('uses default username when route param is missing', async () => {
    // Update mock route to have no username
    mockRoute.path = '/profile';
    mockRoute.params = { username: '' };

    const wrapper = mount(ProfileLayout, {
      global: {
        mocks: {
          $t: (msg: string) => msg,
          $route: mockRoute,
        },
        stubs: {
          NuxtLayout: { template: '<div><slot /></div>' },
        },
      },
    });

    await wrapper.vm.$nextTick();

    expect((wrapper.vm as unknown as { username: string }).username).toBe('hussein');
  });
});
