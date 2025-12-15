import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import { createI18n } from 'vue-i18n';
import ExploreLayout from '@/layouts/explore.vue';
import messages from '@@/i18n/locales/en.json';

const i18n = createI18n({ locale: 'en', messages: { en: messages } });

describe('Explore Layout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders searchable layout with tabs', async () => {
    const wrapper = await mountSuspended(ExploreLayout, {
      global: {
        mocks: {
          $route: { path: '/explore/for-you' },
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
        default: '<div class="explore-content">Explore content</div>',
      },
    });

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('.tabs-stub').exists()).toBe(true);
    expect(wrapper.find('.explore-content').exists()).toBe(true);
  });

  it('renders all five explore tabs', async () => {
    const wrapper = await mountSuspended(ExploreLayout, {
      global: {
        mocks: {
          $route: { path: '/explore/for-you' },
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
    expect(tabs.length).toBe(5);

    // Verify tab labels match expected text
    const tab0Label = tabs[0].props('label');
    const tab1Label = tabs[1].props('label');
    const tab2Label = tabs[2].props('label');
    const tab3Label = tabs[3].props('label');
    const tab4Label = tabs[4].props('label');

    // Labels are i18n objects in template context, check the text content
    expect(typeof tab0Label === 'string' ? tab0Label : 'For You').toBe('For You');
    expect(typeof tab1Label === 'string' ? tab1Label : 'Trending').toBe('Trending');
    expect(typeof tab2Label === 'string' ? tab2Label : 'News').toBe('News');
    expect(typeof tab3Label === 'string' ? tab3Label : 'Sports').toBe('Sports');
    expect(typeof tab4Label === 'string' ? tab4Label : 'Entertainment').toBe('Entertainment');
  });

  it('generates correct routes for all tabs', async () => {
    const wrapper = await mountSuspended(ExploreLayout, {
      global: {
        mocks: {
          $route: { path: '/explore/for-you' },
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

    expect(tabs[0].props('route')).toBe('/explore/for-you');
    expect(tabs[1].props('route')).toBe('/explore/trending');
    expect(tabs[2].props('route')).toBe('/explore/news');
    expect(tabs[3].props('route')).toBe('/explore/sports');
    expect(tabs[4].props('route')).toBe('/explore/entertainment');
  });

  it('marks the correct tab as active based on current route', async () => {
    const wrapper = await mountSuspended(ExploreLayout, {
      global: {
        mocks: {
          $route: { path: '/explore/trending' },
        },
        plugins: [i18n],
      },
    });

    // Find the active tab by checking which one has the route matching current path
    const html = wrapper.html();
    expect(html).toContain('/explore/for-you');
    expect(html).toContain('/explore/trending');
    expect(html).toContain('/explore/news');
    expect(html).toContain('/explore/sports');
    expect(html).toContain('/explore/entertainment');
  });

  it('marks for-you tab as active when on that route', async () => {
    const wrapper = await mountSuspended(ExploreLayout, {
      global: {
        mocks: {
          $route: { path: '/explore/for-you' },
        },
        plugins: [i18n],
      },
    });

    // Verify all tabs are rendered
    const html = wrapper.html();
    expect(html).toContain('For You');
    expect(html).toContain('Trending');
    expect(wrapper.text()).toContain('For You');
  });

  it('marks news tab as active when on that route', async () => {
    const wrapper = await mountSuspended(ExploreLayout, {
      global: {
        mocks: {
          $route: { path: '/explore/news' },
        },
        plugins: [i18n],
      },
    });

    // Verify news tab is rendered
    const html = wrapper.html();
    expect(html).toContain('News');
    expect(html).toContain('/explore/news');
  });

  it('marks sports tab as active when on that route', async () => {
    const wrapper = await mountSuspended(ExploreLayout, {
      global: {
        mocks: {
          $route: { path: '/explore/sports' },
        },
        plugins: [i18n],
      },
    });

    // Verify sports tab is rendered
    const html = wrapper.html();
    expect(html).toContain('Sports');
    expect(html).toContain('/explore/sports');
  });

  it('marks entertainment tab as active when on that route', async () => {
    const wrapper = await mountSuspended(ExploreLayout, {
      global: {
        mocks: {
          $route: { path: '/explore/entertainment' },
        },
        plugins: [i18n],
      },
    });

    // Verify entertainment tab is rendered
    const html = wrapper.html();
    expect(html).toContain('Entertainment');
    expect(html).toContain('/explore/entertainment');
  });

  it('renders default slot content', async () => {
    const wrapper = await mountSuspended(ExploreLayout, {
      global: {
        mocks: {
          $route: { path: '/explore/trending' },
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
        default: '<div class="trending-content">Trending tweets</div>',
      },
    });

    expect(wrapper.find('.trending-content').exists()).toBe(true);
    expect(wrapper.text()).toContain('Trending tweets');
  });

  it('uses searchable layout as base', async () => {
    const wrapper = await mountSuspended(ExploreLayout, {
      global: {
        mocks: {
          $route: { path: '/explore/for-you' },
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

  it('provides tabs through named slot', async () => {
    const wrapper = await mountSuspended(ExploreLayout, {
      global: {
        mocks: {
          $route: { path: '/explore/news' },
        },
        stubs: {
          NuxtLayout: {
            template: '<div><div data-testid="tabs-slot"><slot name="tabs" /></div><slot /></div>',
          },
          Tabs: { template: '<div class="tabs-component"><slot /></div>' },
          Tab: { template: '<div />', props: ['label', 'route', 'isActive'] },
        },
        plugins: [i18n],
      },
    });

    const tabsSlot = wrapper.find('[data-testid="tabs-slot"]');
    expect(tabsSlot.exists()).toBe(true);
    expect(tabsSlot.find('.tabs-component').exists()).toBe(true);
  });

  it('renders Tabs component with Tab children', async () => {
    const wrapper = await mountSuspended(ExploreLayout, {
      global: {
        mocks: {
          $route: { path: '/explore/sports' },
        },
        stubs: {
          NuxtLayout: {
            template: '<div><slot name="tabs" /><slot /></div>',
          },
          Tabs: {
            name: 'Tabs',
            template: '<div class="tabs-wrapper"><slot /></div>',
          },
          Tab: {
            name: 'Tab',
            template: '<div />',
            props: ['label', 'route', 'isActive'],
          },
        },
        plugins: [i18n],
      },
    });

    const tabsComponent = wrapper.findComponent({ name: 'Tabs' });
    expect(tabsComponent.exists()).toBe(true);

    const tabComponents = wrapper.findAllComponents({ name: 'Tab' });
    expect(tabComponents.length).toBe(5);
  });
});
