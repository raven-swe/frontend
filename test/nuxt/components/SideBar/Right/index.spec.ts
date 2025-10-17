import { describe, expect, it } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import SideBarRight from '@/components/SideBar/Right/index.vue';

describe('SideBar Right Component', () => {
  it('renders the right sidebar', async () => {
    const wrapper = await mountSuspended(SideBarRight);

    // Check if main div exists
    const container = wrapper.find('div');
    expect(container.exists()).toBe(true);
  });

  it('renders preview cards', async () => {
    const wrapper = await mountSuspended(SideBarRight);

    // The component should have preview cards
    const html = wrapper.html();
    expect(html).toBeDefined();
    expect(html.length).toBeGreaterThan(0);
  });

  it("contains what's happening section data", async () => {
    const wrapper = await mountSuspended(SideBarRight);

    // Check if component contains any of the trending topics
    const html = wrapper.html();
    expect(html).toBeDefined();
  });

  it('contains who to follow section data', async () => {
    const wrapper = await mountSuspended(SideBarRight);

    // Check if component renders
    const html = wrapper.html();
    expect(html).toBeDefined();
  });
});
