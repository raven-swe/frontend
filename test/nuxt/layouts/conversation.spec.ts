import { describe, expect, it } from 'vitest';
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import ConversationLayout from '@/layouts/conversation.vue';

mockNuxtImport('useI18n', () => {
  return () => ({
    locale: { value: 'en' },
    localeProperties: { value: { dir: 'ltr' } },
  });
});

describe('Conversation Layout', () => {
  it('renders middle and right slot content', async () => {
    const wrapper = await mountSuspended(ConversationLayout, {
      slots: {
        middle: '<div >Middle Content</div>',
        right: '<div >Right Content</div>',
      },
    });

    expect(wrapper.html()).toContain('Middle Content');
    expect(wrapper.html()).toContain('Right Content');

    expect(wrapper.html()).toContain('max-w-7xl');
    expect(wrapper.html()).toContain('w-full');
    expect(wrapper.html()).toContain('w-16');
    expect(wrapper.html()).toContain('sticky');
    expect(wrapper.html()).toContain('top-0');

    expect(wrapper.html()).toContain('bg-background');
    expect(wrapper.html()).toContain('border');
  });
});
