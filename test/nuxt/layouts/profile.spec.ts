import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import profile from '~/layouts/profile.vue';
import ProfileDetails from '~/components/profile/ProfileDetails.vue';
import Tabs from '@/components/ui/Tabs.vue';
import Tab from '@/components/ui/Tab.vue';

// Mock i18n
const mockT = (key: string) => key;

describe('profile', () => {
  const createWrapper = (route = '/profile') => {
    return mount(profile, {
      global: {
        components: {
          ProfileDetails,
          Tabs,
          Tab,
        },
        mocks: {
          $t: mockT,
          $route: {
            path: route,
          },
        },
        stubs: {
          NuxtLayout: {
            template: '<div data-nuxt-layout><slot /></div>',
          },
          NuxtLink: {
            template: '<a :href="to"><slot /></a>',
            props: ['to'],
          },
        },
      },
    });
  };

  it('renders ProfileDetails component', () => {
    const wrapper = createWrapper();
    expect(wrapper.findComponent(ProfileDetails).exists()).toBe(true);
  });

  it('renders Tabs component', () => {
    const wrapper = createWrapper();
    expect(wrapper.findComponent(Tabs).exists()).toBe(true);
  });

  // this & all similar need to be updated after implementing authentication logic
  // because the fourth tab "likes" conditionally appears based on user auth status
  it('renders all three tab components', () => {
    const wrapper = createWrapper();
    const tabs = wrapper.findAllComponents(Tab);
    expect(tabs).toHaveLength(4);
  });

  it('renders tabs with correct labels', () => {
    const wrapper = createWrapper();
    const tabs = wrapper.findAllComponents(Tab);

    expect(tabs.at(0)?.props('label')).toBe('profile.tabs.posts');
    expect(tabs.at(1)?.props('label')).toBe('profile.tabs.replies');
    expect(tabs.at(2)?.props('label')).toBe('profile.tabs.media');
    expect(tabs.at(3)?.props('label')).toBe('profile.tabs.likes');
  });

  it('renders tabs with correct routes', () => {
    const wrapper = createWrapper();
    const tabs = wrapper.findAllComponents(Tab);

    expect(tabs.at(0)?.props('route')).toBe('/profile');
    expect(tabs.at(1)?.props('route')).toBe('/profile/replies');
    expect(tabs.at(2)?.props('route')).toBe('/profile/media');
    expect(tabs.at(3)?.props('route')).toBe('/profile/likes');
  });

  it('sets posts tab as active when on /profile route', () => {
    const wrapper = createWrapper('/profile');
    const tabs = wrapper.findAllComponents(Tab);

    expect(tabs.at(0)?.props('isActive')).toBe(true);
    expect(tabs.at(1)?.props('isActive')).toBe(false);
    expect(tabs.at(2)?.props('isActive')).toBe(false);
    expect(tabs.at(3)?.props('isActive')).toBe(false);
  });

  it('renders the slot for dynamic content', () => {
    const wrapper = mount(profile, {
      global: {
        components: { ProfileDetails, Tabs, Tab },
        mocks: {
          $t: mockT,
          $route: { path: '/profile' },
        },
        stubs: {
          NuxtLayout: {
            template: '<div data-nuxt-layout><slot /></div>',
          },
          NuxtLink: {
            template: '<a :href="to"><slot /></a>',
            props: ['to'],
          },
        },
      },
      slots: {
        default: '<div class="test-content">Child content</div>',
      },
    });

    expect(wrapper.find('.test-content').exists()).toBe(true);
    expect(wrapper.find('.test-content').text()).toBe('Child content');
  });
});
