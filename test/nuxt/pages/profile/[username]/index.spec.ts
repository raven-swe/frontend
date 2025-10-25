import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ProfilePage from '~/pages/profile/[username]/index.vue';

describe('ProfilePage', () => {
  const createWrapper = () => {
    return mount(ProfilePage);
  };

  it('renders the page', () => {
    const wrapper = createWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  it('renders all posts', () => {
    const wrapper = createWrapper();
    const posts = wrapper.findAll('p');
    expect(posts).toHaveLength(3);
  });
});
