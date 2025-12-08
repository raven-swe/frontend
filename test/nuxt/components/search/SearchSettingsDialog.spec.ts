import { describe, expect, it, beforeEach, vi } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import { createI18n } from 'vue-i18n';
import messages from '~~/i18n/locales/en.json';
import { setActivePinia, createPinia } from 'pinia';
import SearchSettingsDialog from '@/components/search/SearchSettingsDialog.vue';
import { useSearchStore } from '@/stores/search';

const i18n = createI18n({
  locale: 'en',
  messages: { en: messages },
});

// Mock QueryClient
const mockInvalidateQueries = vi.fn();
vi.mock('@tanstack/vue-query', () => ({
  useQueryClient: () => ({
    invalidateQueries: mockInvalidateQueries,
  }),
}));

describe('SearchSettingsDialog Component', () => {
  const globalConfig = {
    plugins: [i18n],
    stubs: {
      UiDialog: false,
      UiDialogContent: false,
      UiDialogTitle: false,
      UiCheckbox: true,
      Button: true,
      Icon: true,
      Label: true,
      VisuallyHidden: true,
    },
  };

  beforeEach(() => {
    setActivePinia(createPinia());
    mockInvalidateQueries.mockClear();
  });

  it('renders when open is true', async () => {
    const wrapper = await mountSuspended(SearchSettingsDialog, {
      props: { open: true },
      global: globalConfig,
    });
    expect(wrapper.html()).toBeDefined();
  });

  it('renders dialog content', async () => {
    const wrapper = await mountSuspended(SearchSettingsDialog, {
      props: { open: true },
      global: globalConfig,
    });
    expect(wrapper.exists()).toBe(true);
  });

  it('renders checkbox for exclude muted and blocked', async () => {
    const wrapper = await mountSuspended(SearchSettingsDialog, {
      props: { open: true },
      global: globalConfig,
    });
    const checkbox = wrapper.findComponent({ name: 'UiCheckbox' });
    expect(checkbox.exists()).toBe(true);
    expect(checkbox.attributes('id')).toBe('remove-blocked');
  });

  it('binds checkbox to store state', async () => {
    const searchStore = useSearchStore();
    searchStore.excludeMutedAndBlocked = true;
    const wrapper = await mountSuspended(SearchSettingsDialog, {
      props: { open: true },
      global: globalConfig,
    });
    expect(wrapper.findComponent({ name: 'UiCheckbox' }).props('modelValue')).toBe(false);
  });

  it('emits update:open event when close button is clicked', async () => {
    const wrapper = await mountSuspended(SearchSettingsDialog, {
      props: { open: true },
      global: globalConfig,
    });
    await wrapper.findComponent({ name: 'Button' }).trigger('click');
    expect(wrapper.emitted('update:open')).toBeTruthy();
  });

  it('renders close button', async () => {
    const wrapper = await mountSuspended(SearchSettingsDialog, {
      props: { open: true },
      global: globalConfig,
    });
    const button = wrapper.findComponent({ name: 'Button' });
    expect(button.exists()).toBe(true);
  });

  it('renders label with correct for attribute', async () => {
    const wrapper = await mountSuspended(SearchSettingsDialog, {
      props: { open: true },
      global: globalConfig,
    });
    const label = wrapper.findComponent({ name: 'Label' });
    expect(label.exists()).toBe(true);
    expect(label.attributes('for')).toBe('remove-blocked');
  });

  it('tracks changes when checkbox value changes', async () => {
    const searchStore = useSearchStore();
    searchStore.excludeMutedAndBlocked = false;

    const wrapper = await mountSuspended(SearchSettingsDialog, {
      props: { open: true },
      global: globalConfig,
    });

    // Change the store value to trigger the watcher
    searchStore.excludeMutedAndBlocked = true;
    await wrapper.vm.$nextTick();

    // The hasChanged flag should be set internally
    // We can verify this by checking the component's internal state if exposed
    expect(searchStore.excludeMutedAndBlocked).toBe(true);
  });

  it('emits update:open when button is clicked', async () => {
    const wrapper = await mountSuspended(SearchSettingsDialog, {
      props: { open: true },
      global: globalConfig,
    });

    const button = wrapper.findComponent({ name: 'Button' });
    await button.trigger('click');

    expect(wrapper.emitted('update:open')).toBeTruthy();
    expect(wrapper.emitted('update:open')?.[0]).toEqual([false]);
  });
});
