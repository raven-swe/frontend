import { describe, expect, it } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import IndexPage from '@/pages/index.vue';

describe('Index Page', () => {
  it('renders welcome heading and button text', async () => {
    const wrapper = await mountSuspended(IndexPage);

    // Check translated welcome text from i18n
    expect(wrapper.html()).toContain('Welcome to our application!');

    // Check rendered button text (uses $t('testButton'))
    expect(wrapper.html()).toContain('test button');
  });
});
