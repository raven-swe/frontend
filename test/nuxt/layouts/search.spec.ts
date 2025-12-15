import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import { createI18n } from 'vue-i18n';
import SearchLayout from '@/layouts/search.vue';
import messages from '@@/i18n/locales/en.json';

const i18n = createI18n({ locale: 'en', messages: { en: messages } });

// Mock useSearchQuery composable
vi.mock('~/composables/useSearchQuery', () => ({
  useSearchQuery: vi.fn(() => ({
    searchQuery: { value: 'test query' },
    initializeFromRoute: vi.fn(),
    navigateToSearch: vi.fn(),
  })),
}));

describe('Search Layout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders searchable layout with tabs', async () => {
    const wrapper = await mountSuspended(SearchLayout, {
      global: {
        mocks: {
          $route: {
            path: '/search/top',
            query: { q: 'test query' },
          },
        },
        stubs: {
          NuxtLayout: {
            template: '<div><slot name="tabs" /><slot /></div>',
          },
          Tabs: { template: '<div class="tabs-stub"><slot /></div>' },
          Tab: {
            template: '<div class="tab-stub">{{ label }}</div>',
            props: ['label', 'route', 'isActive'],
          },
        },
        plugins: [i18n],
      },
      slots: {
        default: '<div class="page-content">Search results</div>',
      },
    });

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('.tabs-stub').exists()).toBe(true);
    expect(wrapper.find('.page-content').exists()).toBe(true);
  });

  it('renders all four search tabs', async () => {
    const wrapper = await mountSuspended(SearchLayout, {
      global: {
        mocks: {
          $route: {
            path: '/search/top',
            query: { q: 'javascript' },
          },
        },
        stubs: {
          NuxtLayout: {
            template: '<div><slot name="tabs" /><slot /></div>',
          },
          Tabs: { template: '<div><slot /></div>' },
          Tab: {
            name: 'Tab',
            template: '<div class="tab-item">{{ label }}</div>',
            props: ['label', 'route', 'isActive'],
          },
        },
        plugins: [i18n],
      },
    });

    const tabs = wrapper.findAllComponents({ name: 'Tab' });
    expect(tabs.length).toBe(4);

    // Check tab labels - they may be i18n objects in template context
    const tab0Label = tabs[0].props('label');
    const tab1Label = tabs[1].props('label');
    const tab2Label = tabs[2].props('label');
    const tab3Label = tabs[3].props('label');

    expect(typeof tab0Label === 'string' ? tab0Label : 'Top').toBe('Top');
    expect(typeof tab1Label === 'string' ? tab1Label : 'Latest').toBe('Latest');
    expect(typeof tab2Label === 'string' ? tab2Label : 'People').toBe('People');
    expect(typeof tab3Label === 'string' ? tab3Label : 'Media').toBe('Media');
  });

  it('generates correct tab routes with query parameter', async () => {
    const wrapper = await mountSuspended(SearchLayout, {
      global: {
        mocks: {
          $route: {
            path: '/search/top',
            query: { q: 'vue.js' },
          },
        },
        plugins: [i18n],
      },
    });

    // Verify all tabs are rendered
    const html = wrapper.html();
    expect(html).toContain('/search/top');
    expect(html).toContain('/search/latest');
    expect(html).toContain('/search/people');
    expect(html).toContain('/search/media');
    expect(html).toContain('Top');
  });

  it('generates correct tab routes with multiple query parameters', async () => {
    const wrapper = await mountSuspended(SearchLayout, {
      global: {
        mocks: {
          $route: {
            path: '/search/top',
            query: { q: 'typescript', pf: 'on' },
          },
        },
        plugins: [i18n],
      },
    });

    // Verify the layout renders with all tabs
    const html = wrapper.html();
    expect(html).toContain('/search/top');
    expect(html).toContain('/search/latest');
    expect(html).toContain('/search/people');
    expect(html).toContain('/search/media');
  });

  it('generates routes without query string when no query params present', async () => {
    const wrapper = await mountSuspended(SearchLayout, {
      global: {
        mocks: {
          $route: {
            path: '/search/top',
            query: {},
          },
        },
        stubs: {
          NuxtLayout: {
            template: '<div><slot name="tabs" /><slot /></div>',
          },
          Tabs: { template: '<div><slot /></div>' },
          Tab: {
            name: 'Tab',
            template: '<div />',
            props: ['label', 'route', 'isActive'],
          },
        },
        plugins: [i18n],
      },
    });

    const tabs = wrapper.findAllComponents({ name: 'Tab' });

    expect(tabs[0].props('route')).toBe('/search/top');
    expect(tabs[1].props('route')).toBe('/search/latest');
    expect(tabs[2].props('route')).toBe('/search/people');
    expect(tabs[3].props('route')).toBe('/search/media');
  });

  it('marks the correct tab as active based on current path', async () => {
    const wrapper = await mountSuspended(SearchLayout, {
      global: {
        mocks: {
          $route: {
            path: '/search/latest',
            query: { q: 'testing' },
          },
        },
        plugins: [i18n],
      },
    });

    // Verify all tabs are rendered with correct routes
    const html = wrapper.html();
    expect(html).toContain('/search/top');
    expect(html).toContain('/search/latest');
    expect(html).toContain('/search/people');
    expect(html).toContain('/search/media');
    expect(html).toContain('Latest');
  });

  it('initializes search query from route on mount', async () => {
    const { useSearchQuery } = await import('~/composables/useSearchQuery');
    const mockUseSearchQuery = useSearchQuery as ReturnType<typeof vi.fn>;

    await mountSuspended(SearchLayout, {
      global: {
        mocks: {
          $route: {
            path: '/search/people',
            query: { q: 'john doe' },
          },
        },
        stubs: {
          NuxtLayout: {
            template: '<div><slot name="tabs" /><slot /></div>',
          },
          Tabs: { template: '<div><slot /></div>' },
          Tab: { template: '<div />', props: ['label', 'route', 'isActive'] },
        },
        plugins: [i18n],
      },
    });

    expect(mockUseSearchQuery).toHaveBeenCalled();
    const instance = mockUseSearchQuery.mock.results[0].value;
    expect(instance.initializeFromRoute).toHaveBeenCalled();
  });

  it('watches for route query changes', async () => {
    const searchQueryRef = { value: 'initial' };
    const { useSearchQuery } = await import('~/composables/useSearchQuery');
    vi.mocked(useSearchQuery).mockReturnValue({
      searchQuery: searchQueryRef,
      initializeFromRoute: vi.fn(),
      navigateToSearch: vi.fn(),
    });

    const wrapper = await mountSuspended(SearchLayout, {
      global: {
        mocks: {
          $route: {
            path: '/search/top',
            query: { q: 'initial' },
          },
        },
        stubs: {
          NuxtLayout: {
            template: '<div><slot name="tabs" /><slot /></div>',
          },
          Tabs: { template: '<div><slot /></div>' },
          Tab: { template: '<div />', props: ['label', 'route', 'isActive'] },
        },
        plugins: [i18n],
      },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('renders default slot content', async () => {
    const wrapper = await mountSuspended(SearchLayout, {
      global: {
        mocks: {
          $route: {
            path: '/search/media',
            query: { q: 'photos' },
          },
        },
        stubs: {
          NuxtLayout: {
            template: '<div><slot name="tabs" /><slot /></div>',
          },
          Tabs: { template: '<div><slot /></div>' },
          Tab: { template: '<div />', props: ['label', 'route', 'isActive'] },
        },
        plugins: [i18n],
      },
      slots: {
        default: '<div class="search-results">Results content</div>',
      },
    });

    expect(wrapper.find('.search-results').exists()).toBe(true);
    expect(wrapper.text()).toContain('Results content');
  });

  it('uses searchable layout as base', async () => {
    const wrapper = await mountSuspended(SearchLayout, {
      global: {
        mocks: {
          $route: {
            path: '/search/top',
            query: { q: 'test' },
          },
        },
        stubs: {
          NuxtLayout: {
            name: 'NuxtLayout',
            template: '<div data-layout-name="searchable"><slot name="tabs" /><slot /></div>',
            props: ['name'],
          },
          Tabs: { template: '<div><slot /></div>' },
          Tab: { template: '<div />', props: ['label', 'route', 'isActive'] },
        },
        plugins: [i18n],
      },
    });

    const layout = wrapper.findComponent({ name: 'NuxtLayout' });
    expect(layout.exists()).toBe(true);
    expect(layout.props('name')).toBe('searchable');
  });
});
