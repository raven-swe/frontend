import { describe, expect, it, vi } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import DmHeader from '@/components/dm/DmHeader.vue';

// Mock the DmNewMessageDialog to avoid i18n and composable issues in tests
vi.mock('@/components/dm/DmNewMessageDialog.vue', () => ({
  default: {
    name: 'DmNewMessageDialog',
    template: '<div data-test="dialog"></div>',
  },
}));

describe('DmHeader Component', () => {
  it('renders the header with correct structure', async () => {
    const wrapper = await mountSuspended(DmHeader);

    const container = wrapper.find('div');
    expect(container.exists()).toBe(true);
    expect(container.classes()).toContain('bg-background');
    expect(container.classes()).toContain('flex');
    expect(container.classes()).toContain('items-center');
    expect(container.classes()).toContain('justify-between');
    expect(container.classes()).toContain('p-4');
  });

  it('displays the header title', async () => {
    const wrapper = await mountSuspended(DmHeader);

    const title = wrapper.find('h1');
    expect(title.exists()).toBe(true);
    expect(title.classes()).toContain('text-xl');
    expect(title.classes()).toContain('font-bold');
  });

  it('renders the email icon button', async () => {
    const wrapper = await mountSuspended(DmHeader);

    const html = wrapper.html();
    // Check for the email icon button
    const button = wrapper.find('button');
    expect(button.exists()).toBe(true);

    // Check for icon name in the HTML
    expect(html).toContain('ic:twotone-attach-email');
  });

  it('opens dialog when button is clicked', async () => {
    const wrapper = await mountSuspended(DmHeader);

    const button = wrapper.find('button');
    expect(button.exists()).toBe(true);

    await button.trigger('click');

    // Dialog should be present in the DOM
    const dialog = wrapper.find('[data-test="dialog"]');
    expect(dialog.exists()).toBe(true);
  });
});
