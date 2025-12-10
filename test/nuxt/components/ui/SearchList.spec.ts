import { describe, it, expect } from 'vitest';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import SearchList from '@/components/ui/SearchList.vue';

mockNuxtImport('useI18n', () => {
  return () => ({
    t: (key: string) => key,
    locale: { value: 'en' },
  });
});

describe('SearchList', () => {
  it('renders with default placeholder when no content', async () => {
    const wrapper = await mountSuspended(SearchList);

    expect(wrapper.text()).toContain('ui.search.search-list.placeholder');
    expect(wrapper.find('.text-muted-foreground').exists()).toBe(true);
  });

  it('renders with custom placeholder', async () => {
    const wrapper = await mountSuspended(SearchList, {
      props: { placeholder: 'No results found' },
    });

    expect(wrapper.text()).toContain('No results found');
  });

  it('renders slot content when provided', async () => {
    const wrapper = await mountSuspended(SearchList, {
      slots: {
        default: '<div class="test-item">Search Result 1</div>',
      },
    });

    expect(wrapper.html()).toContain('test-item');
    expect(wrapper.html()).toContain('Search Result 1');
    expect(wrapper.text()).not.toContain('ui.search.search-list.placeholder');
  });

  it('applies default max height', async () => {
    const wrapper = await mountSuspended(SearchList);

    const container = wrapper.find('div');
    expect(container.attributes('style')).toContain('max-height: 70vh');
  });

  it('applies custom max height', async () => {
    const wrapper = await mountSuspended(SearchList, {
      props: { maxHeight: '500px' },
    });

    const container = wrapper.find('div');
    expect(container.attributes('style')).toContain('max-height: 500px');
  });

  it('has correct styling classes', async () => {
    const wrapper = await mountSuspended(SearchList);

    const container = wrapper.find('div');
    expect(container.classes()).toContain('border');
    expect(container.classes()).toContain('rounded-lg');
    expect(container.classes()).toContain('bg-background');
    expect(container.classes()).toContain('overflow-y-auto');
  });
});
