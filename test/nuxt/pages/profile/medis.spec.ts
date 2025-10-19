import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import MediaPage from '~/pages/profile/media.vue';

describe('MediaPage', () => {
  const createWrapper = () => {
    return mount(MediaPage);
  };

  it('renders the page', () => {
    const wrapper = createWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  it('renders all posted media', () => {
    const wrapper = createWrapper();
    const posts = wrapper.findAll('p');
    expect(posts).toHaveLength(3);
  });
});
