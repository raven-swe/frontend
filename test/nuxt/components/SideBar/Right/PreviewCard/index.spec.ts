import { describe, expect, it } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import PreviewCard from '@/components/SideBar/Right/PreviewCard/index.vue';

describe('SideBar Right PreviewCard Component', () => {
  it("doesn't render title element with no title prop", async () => {
    const wrapper = await mountSuspended(PreviewCard);

    // Check if title is NOT rendered when no prop provided
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

  it('renders title when provided as empty string', async () => {
    const wrapper = await mountSuspended(PreviewCard, {
      props: {
        title: '',
      },
    });

    // Empty string is falsy, so title should not render
    const title = wrapper.find('h1');
    expect(title.exists()).toBe(false);
  });

  it('renders title when provided as undefined', async () => {
    const wrapper = await mountSuspended(PreviewCard, {
      props: {
        title: undefined,
      },
    });

    const title = wrapper.find('h1');
    expect(title.exists()).toBe(false);
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

  it('renders both title and slot content together', async () => {
    const customTitle = 'Test Title';
    const wrapper = await mountSuspended(PreviewCard, {
      props: {
        title: customTitle,
      },
      slots: {
        default: '<div class="slot-content">Slot Content</div>',
      },
    });

    const title = wrapper.find('h1');
    expect(title.exists()).toBe(true);
    expect(title.text()).toBe(customTitle);

    const slotContent = wrapper.find('.slot-content');
    expect(slotContent.exists()).toBe(true);
    expect(slotContent.text()).toBe('Slot Content');
  });
});
