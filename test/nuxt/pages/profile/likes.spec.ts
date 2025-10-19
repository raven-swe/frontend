import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import LikesPage from '~/pages/profile/likes.vue';

describe('LikesPage', () => {
  const createWrapper = () => {
    return mount(LikesPage);
  };

  it('renders the page', () => {
    const wrapper = createWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  it('renders all likes posts', () => {
    const wrapper = createWrapper();
    const posts = wrapper.findAll('p');
    expect(posts).toHaveLength(3);
  });
});
