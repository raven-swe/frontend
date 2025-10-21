import { describe, expect, it } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import BookmarksPage from '@/pages/bookmarks/index.vue';

describe('Bookmarks Page', () => {
  it('renders page with correct content', async () => {
    const wrapper = await mountSuspended(BookmarksPage);

    const html = wrapper.html();
    expect(html).toContain('Bookmarks');
    expect(wrapper.find('h1').exists()).toBe(true);
    expect(wrapper.find('h1').classes()).toContain('text-2xl');
    expect(wrapper.find('h1').classes()).toContain('font-bold');
  });
});
