import { describe, expect, it } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import DmHeader from '@/components/dm/DmHeader.vue';

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

  it('renders settings and email icons', async () => {
    const wrapper = await mountSuspended(DmHeader);

    const html = wrapper.html();
    // Check for icons container
    const iconsContainer = wrapper.find('.flex.space-x-4');
    expect(iconsContainer.exists()).toBe(true);

    // Check for icon names in the HTML
    expect(html).toContain('ic:outline-settings');
    expect(html).toContain('ic:twotone-attach-email');
  });

  it('has proper spacing between icons', async () => {
    const wrapper = await mountSuspended(DmHeader);

    const iconsContainer = wrapper.find('.space-x-4');
    expect(iconsContainer.exists()).toBe(true);
  });
});
