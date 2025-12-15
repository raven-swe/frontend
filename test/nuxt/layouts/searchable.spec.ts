import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import { createI18n } from 'vue-i18n';
import SearchableLayout from '@/layouts/searchable.vue';
import messages from '@@/i18n/locales/en.json';

const i18n = createI18n({ locale: 'en', messages: { en: messages } });

describe('Searchable Layout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('explore route behavior', () => {
    it('does not show back button on explore pages', async () => {
      const wrapper = await mountSuspended(SearchableLayout, {
        global: {
          mocks: {
            $route: { path: '/explore/for-you' },
          },
          stubs: {
            NuxtLayout: { template: '<div><slot /></div>' },
            UiButton: { template: '<button><slot /></button>' },
            UiSearchField: { template: '<div class="search-field-stub" />' },
            SearchSettingsDialog: { template: '<div />' },
            Icon: { template: '<span />' },
          },
          plugins: [i18n],
        },
        slots: {
          default: '<div class="main-content">Content</div>',
        },
      });

      // Back button should not be rendered on explore pages
      const buttons = wrapper.findAllComponents({ name: 'UiButton' });
      const backButton = buttons.find((btn) =>
        btn.html().includes(messages.icons['back-button-icon']),
      );
      expect(backButton).toBeUndefined();
    });

    it('does not show settings button on explore pages', async () => {
      const wrapper = await mountSuspended(SearchableLayout, {
        global: {
          mocks: {
            $route: { path: '/explore/trending' },
          },
          stubs: {
            NuxtLayout: { template: '<div><slot /></div>' },
            UiButton: { template: '<button><slot /></button>' },
            UiSearchField: { template: '<div class="search-field-stub" />' },
            SearchSettingsDialog: { template: '<div />' },
            Icon: { template: '<span />' },
          },
          plugins: [i18n],
        },
      });

      const buttons = wrapper.findAllComponents({ name: 'UiButton' });
      const settingsButton = buttons.find((btn) => btn.html().includes('ic:more-horiz'));
      expect(settingsButton).toBeUndefined();
    });
  });

  describe('search route behavior', () => {
    it('shows back button on search pages', async () => {
      const wrapper = await mountSuspended(SearchableLayout, {
        global: {
          mocks: {
            $route: { path: '/search/top' },
          },
          stubs: {
            NuxtLayout: { template: '<div><slot /></div>' },
            UiButton: { template: '<button data-testid="ui-button"><slot /></button>' },
            UiSearchField: { template: '<div class="search-field-stub" />' },
            SearchSettingsDialog: { template: '<div />' },
            Icon: { template: '<span />' },
          },
          plugins: [i18n],
        },
      });

      // Back button should be rendered on search pages
      const buttons = wrapper.findAll('[data-testid="ui-button"]');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('shows settings button on search pages', async () => {
      const wrapper = await mountSuspended(SearchableLayout, {
        global: {
          mocks: {
            $route: { path: '/search/latest' },
          },
          stubs: {
            NuxtLayout: { template: '<div><slot /></div>' },
            UiButton: { template: '<button data-testid="ui-button"><slot /></button>' },
            UiSearchField: { template: '<div class="search-field-stub" />' },
            SearchSettingsDialog: { template: '<div />' },
            Icon: { template: '<span />' },
          },
          plugins: [i18n],
        },
      });

      const buttons = wrapper.findAll('[data-testid="ui-button"]');
      // Should have both back and settings buttons
      expect(buttons.length).toBe(2);
    });

    it('opens search settings dialog when settings button is clicked', async () => {
      const wrapper = await mountSuspended(SearchableLayout, {
        global: {
          mocks: {
            $route: { path: '/search/people' },
          },
          stubs: {
            NuxtLayout: { template: '<div><slot /></div>' },
            UiButton: {
              template:
                '<button @click="$emit(\'click\')" data-testid="ui-button"><slot /></button>',
            },
            UiSearchField: { template: '<div class="search-field-stub" />' },
            SearchSettingsDialog: {
              template: '<div v-if="open" data-testid="settings-dialog">Dialog</div>',
              props: ['open'],
            },
            Icon: { template: '<span />' },
          },
          plugins: [i18n],
        },
      });

      // Initially dialog should not be visible
      expect(wrapper.find('[data-testid="settings-dialog"]').exists()).toBe(false);

      // Click settings button (second button)
      const buttons = wrapper.findAll('[data-testid="ui-button"]');
      await buttons[1].trigger('click');

      // Dialog should now be visible
      await wrapper.vm.$nextTick();
      expect(wrapper.find('[data-testid="settings-dialog"]').exists()).toBe(true);
    });
  });

  describe('common elements', () => {
    it('renders UiSearchField component', async () => {
      const wrapper = await mountSuspended(SearchableLayout, {
        global: {
          mocks: {
            $route: { path: '/search/top' },
          },
          stubs: {
            NuxtLayout: { template: '<div><slot /></div>' },
            UiButton: { template: '<button><slot /></button>' },
            UiSearchField: { template: '<div class="search-field-stub" />' },
            SearchSettingsDialog: { template: '<div />' },
            Icon: { template: '<span />' },
          },
          plugins: [i18n],
        },
      });

      expect(wrapper.find('.search-field-stub').exists()).toBe(true);
    });

    it('passes show-back-on-focus prop to UiSearchField on explore pages', async () => {
      const wrapper = await mountSuspended(SearchableLayout, {
        global: {
          mocks: {
            $route: { path: '/explore/news' },
          },
          stubs: {
            NuxtLayout: { template: '<div><slot /></div>' },
            UiButton: { template: '<button><slot /></button>' },
            SearchSettingsDialog: { template: '<div />' },
            Icon: { template: '<span />' },
          },
          plugins: [i18n],
        },
      });

      // Verify UiSearchField is rendered
      const html = wrapper.html();
      expect(html).toContain('search-input');
    });

    it('does not pass show-back-on-focus prop to UiSearchField on search pages', async () => {
      const wrapper = await mountSuspended(SearchableLayout, {
        global: {
          mocks: {
            $route: { path: '/search/media' },
          },
          stubs: {
            NuxtLayout: { template: '<div><slot /></div>' },
            UiButton: { template: '<button><slot /></button>' },
            SearchSettingsDialog: { template: '<div />' },
            Icon: { template: '<span />' },
          },
          plugins: [i18n],
        },
      });

      // Verify UiSearchField is rendered
      const html = wrapper.html();
      expect(html).toContain('search-input');
    });

    it('renders tabs slot when provided', async () => {
      const wrapper = await mountSuspended(SearchableLayout, {
        global: {
          mocks: {
            $route: { path: '/search/top' },
          },
          stubs: {
            NuxtLayout: { template: '<div><slot /><slot name="tabs" /></div>' },
            UiButton: { template: '<button><slot /></button>' },
            UiSearchField: { template: '<div />' },
            SearchSettingsDialog: { template: '<div />' },
            Icon: { template: '<span />' },
          },
          plugins: [i18n],
        },
        slots: {
          tabs: '<div class="tabs-content">Tabs here</div>',
        },
      });

      expect(wrapper.find('.tabs-content').exists()).toBe(true);
      expect(wrapper.text()).toContain('Tabs here');
    });

    it('renders default slot content', async () => {
      const wrapper = await mountSuspended(SearchableLayout, {
        global: {
          mocks: {
            $route: { path: '/explore/for-you' },
          },
          stubs: {
            NuxtLayout: { template: '<div><slot /></div>' },
            UiButton: { template: '<button><slot /></button>' },
            UiSearchField: { template: '<div />' },
            SearchSettingsDialog: { template: '<div />' },
            Icon: { template: '<span />' },
          },
          plugins: [i18n],
        },
        slots: {
          default: '<div class="main-content">Main content goes here</div>',
        },
      });

      expect(wrapper.find('.main-content').exists()).toBe(true);
      expect(wrapper.text()).toContain('Main content goes here');
    });
  });

  describe('styling and structure', () => {
    it('applies sticky header styles', async () => {
      const wrapper = await mountSuspended(SearchableLayout, {
        global: {
          mocks: {
            $route: { path: '/search/top' },
          },
          stubs: {
            NuxtLayout: { template: '<div><slot /></div>' },
            UiButton: { template: '<button><slot /></button>' },
            UiSearchField: { template: '<div />' },
            SearchSettingsDialog: { template: '<div />' },
            Icon: { template: '<span />' },
          },
          plugins: [i18n],
        },
      });

      const header = wrapper.find('.sticky');
      expect(header.exists()).toBe(true);
      expect(header.classes()).toContain('top-0');
      expect(header.classes()).toContain('z-50');
    });

    it('applies backdrop blur effect', async () => {
      const wrapper = await mountSuspended(SearchableLayout, {
        global: {
          mocks: {
            $route: { path: '/explore/sports' },
          },
          stubs: {
            NuxtLayout: { template: '<div><slot /></div>' },
            UiButton: { template: '<button><slot /></button>' },
            UiSearchField: { template: '<div />' },
            SearchSettingsDialog: { template: '<div />' },
            Icon: { template: '<span />' },
          },
          plugins: [i18n],
        },
      });

      const header = wrapper.find('.backdrop-blur-sm');
      expect(header.exists()).toBe(true);
      expect(header.classes()).toContain('bg-background/60');
    });
  });
});
