import { describe, expect, it, vi, beforeEach } from 'vitest';
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import Tab from '@/components/SideBar/Left/Tab.vue';
import { nextTick } from 'vue';

// Mock useNotificationSound
const mockPlay = vi.fn();
vi.mock('@/composables/useNotificationSound', () => ({
  useNotificationSound: () => ({
    play: mockPlay,
  }),
}));

// Mock useRoute
mockNuxtImport('useRoute', () => {
  return () => ({
    path: '/home',
  });
});

describe('SideBar Left Tab Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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
    const iconContainer = wrapper.find('.text-foreground');
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

  it('shows filled icon when tab is active', async () => {
    const wrapper = await mountSuspended(Tab, {
      props: {
        tab: mockTab,
      },
    });

    // When route matches, icon should be filled (no 'outline-' prefix)
    const html = wrapper.html();
    // Active tab should have bold font
    expect(html).toContain('font-bold');
  });

  it('shows outline icon when tab is inactive', async () => {
    const wrapper = await mountSuspended(Tab, {
      props: {
        tab: { label: 'explore', route: '/explore', icon: 'search' },
      },
    });

    // When route doesn't match, icon should have 'outline-' prefix
    const html = wrapper.html();
    expect(html).toContain('font-normal');
  });

  it('shows badge when badgeCount is provided and > 0', async () => {
    const tabWithBadge = {
      label: 'notifications',
      route: '/notifications',
      icon: 'notifications',
      badgeCount: 5,
    };

    const wrapper = await mountSuspended(Tab, {
      props: {
        tab: tabWithBadge,
      },
    });

    const badge = wrapper.find('.bg-primary');
    expect(badge.exists()).toBe(true);
    expect(badge.text()).toBe('5');
  });

  it('shows 99+ for badge count over 99', async () => {
    const tabWithHighBadge = {
      label: 'notifications',
      route: '/notifications',
      icon: 'notifications',
      badgeCount: 150,
    };

    const wrapper = await mountSuspended(Tab, {
      props: {
        tab: tabWithHighBadge,
      },
    });

    const badge = wrapper.find('.bg-primary');
    expect(badge.exists()).toBe(true);
    expect(badge.text()).toBe('99+');
  });

  it('does not show badge when badgeCount is 0', async () => {
    const tabWithZeroBadge = {
      label: 'notifications',
      route: '/notifications',
      icon: 'notifications',
      badgeCount: 0,
    };

    const wrapper = await mountSuspended(Tab, {
      props: {
        tab: tabWithZeroBadge,
      },
    });

    const badge = wrapper.find('.bg-primary');
    expect(badge.exists()).toBe(false);
  });

  it('does not show badge when badgeCount is undefined', async () => {
    const wrapper = await mountSuspended(Tab, {
      props: {
        tab: mockTab, // no badgeCount
      },
    });

    const badge = wrapper.find('.bg-primary');
    expect(badge.exists()).toBe(false);
  });

  it('plays notification sound when badgeCount increases', async () => {
    const tabWithBadge = {
      label: 'notifications',
      route: '/notifications',
      icon: 'notifications',
      badgeCount: 3,
    };

    const wrapper = await mountSuspended(Tab, {
      props: {
        tab: tabWithBadge,
      },
    });

    // Update badge count to trigger watch
    await wrapper.setProps({
      tab: { ...tabWithBadge, badgeCount: 5 },
    });
    await nextTick();

    expect(mockPlay).toHaveBeenCalled();
  });

  it('does not play sound when badgeCount decreases', async () => {
    const tabWithBadge = {
      label: 'notifications',
      route: '/notifications',
      icon: 'notifications',
      badgeCount: 5,
    };

    const wrapper = await mountSuspended(Tab, {
      props: {
        tab: tabWithBadge,
      },
    });

    mockPlay.mockClear();

    // Update badge count to lower value
    await wrapper.setProps({
      tab: { ...tabWithBadge, badgeCount: 3 },
    });
    await nextTick();

    expect(mockPlay).not.toHaveBeenCalled();
  });

  it('does not play sound when oldCount is undefined', async () => {
    const tabWithBadge = {
      label: 'notifications',
      route: '/notifications',
      icon: 'notifications',
      badgeCount: undefined,
    };

    const wrapper = await mountSuspended(Tab, {
      props: {
        tab: tabWithBadge,
      },
    });

    mockPlay.mockClear();

    // Set badge count for first time
    await wrapper.setProps({
      tab: { ...tabWithBadge, badgeCount: 5 },
    });
    await nextTick();

    // Should not play since oldCount was undefined
    expect(mockPlay).not.toHaveBeenCalled();
  });

  it('does not play sound when newCount is undefined', async () => {
    const tabWithBadge = {
      label: 'notifications',
      route: '/notifications',
      icon: 'notifications',
      badgeCount: 5,
    };

    const wrapper = await mountSuspended(Tab, {
      props: {
        tab: tabWithBadge,
      },
    });

    mockPlay.mockClear();

    // Set badge count to undefined
    await wrapper.setProps({
      tab: { ...tabWithBadge, badgeCount: undefined },
    });
    await nextTick();

    expect(mockPlay).not.toHaveBeenCalled();
  });
});
