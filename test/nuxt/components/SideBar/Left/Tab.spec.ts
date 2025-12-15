import { describe, expect, it, vi } from 'vitest';
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import Tab from '@/components/SideBar/Left/Tab.vue';
import { reactive } from 'vue';

const useNotificationSoundMock = vi.hoisted(() => {
  return {
    play: vi.fn(),
  };
});

vi.mock('@/composables/useNotificationSound', () => {
  return {
    useNotificationSound: () => useNotificationSoundMock,
  };
});

mockNuxtImport('useRouter', () => {
  return () => {
    return {
      currentRoute: reactive({ value: { path: '/home' } }),
      replace: vi.fn(),
      resolve: vi.fn(() => ({ href: '/home' })),
    };
  };
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

  it('renders the tab with correct route', async () => {
    const wrapper = await mountSuspended(Tab, {
      props: {
        tab: mockTab,
      },
    });

    const link = wrapper.find('a');
    expect(link.attributes('href')).toBe(mockTab.route);
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

  it('show badge for notifications tab', async () => {
    const notificationTab = reactive({
      label: 'notifications',
      route: '/notifications',
      icon: 'notifications',
      badgeCount: 5,
    });

    const wrapper = await mountSuspended(Tab, {
      props: {
        tab: notificationTab,
      },
    });

    const badge = wrapper.find('[data-test="count-badge"]');
    expect(badge.exists()).toBe(true);
    expect(badge.text()).toBe('5');

    notificationTab.badgeCount = 10;
    wrapper.setProps({ tab: notificationTab });
    await wrapper.vm.$nextTick();
    expect(useNotificationSoundMock.play).toHaveBeenCalled();
  });

  it('show 99+ for badge count over 99', async () => {
    const notificationTab = reactive({
      label: 'notifications',
      route: '/notifications',
      icon: 'notifications',
      badgeCount: 150,
    });

    const wrapper = await mountSuspended(Tab, {
      props: {
        tab: notificationTab,
      },
    });

    const badge = wrapper.find('[data-test="count-badge"]');
    expect(badge.exists()).toBe(true);
    expect(badge.text()).toBe('99+');
  });

  it('renders bold label for active tab', async () => {
    const wrapper = await mountSuspended(Tab, {
      props: {
        tab: mockTab,
      },
    });

    const label = wrapper.find('p');
    expect(label.classes()).toContain('font-bold');
  });
});
