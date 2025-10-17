import { describe, expect, it } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import PreviewCardItem from '@/components/SideBar/Right/PreviewCard/item.vue';

describe('SideBar Right PreviewCard Item Component', () => {
  it('renders the item container', async () => {
    const wrapper = await mountSuspended(PreviewCardItem);

    // Check if main container exists
    const container = wrapper.find('div');
    expect(container.exists()).toBe(true);
  });

  it('has proper styling classes', async () => {
    const wrapper = await mountSuspended(PreviewCardItem);

    const container = wrapper.find('div');
    expect(container.classes()).toContain('cursor-pointer');
    expect(container.classes()).toContain('border-b');
  });

  it('renders slot content', async () => {
    const wrapper = await mountSuspended(PreviewCardItem, {
      slots: {
        default: '<span class="test-item">Item Content</span>',
      },
    });

    const slotContent = wrapper.find('.test-item');
    expect(slotContent.exists()).toBe(true);
    expect(slotContent.text()).toBe('Item Content');
  });

  it('has hover effect classes', async () => {
    const wrapper = await mountSuspended(PreviewCardItem);

    const container = wrapper.find('div');
    expect(container.classes()).toContain('hover:bg-gray-100');
  });
});
