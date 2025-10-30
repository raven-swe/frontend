import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import ProfileLayout from '@/layouts/profile.vue';

vi.mock('#app/components/nuxt-layout', () => ({
  default: { name: 'NuxtLayout', template: '<div><slot /></div>' },
}));

vi.mock('~/components/profile/ProfileDetails.vue', () => ({
  default: { name: 'ProfileDetails', template: '<div>Profile Details</div>' },
}));
vi.mock('~/components/ui/Tabs.vue', () => ({
  default: { name: 'Tabs', template: '<div><slot /></div>' },
}));
vi.mock('~/components/ui/Tab.vue', () => ({
  default: { name: 'Tab', props: ['label'], template: '<div>{{ label }}</div>' },
}));
vi.mock('~/components/ui/Spinner.vue', () => ({
  default: { name: 'Spinner', template: '<div>Spinner</div>' },
}));

vi.mock('@/composables/useUserProfile', () => ({
  useUserProfile: () => ({
    userProfile: {},
    error: null,
    loading: false,
  }),
}));

describe('ProfileLayout.vue', () => {
  it('mounts successfully', () => {
    const wrapper = mount(ProfileLayout, {
      global: {
        mocks: {
          //  Provide both mocks to avoid undefined errors
          $t: (msg: string) => msg,
          $route: { path: '/profile/johndoe', params: { username: 'johndoe' } },
        },
      },
    });
    expect(wrapper.exists()).toBe(true);
  });
});
