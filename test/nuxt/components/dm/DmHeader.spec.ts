import { describe, expect, it, vi, beforeEach } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import { flushPromises } from '@vue/test-utils';
import DmHeader from '@/components/dm/DmHeader.vue';

// Mock the DmNewMessageDialog to avoid i18n and composable issues in tests
vi.mock('@/components/dm/DmNewMessageDialog.vue', () => ({
  default: {
    name: 'DmNewMessageDialog',
    props: ['open'],
    emits: ['update:open'],
    template: '<div data-test="dialog" :data-open="open"></div>',
  },
}));

describe('DmHeader Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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

    // Dialog should initially be closed
    let dialog = wrapper.find('[data-test="dialog"]');
    expect(dialog.attributes('data-open')).toBe('false');

    await button.trigger('click');
    await flushPromises();

    // Dialog should now be open
    dialog = wrapper.find('[data-test="dialog"]');
    expect(dialog.attributes('data-open')).toBe('true');
  });

  it('renders DmNewMessageDialog component', async () => {
    const wrapper = await mountSuspended(DmHeader);

    const dialog = wrapper.find('[data-test="dialog"]');
    expect(dialog.exists()).toBe(true);
  });

  it('button has correct variant and styling', async () => {
    const wrapper = await mountSuspended(DmHeader);

    const button = wrapper.find('button');
    expect(button.exists()).toBe(true);
    expect(button.classes()).toContain('flex');
  });

  it('dialog is initially closed', async () => {
    const wrapper = await mountSuspended(DmHeader);

    const dialog = wrapper.find('[data-test="dialog"]');
    expect(dialog.attributes('data-open')).toBe('false');
  });
});
