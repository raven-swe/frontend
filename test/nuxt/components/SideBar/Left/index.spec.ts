import { describe, expect, it } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import SideBarLeft from '@/components/SideBar/Left/index.vue';

describe('SideBar Left Component', () => {
  it('renders the sidebar container', async () => {
    const wrapper = await mountSuspended(SideBarLeft);

    // Check if main container exists
    const container = wrapper.find('.flex.h-screen.flex-col');
    expect(container.exists()).toBe(true);
  });

  it('renders the logo link', async () => {
    const wrapper = await mountSuspended(SideBarLeft);

    // Check if NuxtLink to home exists
    const logoLink = wrapper.find('a[href="/"]');
    expect(logoLink.exists()).toBe(true);
  });

  it('renders sidebar tabs', async () => {
    const wrapper = await mountSuspended(SideBarLeft);

    // Check if tabs container exists
    const tabsContainer = wrapper.find('.mt-2.space-y-3');
    expect(tabsContainer.exists()).toBe(true);
  });

  it('has proper layout structure', async () => {
    const wrapper = await mountSuspended(SideBarLeft);

    const container = wrapper.find('.flex.h-screen.flex-col');
    expect(container.exists()).toBe(true);
  });
});
