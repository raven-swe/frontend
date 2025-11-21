import { describe, expect, it } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import DmSearchBar from '@/components/dm/DmSearchBar.vue';

describe('DmSearchBar Component', () => {
  it('renders the search bar with correct structure', async () => {
    const wrapper = await mountSuspended(DmSearchBar);

    const searchContainer = wrapper.find('.relative');
    expect(searchContainer.exists()).toBe(true);
    expect(searchContainer.classes()).toContain('m-4');
    expect(searchContainer.classes()).toContain('flex');
    expect(searchContainer.classes()).toContain('items-center');
    expect(searchContainer.classes()).toContain('rounded-full');
  });

  it('displays search icon', async () => {
    const wrapper = await mountSuspended(DmSearchBar);

    const html = wrapper.html();
    expect(html).toContain('ic:outline-search');
  });

  it('renders input field with correct attributes', async () => {
    const wrapper = await mountSuspended(DmSearchBar);

    const input = wrapper.find('input[type="text"]');
    expect(input.exists()).toBe(true);
    expect(input.classes()).toContain('flex-1');
    expect(input.classes()).toContain('bg-transparent');
  });

  it('input has proper styling', async () => {
    const wrapper = await mountSuspended(DmSearchBar);

    const input = wrapper.find('input');
    expect(input.classes()).toContain('border-none');
    expect(input.classes()).toContain('outline-none');
  });

  it('updates search query on input', async () => {
    const wrapper = await mountSuspended(DmSearchBar);

    const input = wrapper.find('input');
    await input.setValue('test search');

    expect(input.element.value).toBe('test search');
  });
});
