import { it, describe, expect, vi } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import FollowerFollowingLayout from '~/layouts/follower-following.vue';
import { createI18n } from 'vue-i18n';
import messages from '@@/i18n/locales/en.json';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';

const i18n = createI18n({ locale: 'en', messages: { en: messages } });

// Mock the profileTabsService
const profileTabsServiceMock = vi.hoisted(() => ({
  getProfile: vi.fn(),
}));

vi.mock('~/services/profile/profileTabsService', () => ({
  profileTabsService: profileTabsServiceMock,
}));

describe('FollowerFollowing Layout', () => {
  it('renders follower tab content', async () => {
    const queryClient = new QueryClient();
    profileTabsServiceMock.getProfile.mockResolvedValue({
      username: 'testuser',
      displayName: 'Test User',
      mutualsCount: 0,
    });
    const wrapper = await mountSuspended(FollowerFollowingLayout, {
      slots: {
        default: '<div class="follower-content">Follower Content</div>',
      },
      route: {
        path: '/profile/testuser/followers',
      },
      global: {
        plugins: [i18n],
        stubs: {
          // Prevent rendering the full default layout tree
          NuxtLayout: {
            template: '<div><slot /></div>',
          },
          // Render a real button and forward component click
          UiButton: {
            emits: ['click'],
            template: '<button v-bind="$attrs" @click="$emit(\'click\')"><slot /></button>',
          },
          UiTabs: true,
          UiTab: true,
          Icon: true,
        },
      },
    });

    expect(wrapper.html()).toContain('Follower Content');
    expect(profileTabsServiceMock.getProfile).toHaveBeenCalledWith(
      'testuser',
      expect.any(AbortSignal),
    );
    expect(wrapper.text()).toContain('@testuser');
    expect(wrapper.text()).toContain('Test User');
  });

  it('renders back button and works correctly', async () => {
    const queryClient = new QueryClient();
    profileTabsServiceMock.getProfile.mockResolvedValue({
      username: 'testuser',
      displayName: 'Test User',
      mutualsCount: 0,
    });
    const wrapper = await mountSuspended(FollowerFollowingLayout, {
      slots: {
        default: '<div class="following-content">Following Content</div>',
      },
      route: {
        path: '/profile/testuser/following',
        state: {
          name: '/profile/testuser',
        },
      },
      global: {
        plugins: [i18n],
        stubs: {
          NuxtLayout: { template: '<div><slot /></div>' },
          UiButton: {
            emits: ['click'],
            template: '<button v-bind="$attrs" @click="$emit(\'click\')"><slot /></button>',
          },
          UiTabs: true,
          UiTab: true,
          Icon: true,
        },
      },
    });
    const spy = vi.spyOn(wrapper.vm.$router, 'back').mockImplementation(() => {});
    const backButton = wrapper.find('button[data-test="back-button"]');
    expect(backButton.exists()).toBe(true);
    await backButton.trigger('click');
    expect(spy).toHaveBeenCalled();
  });
});
