import { describe, expect, it } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import PreviewCard from '@/components/SideBar/Right/PreviewCard/index.vue';

describe('SideBar Right PreviewCard Component', () => {
  it("doesn't render with no title", async () => {
    const wrapper = await mountSuspended(PreviewCard);

    // Check if title is rendered
    const title = wrapper.find('h1');
    expect(title.exists()).toBe(false);
  });

  it('renders with custom title', async () => {
    const customTitle = 'Custom Card Title';
    const wrapper = await mountSuspended(PreviewCard, {
      props: {
        title: customTitle,
      },
    });

    const title = wrapper.find('h1');
    expect(title.text()).toBe(customTitle);
  });

  it('has proper styling classes', async () => {
    const wrapper = await mountSuspended(PreviewCard);

    const container = wrapper.find('.rounded-2xl');
    expect(container.exists()).toBe(true);
  });

  it('renders slot content', async () => {
    const wrapper = await mountSuspended(PreviewCard, {
      slots: {
        default: '<div class="test-content">Test Content</div>',
      },
    });

    const slotContent = wrapper.find('.test-content');
    expect(slotContent.exists()).toBe(true);
    expect(slotContent.text()).toBe('Test Content');
  });
});
