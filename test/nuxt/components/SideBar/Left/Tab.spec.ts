import { describe, expect, it } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import Tab from '@/components/SideBar/Left/Tab.vue';

describe('SideBar Left Tab Component', () => {
  const mockTab = {
    label: 'home',
    route: '/home',
    icon: 'home',
  };

  it('renders the tab with correct structure', async () => {
    const wrapper = await mountSuspended(Tab, {
      props: {
        tab: mockTab,
      },
    });

    // Check if NuxtLink exists
    const link = wrapper.find('a');
    expect(link.exists()).toBe(true);
  });

  it('renders the tab with correct route', async () => {
    const wrapper = await mountSuspended(Tab, {
      props: {
        tab: mockTab,
      },
    });

    const link = wrapper.find('a');
    expect(link.attributes('href')).toBe(mockTab.route);
  });

  it('has proper hover classes', async () => {
    const wrapper = await mountSuspended(Tab, {
      props: {
        tab: mockTab,
      },
    });

    const link = wrapper.find('a');
    expect(link.classes()).toContain('rounded-full');
  });

  it('renders icon', async () => {
    const wrapper = await mountSuspended(Tab, {
      props: {
        tab: mockTab,
      },
    });

    // Check if icon container exists
    const iconContainer = wrapper.find('.text-dark');
    expect(iconContainer.exists()).toBe(true);
  });

  it('handles inactive tab (route: #)', async () => {
    const inactiveTab = {
      label: 'test',
      route: '#',
      icon: 'test',
    };

    const wrapper = await mountSuspended(Tab, {
      props: {
        tab: inactiveTab,
      },
    });

    const link = wrapper.find('a');
    expect(link.attributes('href')).toBe('#');
  });
});
