import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ref, type Ref, nextTick } from 'vue';
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import * as VueQuery from '@tanstack/vue-query';
// Mock vue-query BEFORE importing the component to ensure our mock is used
let dataRef: Ref<unknown> = ref(null);
let errorRef: Ref<unknown> = ref(null);
let isErrorRef: Ref<boolean> = ref(false);
// Use unknown to satisfy lint rules; we only assert known fields later
vi.mock('@tanstack/vue-query', () => {
  return {
    useQuery: vi.fn((_opts: unknown) => {
      return { data: dataRef, error: errorRef, isError: isErrorRef };
    }),
    useQueryClient: () => ({
      getQueryData: vi.fn(),
      setQueryData: vi.fn(),
      invalidateQueries: vi.fn(),
      refetchQueries: vi.fn(),
    }),
  };
});

vi.mock('~/services/me/meService', () => {
  return {
    meService: {
      fetchProfile: vi.fn().mockResolvedValue({ success: true, data: { id: 'x' } }),
    },
  };
});
/* eslint-disable import/first */
import SettingsLayout from '@/layouts/settings.vue';
import { meService } from '~/services/me/meService';
/* eslint-enable import/first */

mockNuxtImport('useI18n', () => {
  return () => ({
    locale: { value: 'en' },
    localeProperties: { value: { dir: 'ltr' } },
  });
});

// Mock Pinia user store composable used by the layout
type MockStore = { setUser: ReturnType<typeof vi.fn>; error: string | null };
let store: MockStore;
mockNuxtImport('useUserStore', () => {
  return () => store;
});

describe('Settings Layout', () => {
  // Reset store and refs before each test
  beforeEach(() => {
    store = { setUser: vi.fn(), error: null };
    dataRef = ref(null);
    errorRef = ref(null);
    isErrorRef = ref(false);
    // Reset mocked useQuery call history between tests
    const uq = (VueQuery as unknown as { useQuery: ReturnType<typeof vi.fn> }).useQuery;
    uq.mockClear();
  });
  it('renders default slot content', async () => {
    const wrapper = await mountSuspended(SettingsLayout, {
      slots: {
        default: '<div class="slot-content">Main Content</div>',
      },
      global: {
        stubs: {
          SideBarLeft: true,
          SettingsSettingsSection: true,
          NuxtImg: true,
          Icon: true,
        },
      },
    });

    expect(wrapper.html()).toContain('Main Content');
    const right = wrapper.find('div.flex-1.border');
    expect(right.exists()).toBe(true);
  });

  it('renders the left sidebar container', async () => {
    const wrapper = await mountSuspended(SettingsLayout, {
      global: {
        stubs: {
          SideBarLeft: true,
          SettingsSettingsSection: true,
          NuxtImg: true,
          Icon: true,
        },
      },
    });
    expect(wrapper.html()).toContain('w-16');
    expect(wrapper.html()).toContain('sticky');
    expect(wrapper.html()).toContain('top-0');
  });

  it('shows the settings section only on large screens', async () => {
    const wrapper = await mountSuspended(SettingsLayout, {
      global: {
        stubs: {
          SideBarLeft: true,
          SettingsSettingsSection: true,
          NuxtImg: true,
          Icon: true,
        },
      },
    });
    const settingsSection = wrapper.find('[class*="hidden"][class*="lg:block"][class*="border"]');
    expect(settingsSection.exists()).toBe(true);
  });

  it('has proper responsive container structure', async () => {
    const wrapper = await mountSuspended(SettingsLayout, {
      global: {
        stubs: {
          SideBarLeft: true,
          SettingsSettingsSection: true,
          NuxtImg: true,
          Icon: true,
        },
      },
    });

    expect(wrapper.html()).toContain('max-w-7xl');
    expect(wrapper.html()).toContain('min-h-screen');
  });

  it('applies theme/background classes', async () => {
    const wrapper = await mountSuspended(SettingsLayout, {
      global: {
        stubs: {
          SideBarLeft: true,
          SettingsSettingsSection: true,
          NuxtImg: true,
          Icon: true,
        },
      },
    });

    expect(wrapper.html()).toContain('bg-background');
    expect(wrapper.html()).toContain('border');
  });

  it('passes correct options to useQuery and invokes queryFn', async () => {
    await mountSuspended(SettingsLayout, {
      global: {
        stubs: {
          SideBarLeft: true,
          SettingsSettingsSection: true,
          NuxtImg: true,
          Icon: true,
        },
      },
    });
    const uq = (VueQuery as unknown as { useQuery: ReturnType<typeof vi.fn> }).useQuery;
    expect(uq).toHaveBeenCalledTimes(1);
    expect(uq.mock.calls.length).toBeGreaterThan(0);
    const opts = uq.mock.calls[0]?.[0] as {
      queryKey: unknown[];
      queryFn: () => Promise<unknown>;
      refetchOnMount: boolean;
      refetchOnWindowFocus: boolean;
      staleTime: number;
    };
    expect(opts.queryKey).toEqual(['layout-data']);
    expect(opts.refetchOnMount).toBe(false);
    expect(opts.refetchOnWindowFocus).toBe(false);
    expect(opts.staleTime).toBe(1000 * 60 * 5);
    // Call the inline queryFn to raise function coverage
    await opts.queryFn();
    expect(meService.fetchProfile).toHaveBeenCalledTimes(1);
  });

  it('syncs user into store when query succeeds (immediate watch path)', async () => {
    const fakeUser = { id: 'u1', username: 'tester' };
    dataRef.value = { success: true, data: fakeUser };
    await mountSuspended(SettingsLayout, {
      global: {
        stubs: {
          SideBarLeft: true,
          SettingsSettingsSection: true,
          NuxtImg: true,
          Icon: true,
        },
      },
    });
    // force nextTick to allow watch(immediate) to run
    await nextTick();
    expect(store.setUser).toHaveBeenCalledTimes(1);
    expect(store.setUser).toHaveBeenCalledWith(fakeUser);
    expect(store.error).toBeNull();
  });

  it('sets store.error when query fails (error branch)', async () => {
    dataRef.value = { success: false };
    isErrorRef.value = true;
    errorRef.value = { message: 'boom' };
    await mountSuspended(SettingsLayout, {
      global: {
        stubs: {
          SideBarLeft: true,
          SettingsSettingsSection: true,
          NuxtImg: true,
          Icon: true,
        },
      },
    });
    await nextTick();
    expect(store.setUser).not.toHaveBeenCalled();
    expect(store.error).toBe('boom');
  });
});
