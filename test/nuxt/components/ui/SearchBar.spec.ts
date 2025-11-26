import { describe, it, expect, vi } from 'vitest';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import SearchBar from '@/components/ui/SearchBar.vue';

mockNuxtImport('useI18n', () => {
  return () => ({
    t: (key: string) => key,
    locale: { value: 'en' },
  });
});

describe('SearchBar', () => {
  it('renders with default placeholder', async () => {
    const wrapper = await mountSuspended(SearchBar, {
      global: { stubs: { Icon: true, UiButton: true } },
    });

    const input = wrapper.find('input');
    expect(input.exists()).toBe(true);
    expect(input.attributes('placeholder')).toBe('ui.search.searchbar.placeholder');
  });

  it('renders with custom placeholder', async () => {
    const wrapper = await mountSuspended(SearchBar, {
      props: { placeholder: 'Search for something' },
      global: { stubs: { Icon: true, UiButton: true } },
    });

    const input = wrapper.find('input');
    expect(input.attributes('placeholder')).toBe('Search for something');
  });

  it('updates modelValue on input', async () => {
    const wrapper = await mountSuspended(SearchBar, {
      props: { modelValue: '' },
      global: { stubs: { Icon: true, UiButton: true } },
    });

    const input = wrapper.find('input');
    await input.setValue('test search');

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['test search']);
  });

  it('emits focus and blur events', async () => {
    const wrapper = await mountSuspended(SearchBar, {
      global: { stubs: { Icon: true, UiButton: true } },
    });

    const input = wrapper.find('input');

    await input.trigger('focus');
    expect(wrapper.emitted('update:isFocused')?.[0]).toEqual([true]);

    await input.trigger('blur');
    expect(wrapper.emitted('update:isFocused')?.[1]).toEqual([false]);
  });

  it('applies focus styling when focused', async () => {
    const wrapper = await mountSuspended(SearchBar, {
      global: { stubs: { Icon: true, UiButton: true } },
    });

    const container = wrapper.find('div');
    const input = wrapper.find('input');

    // Not focused initially
    expect(container.classes()).not.toContain('border-primary');

    // Focus input
    await input.trigger('focus');
    await wrapper.vm.$nextTick();

    // Should have focus styling
    expect(container.classes()).toContain('border-primary');
    expect(container.classes()).toContain('shadow-md');
  });

  it('emits submit event on Enter key press', async () => {
    const wrapper = await mountSuspended(SearchBar, {
      props: { modelValue: 'test query' },
      global: { stubs: { Icon: true, UiButton: true } },
    });

    const input = wrapper.find('input');
    await input.trigger('keydown.enter');

    expect(wrapper.emitted('submit')).toBeTruthy();
    expect(wrapper.emitted('submit')?.length).toBe(1);
  });

  it('clears input when clear button is clicked', async () => {
    const wrapper = await mountSuspended(SearchBar, {
      props: { modelValue: 'test' },
      global: { stubs: { Icon: true } },
    });

    // Clear button should be visible with modelValue
    const clearButton = wrapper.findComponent({ name: 'UiButton' });
    expect(clearButton.exists()).toBe(true);

    await clearButton.trigger('click');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['']);
  });

  it('hides clear button when input is empty', async () => {
    const wrapper = await mountSuspended(SearchBar, {
      props: { modelValue: '' },
      global: { stubs: { Icon: true } },
    });

    const clearButton = wrapper.findComponent({ name: 'UiButton' });
    expect(clearButton.exists()).toBe(false);
  });

  it('calls clearInput function which clears input and refocuses', async () => {
    const wrapper = await mountSuspended(SearchBar, {
      props: { modelValue: 'test query' },
      global: { stubs: { Icon: true } },
    });

    const input = wrapper.find('input');
    const focusSpy = vi.spyOn(input.element, 'focus');

    // Access the component's clearInput method directly to test lines 44-46
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (wrapper.vm as any).clearInput();
    await wrapper.vm.$nextTick();

    // Should emit update with empty string
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['']);

    // Should focus the input after clearing (line 46)
    expect(focusSpy).toHaveBeenCalled();
  });
});
